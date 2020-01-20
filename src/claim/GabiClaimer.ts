import IGabiClaimer, {
  AttestationRequest,
  ClaimerAttestationSession,
} from '../types/Claim'
import WasmHooks from '../wasm/WasmHooks'
import {
  IGabiMsgSession,
  InitiateAttestationRequest,
  Attestation,
  Accumulator,
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
    attesterPubKey: string
  }): Promise<{
    message: AttestationRequest
    session: ClaimerAttestationSession
  }> {
    return goWasmExec<IGabiMsgSession>(WasmHooks.requestAttestation, [
      this.secret,
      claim,
      startAttestationMsg as string,
      attesterPubKey,
    ])
  }

  public async buildCredential({
    claimerSignSession,
    attestation,
  }: {
    claimerSignSession: ClaimerAttestationSession
    attestation: Attestation
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.buildCredential, [
      this.secret,
      claimerSignSession as string,
      attestation as string,
    ])
  }

  public async revealAttributes({
    credential,
    presentationReq,
    attesterPubKey,
  }: {
    credential: string
    presentationReq: PresentationRequest
    attesterPubKey: string
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.buildPresentation, [
      this.secret,
      credential,
      presentationReq as string, // TODO: why can't we use PresentationRequest as a string? It extends string...
      attesterPubKey,
    ])
  }

  public async buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  }: {
    credentials: string[]
    combinedPresentationReq: CombinedPresentationRequest
    attesterPubKeys: string[]
  }): Promise<string> {
    // make an json array out of already json serialised values
    // we don't want a json array of strings
    return goWasmExec<string>(WasmHooks.buildCombinedPresentation, [
      this.secret,
      `[${credentials.join(',')}]`,
      combinedPresentationReq as string,
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
    update: Accumulator
  }): Promise<string> {
    return goWasmExec<string>(WasmHooks.updateCredential, [
      this.secret,
      credential,
      update as string,
      attesterPubKey,
    ])
  }
}
