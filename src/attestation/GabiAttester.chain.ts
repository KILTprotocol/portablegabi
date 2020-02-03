import { KeyringPair } from '@polkadot/keyring/types'
import { Keyring } from '@polkadot/api'
import generate from '@polkadot/util-crypto/mnemonic/generate'
import GabiAttester from './GabiAttester'
import IGabiAttester, {
  Accumulator,
  Witness,
  AttesterPublicKey,
} from '../types/Attestation'
import getCached from '../blockchain/BlockchainApiConnection'

interface IGabiAttesterChain extends IGabiAttester {
  getPublicIdentity: () => {
    publicKey: AttesterPublicKey
    address: string
  }
  revokeAttestation: ({
    witness,
    accumulator,
  }: {
    witness: Witness
    accumulator?: Accumulator
  }) => Promise<Accumulator>
  updateAccumulator: (accumulator: Accumulator) => Promise<void>
}

export default class GabiAttesterChain extends GabiAttester
  implements IGabiAttesterChain {
  private readonly keyringPair: KeyringPair

  public static generateMnemonic(): string {
    return generate()
  }

  public static buildFromMnemonic(
    publicKey: string,
    privateKey: string,
    str: string,
    type: 'sr25519' | 'ed25519' = 'sr25519'
  ): GabiAttesterChain {
    const keyring = new Keyring({ type })
    const keyringPair = keyring.addFromUri(`${str}`)
    return new GabiAttesterChain(publicKey, privateKey, keyringPair)
  }

  private constructor(
    publicKey: string,
    privateKey: string,
    keyringPair: KeyringPair
  ) {
    super(publicKey, privateKey)
    this.keyringPair = keyringPair
  }

  public getPublicIdentity(): {
    publicKey: AttesterPublicKey
    address: string
  } {
    return {
      publicKey: super.getPubKey(),
      address: this.keyringPair.address,
    }
  }

  public async updateAccumulator(accumulator: Accumulator): Promise<void> {
    return (await getCached()).updateAccumulator(this.keyringPair, accumulator)
  }

  public async revokeAttestation({
    witness,
    accumulator,
  }: {
    witness: Witness
    accumulator?: Accumulator
  }): Promise<Accumulator> {
    const blockchain = await getCached()
    // get latest accumulator if no input is given
    const acc =
      accumulator ||
      (await blockchain.getLatestAccumulator(this.keyringPair.address))
    // revoke attestation + get new accumulator
    const accUpdate = await super.revokeAttestation({
      accumulator: acc,
      witness,
    })

    // accumulator accumulator on chain
    await this.updateAccumulator(accUpdate)
    return accUpdate
  }
}
