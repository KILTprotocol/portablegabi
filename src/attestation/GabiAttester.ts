import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import IGabiAttester, {
  IGabiAttestationStart,
  IGabiMsgSession,
  IGabiAttestationRequest,
} from '../types/Attestation'

export default class GabiAttester implements IGabiAttester {
  private readonly privKey: string
  private readonly pubKey: string

  // generate keypair
  private static async buildFromKeyPair(): Promise<{
    privKey: string
    pubKey: string
  }> {
    const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000 // 365 days in nanoseconds
    return goWasmExec(WasmHooks.genKeypair, [70, validityDuration])
  }

  public static async buildFromScratch(): Promise<GabiAttester> {
    const { privKey, pubKey } = await GabiAttester.buildFromKeyPair()
    return new GabiAttester(pubKey, privKey)
  }

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
    } = await goWasmExec<IGabiMsgSession>(WasmHooks.startAttestationSession, [
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
    const response = await goWasmExec<string>(WasmHooks.issueAttestation, [
      this.privKey,
      this.pubKey,
      JSON.stringify(attesterSignSession),
      JSON.stringify(reqSignMsg),
    ])
    return response
  }

  // TODO: To be implemented when revocation is published
  // revoke attestation
  revokeAttestation = async (): Promise<void> => {
    return goWasmExec(WasmHooks.revokeAttestation)
  }
}
