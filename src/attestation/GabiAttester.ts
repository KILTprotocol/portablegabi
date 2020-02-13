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
} from '../types/Attestation'

export default class GabiAttester implements IGabiAttester {
  private readonly privateKey: string
  readonly publicKey: AttesterPublicKey

  // generate keypair
  public static async genKeyPair(): Promise<{
    privateKey: string
    publicKey: string
  }> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    return goWasmExec(WasmHooks.genKeypair, [70, validityDuration])
  }

  // create new instance
  public static async create(): Promise<GabiAttester> {
    const { publicKey, privateKey } = await this.genKeyPair()
    return new GabiAttester(new AttesterPublicKey(publicKey), privateKey)
  }

  public constructor(publicKey: AttesterPublicKey, privateKey: string) {
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
      [this.privateKey, this.publicKey.valueOf()]
    )
    return {
      message: new InitiateAttestationRequest(message),
      session: new AttesterAttestationSession(session),
    }
  }

  public async createAccumulator(): Promise<Accumulator> {
    return new Accumulator(
      await goWasmExec<string>(WasmHooks.createAccumulator, [
        this.privateKey,
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
      this.privateKey,
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
        this.privateKey,
        this.publicKey.valueOf(),
        accumulator.valueOf(),
        JSON.stringify(
          (witnesses || []).map(witness => JSON.parse(witness.valueOf()))
        ),
      ])
    )
  }
}
