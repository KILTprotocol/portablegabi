import { AttestationRequest } from '../types/Claim'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from './Accumulator'
import IAttester, {
  IGabiMsgSession,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Witness,
  Attestation,
  AttesterPublicKey,
  AttesterPrivateKey,
  KeyLength,
  DEFAULT_MAX_ATTRIBUTES,
  DEFAULT_VALIDITY_DURATION,
  DEFAULT_KEY_LENGTH,
} from '../types/Attestation'

export type KeyGenOptions = {
  validityDuration?: number
  maxAttributes?: number
  keyLength?: KeyLength
}

/**
 * Converts days to nano seconds.
 *
 * @param days The amount of days that should be converted.
 * @returns The amount of nanoseconds for the specified amount of days.
 * @internal
 */
export function daysToNanoSecs(days: number): number {
  return days * 24 * 60 * 60 * 1000 * 1000 * 1000
}

/**
 * The Attester can be used to create and revoke [[Attestation]]s of [[Credential]]s.
 */
export default class Attester implements IAttester {
  readonly privateKey: AttesterPrivateKey
  readonly publicKey: AttesterPublicKey

  /**
   * Generates a new key pair.
   *
   * @param options An optional object containing options for the key generation.
   * @param options.validityDuration The duration in days for which the public key will be valid.
   * @param options.maxAttributes The maximum number of attributes that can be signed with the generated private key.
   * @param options.keyLength The key length of the new key pair. Note that this key will only support credentials and claimer with the same key length.
   * @returns A newly generated key pair.
   */
  public static async genKeyPair({
    validityDuration,
    maxAttributes,
    keyLength,
  }: KeyGenOptions = {}): Promise<{
    privateKey: AttesterPrivateKey
    publicKey: AttesterPublicKey
  }> {
    const durationInNanoSecs = daysToNanoSecs(
      validityDuration || DEFAULT_VALIDITY_DURATION
    )
    const { privateKey, publicKey } = await goWasmExec<{
      privateKey: string
      publicKey: string
    }>(WasmHooks.genKeypair, [
      maxAttributes || DEFAULT_MAX_ATTRIBUTES,
      durationInNanoSecs,
      keyLength || DEFAULT_KEY_LENGTH,
    ])
    return {
      privateKey: new AttesterPrivateKey(privateKey),
      publicKey: new AttesterPublicKey(publicKey),
    }
  }

  /**
   * Generates a new key pair and returns a new [[Attester]].
   *
   * @param options An optional object containing options for the key generation.
   * @param options.validityDuration The duration in days for which the public key will be valid.
   * @param options.maxAttributes The maximal number of attributes that can be signed with the generated private key.
   * @param options.keyLength The key length of the new key pair. Note that this key will only support credentials and claimer with the same key length.
   * @returns A new [[Attester]].
   */
  public static async create(options: KeyGenOptions = {}): Promise<Attester> {
    const { publicKey, privateKey } = await this.genKeyPair(options)
    return new Attester(publicKey, privateKey)
  }

  /**
   * Constructs a new [[Attester]] using an existing private and public key pair.
   *
   * @param publicKey The public key for the [[Attester]].
   * @param privateKey The private key for the [[Attester]].
   */
  public constructor(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey
  ) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  /**
   * Initiates the attestation session.
   *
   * @returns A session and a message object. The message should be sent over to the [[Claimer]].
   */
  public async startAttestation(): ReturnType<IAttester['startAttestation']> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startAttestationSession,
      [this.privateKey.toString(), this.publicKey.toString()]
    )
    return {
      message: new InitiateAttestationRequest(message),
      session: new AttesterAttestationSession(session),
    }
  }

  /**
   * Creates a new accumulator.
   *
   * @returns A new [[Accumulator]].
   */
  public async createAccumulator(): ReturnType<IAttester['createAccumulator']> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.createAccumulator, [
        this.privateKey.toString(),
        this.publicKey.toString(),
      ])
    )
  }

  /**
   * Creates an [[Attestation]] for the claim inside the [[AttestationRequest]].
   *
   * @param p The parameter object.
   * @param p.attestationSession The [[Attestation]] session which was generated during [[startAttestation]].
   * @param p.attestationRequest The [[AttestationRequest]] received from the [[Claimer]].
   * @param p.accumulator The most recent [[Accumulator]].
   * @returns The [[Attestation]] object which should be sent to the [[Claimer]] and a [[Witness]] which can be used to revoke the attestation.
   */
  public async issueAttestation({
    attestationSession,
    attestationRequest,
    accumulator,
  }: {
    attestationSession: AttesterAttestationSession
    attestationRequest: AttestationRequest
    accumulator: Accumulator
  }): ReturnType<IAttester['issueAttestation']> {
    const { attestation, witness } = await goWasmExec<{
      attestation: string
      witness: string
    }>(WasmHooks.issueAttestation, [
      this.privateKey.toString(),
      this.publicKey.toString(),
      attestationSession.toString(),
      attestationRequest.toString(),
      accumulator.toString(),
    ])
    return {
      attestation: new Attestation(attestation),
      witness: new Witness(witness),
    }
  }

  /**
   * Revokes an [[Attestation]] which corresponds to the provided [[Witness]].
   *
   * @param p The parameter object.
   * @param p.accumulator The current [[Accumulator]].
   * @param p.witnesses The revocation [[Witness]]es belonging to the [[Attestation]] which is about to be revoked.
   * @returns An updated version of the [[Accumulator]].
   */
  public async revokeAttestation({
    accumulator,
    witnesses,
  }: {
    accumulator: Accumulator
    witnesses: Witness[]
  }): ReturnType<IAttester['revokeAttestation']> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.revokeAttestation, [
        this.privateKey.toString(),
        this.publicKey.toString(),
        accumulator.toString(),
        JSON.stringify((witnesses || []).map((witness) => witness.parse())),
      ])
    )
  }
}
