import GabiAttesterChain from '../attestation/GabiAttester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from '../attestation/Accumulator'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { AttesterPublicKey } from '../types/Attestation'
import Credential from './Credential'
import GabiClaimer from './GabiClaimer'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test GabiAttester on chain', () => {
  let claimer: GabiClaimer
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
    const credUpdated = await credential.updateFromChain({
      attesterPubKey,
      attesterChainAddress,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledWith([
      attesterChainAddress,
      attesterChainAddress.length - 1,
    ])
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.valueOf()).toStrictEqual(credential.valueOf())
  })
  it('Should update credential with index input', async () => {
    const credUpdated = await credential.updateFromChain({
      attesterPubKey,
      attesterChainAddress,
      index: 0,
    })
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledWith([
      attesterChainAddress,
      attesterChainAddress.length - 1,
    ])
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attesterChainAddress
    )
    expect(credUpdated).toEqual(expect.anything())
    expect(credUpdated.valueOf()).toStrictEqual(credential.valueOf())
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
