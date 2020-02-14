import { KeyringPair } from '@polkadot/keyring/types'
import { Keyring } from '@polkadot/api'
import {
  mnemonicGenerate,
  mnemonicToSeed,
  cryptoWaitReady,
} from '@polkadot/util-crypto'
import { KeypairType } from '@polkadot/util-crypto/types'
import { u8aToHex } from '@polkadot/util'
import GabiAttester from './GabiAttester'
import {
  Witness,
  AttesterPublicKey,
  IGabiAttesterChain,
  IPublicIdentity,
  AttesterPrivateKey,
} from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import Accumulator from './Accumulator'

export default class GabiAttesterChain extends GabiAttester
  implements IGabiAttesterChain {
  private readonly keyringPair: KeyringPair
  public readonly address: string

  public static generateMnemonic(): string {
    return mnemonicGenerate()
  }

  public static async create(
    keypairType: KeypairType = 'sr25519'
  ): Promise<GabiAttesterChain> {
    const { publicKey, privateKey } = await super.genKeyPair()
    const mnemonic = this.generateMnemonic()
    return this.buildFromMnemonic(publicKey, privateKey, mnemonic, keypairType)
  }

  public static async buildFromMnemonic(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    mnemonic: string,
    type: KeypairType = 'sr25519'
  ): Promise<GabiAttesterChain> {
    await cryptoWaitReady()
    // see https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
    if (type === 'sr25519') {
      return this.buildFromURI(publicKey, privateKey, mnemonic, type)
    }
    const keyringPair = new Keyring({ type }).addFromUri(
      u8aToHex(mnemonicToSeed(mnemonic))
    )
    return new GabiAttesterChain(publicKey, privateKey, keyringPair)
  }

  public static async buildFromURI(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    uri: string,
    type: KeypairType = 'sr25519'
  ): Promise<GabiAttesterChain> {
    await cryptoWaitReady()
    const keyring = new Keyring({ type })
    const keyringPair = keyring.addFromUri(uri)
    return new GabiAttesterChain(publicKey, privateKey, keyringPair)
  }

  public constructor(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    keyringPair: KeyringPair
  ) {
    super(publicKey, privateKey)
    this.keyringPair = keyringPair
    this.address = keyringPair.address
  }

  public getPublicIdentity(): IPublicIdentity {
    return {
      publicKey: this.publicKey,
      address: this.address,
    }
  }

  public async updateAccumulator(accumulator: Accumulator): Promise<void> {
    return (await connect()).updateAccumulator(this.keyringPair, accumulator)
  }

  public async revokeAttestation({
    witnesses,
    accumulator,
  }: {
    witnesses: Witness[]
    accumulator?: Accumulator
  }): Promise<Accumulator> {
    const blockchain = await connect()
    // get latest accumulator if no input is given
    const acc =
      accumulator ||
      (await blockchain.getLatestAccumulator(this.keyringPair.address))
    // revoke attestation + get new accumulator
    const accUpdate = await super.revokeAttestation({
      accumulator: acc,
      witnesses,
    })

    // accumulator accumulator on chain
    await this.updateAccumulator(accUpdate)
    return accUpdate
  }
}
