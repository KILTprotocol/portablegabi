import { mnemonicToSeed, mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { Keyring } from '@polkadot/api'
import GabiAttesterChain from './GabiAttester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from './Accumulator'
import Blockchain from '../blockchain/Blockchain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import GabiClaimerChain from '../claim/GabiClaimer.chain'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { AttesterPublicKey } from '../types/Attestation'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test GabiAttester on chain', () => {
  let claimer: GabiClaimerChain
  let attester: GabiAttesterChain
  let chain: Blockchain
  let accumulator: Accumulator
  beforeAll(async () => {
    chain = (await connect()) as Blockchain
    api.query.portablegabi.accumulatorList.mockReturnValueOnce([] as any)
    ;({
      attesters: [attester],
      claimers: [claimer],
    } = await actorSetupChain({}))
    accumulator = await attester.createAccumulator()
  })
  // NOTE: if this test fails after updating @polkadot packages, we should adjust GabiAttester.chain.ts
  // see issue https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
  it('Should generate correct keypair for signature type sr25519', async () => {
    const mnemonic = GabiAttesterChain.generateMnemonic()
    const miniSecretSeed = mnemonicToMiniSecret(mnemonic)
    const seed = mnemonicToSeed(mnemonic)
    const {
      address: attesterAddress,
    } = await GabiAttesterChain.buildFromMnemonic(
      new AttesterPublicKey('pb'),
      'pk',
      mnemonic,
      'sr25519'
    )
    const {
      address: attesterAddressFromURI,
    } = await GabiAttesterChain.buildFromURI(
      new AttesterPublicKey('pb'),
      'pk',
      mnemonic,
      'sr25519'
    )
    expect(attesterAddress).toEqual(expect.anything())
    const { address: fromMiniSecret } = new Keyring({
      type: 'sr25519',
    }).addFromSeed(miniSecretSeed)
    const { address: fromSeed } = new Keyring({
      type: 'sr25519',
    }).addFromSeed(seed)
    const { address: fromMnemonic } = new Keyring({
      type: 'sr25519',
    }).addFromMnemonic(mnemonic)
    expect(attesterAddress).toBe(fromMiniSecret)
    expect(attesterAddress).toBe(fromMnemonic)
    expect(attesterAddress).not.toBe(fromSeed)
    expect(attesterAddress).toBe(attesterAddressFromURI)
  })
  // NOTE: if this test fails after updating @polkadot packages, we should adjust GabiAttester.chain.ts
  // see issue https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
  it('Should generate correct keypair for signature type ed25519', async () => {
    const mnemonic = GabiAttesterChain.generateMnemonic()
    const seed = mnemonicToSeed(mnemonic)
    const {
      address: attesterAddress,
    } = await GabiAttesterChain.buildFromMnemonic(
      new AttesterPublicKey('pb'),
      'pk',
      mnemonic,
      'ed25519'
    )
    const {
      address: attesterAddressFromURI,
    } = await GabiAttesterChain.buildFromURI(
      new AttesterPublicKey('pb'),
      'pk',
      mnemonic,
      'ed25519'
    )
    expect(attesterAddress).toEqual(expect.anything())
    const { address: fromSeed } = new Keyring({ type: 'ed25519' }).addFromSeed(
      seed
    )
    const { address: fromMnemonic } = new Keyring({
      type: 'ed25519',
    }).addFromMnemonic(mnemonic)
    expect(attesterAddress).toBe(fromSeed)
    expect(attesterAddress).not.toBe(fromMnemonic)
    expect(attesterAddress).not.toBe(attesterAddressFromURI)
    expect(attesterAddressFromURI).toBe(fromMnemonic)
  })
  it('Should generate new mnemonic with every call', () => {
    const mnemonics = new Array(5)
      .fill(0)
      .map(() => GabiAttesterChain.generateMnemonic())
    mnemonics.map((mnemonic, idx) => {
      expect(typeof mnemonic).toBe('string')
      expect(mnemonic.split(' ')).toHaveLength(12)
      expect(mnemonic).not.toBe(mnemonics[(idx + 1) % mnemonics.length])
      return true
    })
  })
  it('Should updateAccumulator', async () => {
    const accUpdate = new Accumulator('updatedAccumulator')
    await expect(attester.updateAccumulator(accUpdate)).rejects.toThrowError(
      "Cannot read property 'signAndSend' of undefined"
    )
    await expect(
      chain.getLatestAccumulator(attester.address)
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
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(0)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(0)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledTimes(1)
    const latestAccumulator = await chain.getLatestAccumulator(attester.address)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
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
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledWith(
      attester.address
    )
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledWith([
      attester.address,
      attester.address.length - 1,
    ])
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledTimes(1)
    const latestAccumulator = await chain.getLatestAccumulator(attester.address)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      latestAccumulator.valueOf()
    )
  })
})
