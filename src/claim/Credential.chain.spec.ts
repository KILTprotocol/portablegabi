import { stringToHex } from '@polkadot/util'
import GabiAttesterChain from '../attestation/GabiAttester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from '../attestation/Accumulator'
import { attestationSetup, actorSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { AttesterPublicKey } from '../types/Attestation'
import Credential from './Credential'
import GabiClaimer from './GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import BlockchainError from '../blockchain/BlockchainError'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')
const apiMultiQuery = (api.query.portablegabi.accumulatorList as any).multi

describe('Test Credential on chain functionality', () => {
  let claimer: GabiClaimer
  let attesterChain: GabiAttesterChain
  let attester: GabiAttester
  let accumulator: Accumulator
  let credential: Credential
  let attesterChainAddress: string
  let attesterPubKey: AttesterPublicKey
  let accumulators: Accumulator[]
  beforeAll(async () => {
    api.query.portablegabi.accumulatorList.mockReturnValueOnce([] as any)
    // on chain attester
    ;({
      attesters: [attesterChain],
      claimers: [claimer],
    } = await actorSetupChain({}))
    accumulator = await attesterChain.createAccumulator()
    ;({
      address: attesterChainAddress,
      publicKey: attesterPubKey,
    } = attesterChain.getPublicIdentity())
    await attesterChain.updateAccumulator(accumulator).catch(e => {
      expect(e.message).toBe("Cannot read property 'signAndSend' of undefined")
    })
    // off chain attester to prevent error after revocation due to accumulator update
    ;({
      attesters: [attester],
    } = await actorSetup())
    // attest credential
    ;({ credential } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    }))
    // attest 2 more credentials that will be revoked
    const attestations = await Promise.all(
      [0, 1, 2].map(() => attestationSetup({ claimer, attester, accumulator }))
    )
    // get witnesses for revocation
    const witnesses = attestations.map(a => a.witness)
    // revoke
    const accAfterRev1 = await attester.revokeAttestation({
      accumulator,
      witnesses: [witnesses[0]],
    })
    const accAfterRev2 = await attester.revokeAttestation({
      accumulator: accAfterRev1,
      witnesses: [witnesses[0]],
    })
    //
    accumulators = [accumulator, accAfterRev1, accAfterRev2]
  })
  it('Should create + update fresh accumulators when missing on chain for attesterChain in setup', async () => {
    api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(0)
    api.query.portablegabi.accumulatorList.mockResolvedValueOnce([] as any)
    const { accumulators: newAccumulators } = await actorSetupChain({})
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledTimes(2)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      newAccumulators[0].valueOf()
    )
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      newAccumulators[1].valueOf()
    )
  })
  it('Should throw when updating credential from chain with only address missing accumulators (maxIndex === 0)', async () => {
    api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(0)
    await expect(
      credential.updateFromChain({
        attesterPubKey,
        attesterChainAddress,
      })
    ).rejects.toThrowError(BlockchainError.maxIndexZero(attesterChainAddress))
  })
  it('Should throw when updating credential from chain with only address and missing accumulator at index 1', async () => {
    api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(1)
    apiMultiQuery.mockResolvedValue([stringToHex('nonempty'), 0x00])
    await expect(
      credential.updateFromChain({
        attesterPubKey,
        attesterChainAddress,
      })
    ).rejects.toThrowError(
      BlockchainError.missingAccAtIndex(attesterChainAddress, 1)
    )
  })
  it('Should update credential from chain with only address input (# of new accs: 1)', async () => {
    apiMultiQuery.mockResolvedValueOnce([stringToHex(accumulator.valueOf())])
    const credUpdated = await credential.updateFromChain({
      attesterPubKey,
      attesterChainAddress,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(apiMultiQuery).toHaveBeenCalledTimes(1)
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.valueOf()).toStrictEqual(credential.valueOf())
  })
  it('Should update credential from chain with only address input (# of new accs: 2)', async () => {
    apiMultiQuery.mockResolvedValueOnce([
      stringToHex(accumulators[1].valueOf()),
      stringToHex(accumulators[2].valueOf()),
    ])
    expect(credential.getUpdateCounter()).toEqual(0)
    const credUpdated = await credential.updateFromChain({
      attesterPubKey: attester.publicKey,
      attesterChainAddress,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(apiMultiQuery).toHaveBeenCalledTimes(1)
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.getUpdateCounter()).toEqual(2)
    expect(credUpdated.valueOf()).not.toStrictEqual(credential.valueOf())
  })
  it('Should update credential from chain with index input (# of new accs: 1)', async () => {
    apiMultiQuery.mockResolvedValueOnce([stringToHex(accumulator.valueOf())])
    const credUpdated = await credential.updateFromChain({
      attesterPubKey,
      attesterChainAddress,
      endIndex: 1,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(apiMultiQuery).toHaveBeenCalledTimes(1)
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.valueOf()).toStrictEqual(credential.valueOf())
  })
  it('Should update credential from chain with index input (# of new accs: 2)', async () => {
    apiMultiQuery.mockResolvedValueOnce([
      stringToHex(accumulators[1].valueOf()),
      stringToHex(accumulators[2].valueOf()),
    ])
    expect(credential.getUpdateCounter()).toEqual(0)
    const credUpdated = await credential.updateFromChain({
      attesterPubKey: attester.publicKey,
      attesterChainAddress,
      endIndex: 2,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(apiMultiQuery).toHaveBeenCalledTimes(1)
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.getUpdateCounter()).toEqual(2)
    expect(credUpdated.valueOf()).not.toStrictEqual(credential.valueOf())
  })
})
