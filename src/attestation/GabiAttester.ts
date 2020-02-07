/**
 * This module contains the GabiAttester Class which is used to create and revoke attestations.
 */
import { AttestationRequest } from '../types/Claim'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from './Accumulator'
import IGabiAttester, {
  IGabiMsgSession,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Witness,
  Attestation,
  AttesterPublicKey,
  AttesterPrivateKey,
} from '../types/Attestation'

/**
 * The GabiAttester can be used to create and revoke attestations.
 */
export default class GabiAttester implements IGabiAttester {
  private readonly privateKey: AttesterPrivateKey
  readonly publicKey: AttesterPublicKey

  /**
   * Generates a new key pair.
   *
   * @param validityDuration The duration for which the public key will be valid.
   * @param maxAttributes The maximal number of attributes that can be signed with the generated private key.
   * @returns A newly generated key pair.
   */
  public static async genKeyPair(
    validityDuration: number,
    maxAttributes: number
  ): Promise<{
    privateKey: AttesterPrivateKey
    publicKey: AttesterPublicKey
  }> {
    const { privateKey, publicKey } = await goWasmExec<{
      privateKey: string
      publicKey: string
    }>(WasmHooks.genKeypair, [maxAttributes, validityDuration])
    return {
      privateKey: new AttesterPrivateKey(privateKey),
      publicKey: new AttesterPublicKey(publicKey),
    }
  }

  /**
   * Generates a new key pair and returns a new attester.
   *
   * @param validityDuration The duration for which the public key will be valid.
   * @param maxAttributes The maximal number of attributes that can be signed with the generated private key.
   * @returns A new Attester.
   */
  public static async create(
    validityDuration: number,
    maxAttributes: number
  ): Promise<GabiAttester> {
    const { publicKey, privateKey } = await this.genKeyPair(
      validityDuration,
      maxAttributes
    )
    return new GabiAttester(publicKey, privateKey)
  }

  /**
   * Constructs a new attester using the private and public key.
   *
   * @param publicKey The public key for the attester.
   * @param privateKey The private key for the attester.
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
   * @returns A session and a message object.
   *    The message should be send over to the claimer.
   */
  public async startAttestation(): Promise<{
    message: InitiateAttestationRequest
    session: AttesterAttestationSession
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startAttestationSession,
      [this.privateKey.valueOf(), this.publicKey.valueOf()]
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
  public async createAccumulator(): Promise<Accumulator> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.createAccumulator, [
        this.privateKey.valueOf(),
        this.publicKey.valueOf(),
      ])
    )
  }

  /**
   * Creates an attestation for the claim inside the [[AttestationRequest]].
   *
   * @param p The parameter object.
   * @param p.attestationSession The attestation session which was generated during [[startAttestation]].
   * @param p.attestationRequest The AttestationRequest received from the claimer.
   * @param p.update The most recent [[Accumulator]].
   * @returns The [[Attestation]] object which should be send to the claimer and a witness which can be used to revoke the attestation.
   */
  public async issueAttestation({
    attestationSession,
    attestationRequest,
    accumulator,
  }: {
    attestationSession: AttesterAttestationSession
    attestationRequest: AttestationRequest
    accumulator: Accumulator
  }): Promise<{
    attestation: Attestation
    witness: Witness
  }> {
    const { attestation, witness } = await goWasmExec<{
      attestation: string
      witness: string
    }>(WasmHooks.issueAttestation, [
      this.privateKey.valueOf(),
      this.publicKey.valueOf(),
      attestationSession.valueOf(),
      attestationRequest.valueOf(),
      accumulator.valueOf(),
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
   * @param p.update The current [[Accumulator]].
   * @param p.witness The [[Witness]] belonging to the [[Attestation]] which is about to be revoked.
   * @returns An updated version of the [[Accumulator]].
   */
  public async revokeAttestation({
    accumulator,
    witnesses,
  }: {
    accumulator: Accumulator
    witnesses: Witness[]
  }): Promise<Accumulator> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.revokeAttestation, [
        this.privateKey.valueOf(),
        this.publicKey.valueOf(),
        accumulator.valueOf(),
        JSON.stringify(
          (witnesses || []).map(witness => JSON.parse(witness.valueOf()))
        ),
      ])
    )
  }
}
