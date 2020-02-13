import GabiAttesterChain from '../attestation/GabiAttester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from '../attestation/Accumulator'
import GabiClaimerChain from './GabiClaimer.chain'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { Credential } from '../types/Claim'
import { AttesterPublicKey } from '../types/Attestation'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test GabiAttester on chain', () => {
  let claimer: GabiClaimerChain
  let attester: GabiAttesterChain
  let accumulator: Accumulator
  let credential: Credential
  let attesterChainAddress: string
  let attesterPubKey: AttesterPublicKey
  beforeAll(async () => {
    api.query.portablegabi.accumulatorList.mockReturnValueOnce([] as any)
    ;({
      attesters: [attester],
      claimers: [claimer],
    } = await actorSetupChain({}))
    accumulator = await attester.createAccumulator()
    ;({ credential } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    }))
    ;({
      address: attesterChainAddress,
      publicKey: attesterPubKey,
    } = attester.getPublicIdentity())
    await attester.updateAccumulator(accumulator).catch(e => {
      expect(e.message).toBe("Cannot read property 'signAndSend' of undefined")
    })
  })
  it('Should update credential with address input', async () => {
    const credUpdated = await claimer.updateCredentialChain({
      credential,
      attesterPubKey,
      attesterChainAddress,
    })
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledWith([
      attesterChainAddress,
      attesterChainAddress.length - 1,
    ])
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated).not.toStrictEqual(credential)
  })
  it('Should update credential with accumulator input', async () => {
    const credUpdated = await claimer.updateCredentialChain({
      credential,
      attesterPubKey,
      _accumulator: accumulator,
    })
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).not.toHaveBeenCalled()
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated).not.toStrictEqual(credential)
  })
  it('Should update credential with both address and accumulator input', async () => {
    const credUpdated = await claimer.updateCredentialChain({
      credential,
      attesterPubKey,
      attesterChainAddress,
      _accumulator: accumulator,
    })
    expect(api.query.portablegabi.accumulatorList).not.toHaveBeenCalled()
    expect(api.query.portablegabi.accumulatorCount).not.toHaveBeenCalled()
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated).not.toStrictEqual(credential)
  })
  it('Should throw when calling updateCredentialChain with neither address nor accumulator', async () => {
    await expect(
      claimer.updateCredentialChain({
        credential,
        attesterPubKey,
      })
    ).rejects.toThrowError(
      "Missing either accumulator or attester's chain address to run updateCredentialClaim"
    )
  })
  it('Should create + update fresh accumulators when missing on chain for attester in setup', async () => {
    api.query.portablegabi.accumulatorCount.mockResolvedValue(0)
    api.query.portablegabi.accumulatorList.mockResolvedValue([] as any)
    const { accumulators } = await actorSetupChain({})
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledTimes(2)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      accumulators[0].valueOf()
    )
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      accumulators[1].valueOf()
    )
  })
})
