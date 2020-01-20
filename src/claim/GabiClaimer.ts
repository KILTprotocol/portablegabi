import IGabiClaimer, {
  AttestationRequest,
  ClaimerAttestationSession,
  Credential,
  Presentation,
  CombinedPresentation,
} from '../types/Claim'
import WasmHooks from '../wasm/WasmHooks'
import {
  IGabiMsgSession,
  InitiateAttestationRequest,
  Attestation,
  Accumulator,
  AttesterPublicKey,
} from '../types/Attestation'
import {
  CombinedPresentationRequest,
  PresentationRequest,
} from '../types/Verification'
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

  public async requestAttestation({
    claim,
    startAttestationMsg,
    attesterPubKey,
  }: {
    claim: string
    startAttestationMsg: InitiateAttestationRequest
    attesterPubKey: AttesterPublicKey
  }): Promise<{
    message: AttestationRequest
    session: ClaimerAttestationSession
  }> {
    return goWasmExec<IGabiMsgSession>(WasmHooks.requestAttestation, [
      this.secret,
      claim,
      startAttestationMsg.valueOf(),
      attesterPubKey.valueOf(),
    ])
  }

  public async buildCredential({
    claimerSignSession,
    attestation,
  }: {
    claimerSignSession: ClaimerAttestationSession
    attestation: Attestation
  }): Promise<Credential> {
    return goWasmExec<string>(WasmHooks.buildCredential, [
      this.secret,
      claimerSignSession.valueOf(),
      attestation.valueOf(),
    ])
  }

  public async buildPresentation({
    credential,
    presentationReq,
    attesterPubKey,
  }: {
    credential: Credential
    presentationReq: PresentationRequest
    attesterPubKey: AttesterPublicKey
  }): Promise<Presentation> {
    return goWasmExec<string>(WasmHooks.buildPresentation, [
      this.secret,
      credential.valueOf(),
      presentationReq.valueOf(), // TODO: why can't we use PresentationRequest as a string? It extends string...
      attesterPubKey.valueOf(),
    ])
  }

  public async buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  }: {
    credentials: Credential[]
    combinedPresentationReq: CombinedPresentationRequest
    attesterPubKeys: AttesterPublicKey[]
  }): Promise<CombinedPresentation> {
    // make an json array out of already json serialised values
    // we don't want a json array of strings
    return goWasmExec<string>(WasmHooks.buildCombinedPresentation, [
      this.secret,
      `[${credentials.join(',')}]`,
      combinedPresentationReq.valueOf(),
      `[${attesterPubKeys.join(',')}]`,
    ])
  }

  public async updateCredential({
    credential,
    attesterPubKey,
    update,
  }: {
    credential: Credential
    attesterPubKey: AttesterPublicKey
    update: Accumulator
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.updateCredential, [
      this.secret,
      credential.valueOf(),
      update.valueOf(),
      attesterPubKey.valueOf(),
    ])
  }
}
