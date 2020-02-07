import { mnemonicGenerate } from '@polkadot/util-crypto'
import GabiAttesterChain from './GabiAttester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from './Accumulator'
import Blockchain from '../blockchain/Blockchain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import GabiClaimerChain from '../claim/GabiClaimer.chain'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test GabiAttester on chain', () => {
  let claimer: GabiClaimerChain
  let attester: GabiAttesterChain
  let chain: Blockchain
  let accumulator: Accumulator
  beforeAll(async () => {
    chain = await connect()
    api.query.portablegabiPallet.accumulatorList.mockReturnValueOnce([] as any)
    ;({
      attesters: [attester],
      claimers: [claimer],
    } = await actorSetupChain())
    accumulator = await attester.createAccumulator()
  })
  it('Should generate mnemonic for signature type sr25519', async () => {
    expect(
      GabiAttesterChain.buildFromMnemonic('pb', 'pk', mnemonicGenerate(12))
    ).toEqual(expect.anything())
  })
  it('Should generate mnemonic for signature type ed25519', async () => {
    expect(
      GabiAttesterChain.buildFromMnemonic(
        'pb',
        'pk',
        mnemonicGenerate(12),
        'ed25519'
      )
    ).toEqual(expect.anything())
  })
  it('Should generate new mnemonic with every call', () => {
    const mnemonics = new Array(5)
      .fill(0)
      .map(() => GabiAttesterChain.generateMnemonic())
    mnemonics.map((mnemonic, idx) => {
      expect(typeof mnemonic).toBe('string')
      expect(mnemonic.split(' ')).toHaveLength(12)
      expect(mnemonic).not.toBe(mnemonics[(idx + 1) % mnemonics.length])
    })
  })
  it('Should updateAccumulator', async () => {
    const accUpdate = new Accumulator('updatedAccumulator')
    await expect(attester.updateAccumulator(accUpdate)).rejects.toThrowError(
      "Cannot read property 'signAndSend' of undefined"
    )
    await expect(
      chain.getLatestAccumulator(attester.getPublicIdentity().address)
    ).resolves.toStrictEqual(accUpdate)
  })
  it('Should revoke attestation with accumulator input', async () => {
    const { witness: witnessRev } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    })
    await expect(
      attester.revokeAttestation({ witnesses: [witnessRev], accumulator })
    ).rejects.toThrowError("Cannot read property 'signAndSend' of undefined")
    expect(api.query.portablegabiPallet.accumulatorCount).toHaveBeenCalledTimes(
      0
    )
    expect(api.query.portablegabiPallet.accumulatorList).toHaveBeenCalledTimes(
      0
    )
    expect(api.tx.portablegabiPallet.updateAccumulator).toHaveBeenCalledTimes(1)
    const latestAccumulator = await chain.getLatestAccumulator(
      attester.getPublicIdentity().address
    )
    expect(api.tx.portablegabiPallet.updateAccumulator).toHaveBeenCalledWith(
      latestAccumulator.valueOf()
    )
  })
  it('Should revoke attestation without accumulator input', async () => {
    const { witness: witnessRev } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    })
    await expect(
      attester.revokeAttestation({ witnesses: [witnessRev] })
    ).rejects.toThrowError("Cannot read property 'signAndSend' of undefined")
    expect(api.query.portablegabiPallet.accumulatorCount).toHaveBeenCalledTimes(
      1
    )
    expect(api.query.portablegabiPallet.accumulatorCount).toHaveBeenCalledWith(
      attester.getPublicIdentity().address
    )
    expect(api.query.portablegabiPallet.accumulatorList).toHaveBeenCalledTimes(
      1
    )
    expect(api.query.portablegabiPallet.accumulatorList).toHaveBeenCalledWith([
      attester.getPublicIdentity().address,
      attester.getPublicIdentity().address.length - 1,
    ])
    expect(api.tx.portablegabiPallet.updateAccumulator).toHaveBeenCalledTimes(1)
    const latestAccumulator = await chain.getLatestAccumulator(
      attester.getPublicIdentity().address
    )
    expect(api.tx.portablegabiPallet.updateAccumulator).toHaveBeenCalledWith(
      latestAccumulator.valueOf()
    )
  })
})
