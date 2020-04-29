import { mnemonicToSeed, mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { Keyring } from '@polkadot/api'
import AttesterChain from './Attester.chain'
import { actorSetupChain } from '../testSetup/testSetup.chain'
import Accumulator from './Accumulator'
import Blockchain from '../blockchain/Blockchain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { AttesterPublicKey, AttesterPrivateKey } from '../types/Attestation'
import Claimer from '../claim/Claimer'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test Attester on chain', () => {
  let claimer: Claimer
  let attester: AttesterChain
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
  // NOTE: if this test fails after updating @polkadot packages, we should adjust Attester.chain.ts
  // see issue https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
  it('Should generate correct keypair for signature type sr25519', async () => {
    const mnemonic = AttesterChain.generateMnemonic()
    const miniSecretSeed = mnemonicToMiniSecret(mnemonic)
    const seed = mnemonicToSeed(mnemonic)
    const { address: attesterAddress } = await AttesterChain.buildFromMnemonic(
      new AttesterPublicKey('pb'),
      new AttesterPrivateKey('pk'),
      mnemonic
    )
    const {
      address: attesterAddressFromURI,
    } = await AttesterChain.buildFromURI(
      new AttesterPublicKey('pb'),
      new AttesterPrivateKey('pk'),
      mnemonic
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
  }, 10000)
  // NOTE: if this test fails after updating @polkadot packages, we should adjust Attester.chain.ts
  // see issue https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
  it('Should generate correct keypair for signature type ed25519', async () => {
    const mnemonic = AttesterChain.generateMnemonic()
    const seed = mnemonicToSeed(mnemonic)
    const { address: attesterAddress } = await AttesterChain.buildFromMnemonic(
      new AttesterPublicKey('pb'),
      new AttesterPrivateKey('pk'),
      mnemonic,
      'ed25519'
    )
    const {
      address: attesterAddressFromURI,
    } = await AttesterChain.buildFromURI(
      new AttesterPublicKey('pb'),
      new AttesterPrivateKey('pk'),
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
  }, 10000)
  it('Should generate new mnemonic with every call', () => {
    const mnemonics = new Array(5)
      .fill(0)
      .map(() => AttesterChain.generateMnemonic())
    mnemonics.forEach((mnemonic, idx) => {
      expect(typeof mnemonic).toBe('string')
      expect(mnemonic.split(' ')).toHaveLength(12)
      expect(mnemonic).not.toBe(mnemonics[(idx + 1) % mnemonics.length])
      return true
    })
  })
  it('Should updateAccumulator', async () => {
    const accUpdate = new Accumulator('updatedAccumulator')
    await expect(attester.updateAccumulator(accUpdate)).resolves.toBeUndefined()
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
    ).resolves.toBeTruthy()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(0)
    expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(0)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledTimes(1)
    const latestAccumulator = await chain.getLatestAccumulator(attester.address)
    expect(api.tx.portablegabi.updateAccumulator).toHaveBeenCalledWith(
      latestAccumulator.toString()
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
    ).resolves.toBeTruthy()
    expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(2)
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
      latestAccumulator.toString()
    )
  }, 10000)
})
