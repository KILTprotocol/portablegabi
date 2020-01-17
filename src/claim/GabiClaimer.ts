import IGabiClaimer from '../types/Claim'
import WasmHooks from '../wasm/WasmHooks'
import {
  IGabiAttestationRequest,
  IGabiAttestationStart,
  IGabiMsgSession,
} from '../types/Attestation'
import { IGabiReqAttrMsg } from '../types/Verification'
import goWasmExec from '../wasm/wasm_exec_wrapper'

export default class GabiClaimer implements IGabiClaimer {
  private readonly secret: string

  public static async buildFromMnemonic(
    mnemonic: string
  ): Promise<GabiClaimer> {
    // secret's structure unmarshalled is { MasterSecret: string }
    const secret = await GabiClaimer.genSecret(mnemonic)
    return new GabiClaimer(secret)
  }

  public static async buildFromScratch(): Promise<GabiClaimer> {
    const secret = await goWasmExec<string>(WasmHooks.genKey)
    return new GabiClaimer(secret)
  }

  constructor(secret: string) {
    this.secret = secret
  }

  private static async genSecret(mnemonic: string): Promise<string> {
    return goWasmExec<string>(WasmHooks.keyFromMnemonic, [mnemonic, ''])
  }

  // request attestation
  public async requestAttestation({
    claim,
    startAttestationMsg,
    attesterPubKey,
  }: {
    claim: string
    startAttestationMsg: IGabiAttestationStart['message']
    attesterPubKey: string
  }): Promise<IGabiAttestationRequest> {
    const { session, message } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestAttestation,
      [this.secret, claim, JSON.stringify(startAttestationMsg), attesterPubKey]
    )
    return {
      message: JSON.parse(message),
      session: JSON.parse(session),
    }
  }

  // build credential
  public async buildCredential({
    claimerSignSession,
    signature,
  }: {
    claimerSignSession: IGabiAttestationRequest['session']
    signature: string
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.buildCredential, [
      this.secret,
      JSON.stringify(claimerSignSession),
      signature,
    ])
  }

  // reveal attributes
  public async revealAttributes({
    credential,
    reqRevealedAttrMsg,
    attesterPubKey,
  }: {
    credential: string
    reqRevealedAttrMsg: IGabiReqAttrMsg
    attesterPubKey: string
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.buildPresentation, [
      this.secret,
      credential,
      JSON.stringify(reqRevealedAttrMsg),
      attesterPubKey,
    ])
  }

  public async buildCombinedPresentation({
    credentials,
    reqCombinedPresentation,
    attesterPubKeys,
  }: {
    credentials: string[]
    reqCombinedPresentation: string
    attesterPubKeys: string[]
  }): Promise<string> {
    // make an json array out of already json serialised values
    // we don't want a json array of strings
    return goWasmExec<string>(WasmHooks.buildCombinedPresentation, [
      this.secret,
      `[${credentials.join(',')}]`,
      reqCombinedPresentation,
      `[${attesterPubKeys.join(',')}]`,
    ])
  }

  public async updateCredential({
    credential,
    attesterPubKey,
    update,
  }: {
    credential: string
    attesterPubKey: string
    update: string
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.updateCredential, [
      this.secret,
      credential,
      update,
      attesterPubKey,
    ])
  }
}
