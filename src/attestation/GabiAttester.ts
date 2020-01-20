import { AttestationRequest } from '../types/Claim'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import IGabiAttester, {
  IGabiMsgSession,
  InitiateAttestationRequest,
  AttestationSession,
  Accumulator,
  Witness,
  Attestation,
} from '../types/Attestation'

export default class GabiAttester implements IGabiAttester {
  private readonly privateKey: string
  private readonly publicKey: string

  // generate keypair
  private static async buildFromKeyPair(): Promise<{
    privateKey: string
    publicKey: string
  }> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    return goWasmExec(WasmHooks.genKeypair, [70, validityDuration])
  }

  public static async buildFromScratch(): Promise<GabiAttester> {
    const { privateKey, publicKey } = await GabiAttester.buildFromKeyPair()
    return new GabiAttester(publicKey, privateKey)
  }

  public constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  public getPubKey(): string {
    return this.publicKey
  }

  // start attestation
  public async startAttestation(): Promise<{
    message: InitiateAttestationRequest
    session: AttestationSession
  }> {
    const {
      message,
      session,
    }: {
      message: string
      session: string
    } = await goWasmExec<IGabiMsgSession>(WasmHooks.startAttestationSession, [
      this.privateKey,
      this.publicKey,
    ])
    return { message, session }
  }

  public async createAccumulator(): Promise<Accumulator> {
    const response = await goWasmExec<string>(WasmHooks.createAccumulator, [
      this.privateKey,
      this.publicKey,
    ])
    return response
  }

  // issue attestation
  public async issueAttestation({
    attestationSession,
    attestationRequest,
    update,
  }: {
    attestationSession: AttestationSession
    attestationRequest: AttestationRequest
    update: Accumulator
  }): Promise<{
    attestation: Attestation
    witness: Witness
  }> {
    const response = await goWasmExec<{
      attestation: string
      witness: string
    }>(WasmHooks.issueAttestation, [
      this.privateKey,
      this.publicKey,
      attestationSession as string,
      attestationRequest as string,
      update as string,
    ])
    return {
      attestation: response.attestation,
      witness: response.witness,
    }
  }

  // revoke attestation
  public async revokeAttestation({
    update,
    witness,
  }: {
    update: Accumulator
    witness: Witness
  }): Promise<string> {
    const response = await goWasmExec<string>(WasmHooks.revokeAttestation, [
      this.privateKey,
      this.publicKey,
      update as string,
      witness as string,
    ])
    return response
  }
}
