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

export default class GabiAttester implements IGabiAttester {
  private readonly privateKey: AttesterPrivateKey
  readonly publicKey: AttesterPublicKey

  // generate keypair
  public static async genKeyPair(): Promise<{
    privateKey: AttesterPrivateKey
    publicKey: AttesterPublicKey
  }> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    const { privateKey, publicKey } = await goWasmExec<{
      privateKey: string
      publicKey: string
    }>(WasmHooks.genKeypair, [70, validityDuration])
    return {
      privateKey: new AttesterPrivateKey(privateKey),
      publicKey: new AttesterPublicKey(publicKey),
    }
  }

  // create new instance
  public static async create(): Promise<GabiAttester> {
    const { publicKey, privateKey } = await this.genKeyPair()
    return new GabiAttester(publicKey, privateKey)
  }

  public constructor(
    publicKey: AttesterPublicKey,
    privateKey: AttesterPrivateKey
  ) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  // start attestation
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

  public async createAccumulator(): Promise<Accumulator> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.createAccumulator, [
        this.privateKey.valueOf(),
        this.publicKey.valueOf(),
      ])
    )
  }

  // issue attestation
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

  // revoke attestation
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
