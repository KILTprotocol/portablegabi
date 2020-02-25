/**
 * This module contains the AttesterChain class which adds on-chain functionality to the super [[Attester]] class.
 */
import { KeyringPair } from '@polkadot/keyring/types'
import { Keyring } from '@polkadot/api'
import {
  mnemonicGenerate,
  mnemonicToSeed,
  cryptoWaitReady,
} from '@polkadot/util-crypto'
import { KeypairType } from '@polkadot/util-crypto/types'
import { u8aToHex } from '@polkadot/util'
import Attester from './Attester'
import {
  Witness,
  AttesterPublicKey,
  IAttesterChain,
  AttesterPrivateKey,
} from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import Accumulator from './Accumulator'

/**
 * The AttesterChain extends an [[Attester]]'s creation process and functionality to on-chain compatibility.
 */
export default class AttesterChain extends Attester implements IAttesterChain {
  private readonly keyringPair: KeyringPair
  /**
   * The address of the [[Attester]]'s keyring pair .
   */
  public readonly address: string

  /**
   * Generates a string of words.
   *
   * @returns A mnemonic seed consisting of 12 words.
   */
  public static generateMnemonic(): string {
    return mnemonicGenerate()
  }

  /**
   * Generates a new key pair and returns a new [[AttesterChain]].
   *
   * @param validityDuration The duration for which the public key will be valid.
   * @param maxAttributes The maximum number of attributes that can be signed with the generated private key.
   * @param keypairType The signature scheme used in the keyring pair, either 'sr25519' or 'ed25519'.
   * @returns A [[AttesterChain]] instance including a chain address and a public and private key pair.
   */
  public static async create(
    validityDuration: number,
    maxAttributes: number,
    keypairType: KeypairType = 'sr25519'
  ): Promise<AttesterChain> {
    const { publicKey, privateKey } = await super.genKeyPair(
      validityDuration,
      maxAttributes
    )
    const mnemonic = this.generateMnemonic()
    return this.buildFromMnemonic(publicKey, privateKey, mnemonic, keypairType)
  }

  /**
   * Generates a new [[AttesterChain]] from a mnemonic seed.
   *
   * @param publicKey The public key for the [[Attester]].
   * @param privateKey The private key for the [[Attester]].
   * @param mnemonic The string of words representing a seed.
   * @param type The signature scheme used in the keyring pair, either 'sr25519' or 'ed25519'.
   * @returns An [[AttesterChain]] instance including a chain address and a public and private key pair.
   */
  public static async buildFromMnemonic(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    mnemonic: string,
    type: KeypairType = 'sr25519'
  ): Promise<AttesterChain> {
    await cryptoWaitReady()
    // see https://github.com/polkadot-js/common/blob/d889c71056158df72b34b994506d062c2e731cc0/packages/keyring/src/keyring.ts#L174
    if (type === 'sr25519') {
      return this.buildFromURI(publicKey, privateKey, mnemonic, type)
    }
    const keyringPair = new Keyring({ type }).addFromUri(
      u8aToHex(mnemonicToSeed(mnemonic))
    )
    return new AttesterChain(publicKey, privateKey, keyringPair)
  }

  /**
   * Generates a new [[AttesterChain]] from a mnemonic seed.
   *
   * @param publicKey The public key for the [[Attester]].
   * @param privateKey The private key for the [[Attester]].
   * @param uri The URI to add the keyring pair from, e.g. '//Alice' or '//Bob' for default devnet.
   * @param type The signature scheme used in the keyring pair, either 'sr25519' or 'ed25519'.
   * @returns An [[AttesterChain]] instance including a chain address and a public and private key pair.
   */
  public static async buildFromURI(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    uri: string,
    type: KeypairType = 'sr25519'
  ): Promise<AttesterChain> {
    await cryptoWaitReady()
    const keyring = new Keyring({ type })
    const keyringPair = keyring.addFromUri(uri)
    return new AttesterChain(publicKey, privateKey, keyringPair)
  }

  /**
   * Generates a new [[AttesterChain]] from a keyring pair and pre-generated public and private key pair.
   *
   * @param publicKey The public key for the [[Attester]].
   * @param privateKey The private key for the [[Attester]].
   * @param keyringPair The keyring pair for the [[Attester]].
   * @returns An [[AttesterChain]] instance including a chain address and a public and private key pair.
   */
  public constructor(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey,
    keyringPair: KeyringPair
  ) {
    super(publicKey, privateKey)
    this.keyringPair = keyringPair
    this.address = keyringPair.address
  }

  /**
   * Generates a new [[AttesterChain]] from a keyring pair and pre-generated public and private key pair.
   *
   * @param accumulator The new [[Accumulator]] which will be put onto the accumulatorList chain storage.
   */
  public async updateAccumulator(accumulator: Accumulator): Promise<void> {
    return (await connect()).updateAccumulator(this.keyringPair, accumulator)
  }

  /**
   * Revokes an [[Attestation]] which corresponds to the provided [[Witness]] and updates [[Accumulator]] on chain.
   *
   * @param p The parameter object.
   * @param p.witness The [[Witness]] belonging to the [[Attestation]] which is about to be revoked.
   * @param p.accumulator The current [[Accumulator]] which will updated after revocation.
   * @returns An updated version of the [[Accumulator]].
   */
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
