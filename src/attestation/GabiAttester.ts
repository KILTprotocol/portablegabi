import { AttestationRequest } from '../types/Claim'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import IGabiAttester, {
  IGabiMsgSession,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Accumulator,
  Witness,
  Attestation,
  AttesterPublicKey,
} from '../types/Attestation'

export default class GabiAttester implements IGabiAttester {
  private readonly privateKey: string
  private readonly publicKey: string

  // generate keypair
  public static async buildFromScratch(): Promise<GabiAttester> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    const { privateKey, publicKey } = await goWasmExec(WasmHooks.genKeypair, [
      70,
      validityDuration,
    ])
    return new GabiAttester(publicKey, privateKey)
  }

  public constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  public getPubKey(): AttesterPublicKey {
    return new AttesterPublicKey(this.publicKey)
  }

  // start attestation
  public async startAttestation(): Promise<{
    message: InitiateAttestationRequest
    session: AttesterAttestationSession
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startAttestationSession,
      [this.privateKey, this.publicKey]
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
        this.publicKey,
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
      this.publicKey,
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
    witness,
  }: {
    accumulator: Accumulator
    witness: Witness
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.revokeAttestation, [
      this.privateKey,
      this.publicKey,
      accumulator.valueOf(),
      witness.valueOf(),
    ])
  }
}
