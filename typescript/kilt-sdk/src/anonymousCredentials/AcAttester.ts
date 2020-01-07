import goWasmExec from './wasm_exec_wrapper'
import GoHooks from './Enums'
import {
  IGabiAttestationRequest,
  IGabiAttestationStart,
  IGabiMessageSession,
  IAcAttester,
} from './Types'

export default class AcAttester implements IAcAttester {
  private privKey: string
  private pubKey: string

  // generate keypair
  private static async genKeypair(): Promise<{
    privKey: string
    pubKey: string
  }> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    return goWasmExec(GoHooks.genKeypair, [7, validityDuration]) // TODO: Why 7
  }

  // TODO: Talk to Timo about storage
  public static async buildFromScratch(): Promise<AcAttester> {
    const { privKey, pubKey } = await AcAttester.genKeypair()
    return new AcAttester(pubKey, privKey)
  }

  // TODO: Should be built from private key only
  public constructor(pubKey: string, privKey: string) {
    this.pubKey = pubKey
    this.privKey = privKey
  }

  public getPubKey(): string {
    return this.pubKey
  }

  // start attestation
  public async startAttestation(): Promise<IGabiAttestationStart> {
    const {
      message,
      session,
    }: {
      message: string
      session: string
    } = await goWasmExec<IGabiMessageSession>(GoHooks.startAttestationSession, [
      this.privKey,
      this.pubKey,
    ])
    return { message: JSON.parse(message), session: JSON.parse(session) }
  }

  // issue attestation
  public async issueAttestation({
    attesterSignSession,
    reqSignMsg,
  }: {
    attesterSignSession: IGabiAttestationStart['session']
    reqSignMsg: IGabiAttestationRequest['message']
  }): Promise<string> {
    const response = await goWasmExec<string>(GoHooks.issueAttestation, [
      this.privKey,
      this.pubKey,
      JSON.stringify(attesterSignSession),
      JSON.stringify(reqSignMsg),
    ])
    return response
  }

  // TODO: To be implemented when revocation is published
  // revoke attestation
  revokeAttestation = async (): Promise<any> => {
    return goWasmExec(GoHooks.revokeAttestation)
  }
}
