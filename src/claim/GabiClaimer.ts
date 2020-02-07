import IGabiClaimer, {
  AttestationRequest,
  ClaimerAttestationSession,
  Credential,
  Presentation,
  CombinedPresentation,
  ClaimError,
  IUpdateCredential,
} from '../types/Claim'
import WasmHooks from '../wasm/WasmHooks'
import {
  IGabiMsgSession,
  InitiateAttestationRequest,
  Attestation,
  AttesterPublicKey,
} from '../types/Attestation'
import {
  CombinedPresentationRequest,
  PresentationRequest,
} from '../types/Verification'
import goWasmExec from '../wasm/wasm_exec_wrapper'

function checkValidClaimStructure(claim: object): void | Error {
  if (!Object.keys(claim).length) {
    throw ClaimError.claimMissing
  }
  if (typeof claim !== 'object') {
    throw ClaimError.notAnObject(typeof claim)
  }
  if (Array.isArray(claim)) {
    throw ClaimError.duringParsing
  }
}

export default class GabiClaimer implements IGabiClaimer {
  private readonly secret: string

  public static async buildFromMnemonic<T extends GabiClaimer>(
    mnemonic: string
  ): Promise<T> {
    // secret's structure unmarshalled is { MasterSecret: string }
    const secret = await GabiClaimer.genSecret(mnemonic)
    return new this(secret) as T
  }

  public static async buildFromScratch<T extends GabiClaimer>(): Promise<T> {
    const secret = await goWasmExec<string>(WasmHooks.genKey)
    return new this(secret) as T
  }

  constructor(secret: string) {
    this.secret = secret
  }

  private static async genSecret(mnemonic: string): Promise<string> {
    return goWasmExec<string>(WasmHooks.keyFromMnemonic, [mnemonic, ''])
  }
  /**
   * Creates an [[AttestationRequest]] using the provided [[InitiateAttestationRequest]].
   *
   * @param p The parameter object.
   * @param p.claim The claim which should get attested.
   * @param p.startAttestationMsg The [[InitiateAttestationRequest]] provided by the attester.
   * @param p.attesterPubKey The [[PublicKey]] of the attester.
   * @returns An [[AttestationRequest]] and a [[ClaimerAttestationSession]] which together with an [[AttestationResponse]] can be used to create a [[Credential]].
   */

  public async requestAttestation({
    claim,
    startAttestationMsg,
    attesterPubKey,
  }: {
    claim: object
    startAttestationMsg: InitiateAttestationRequest
    attesterPubKey: AttesterPublicKey
  }): Promise<{
    message: AttestationRequest
    session: ClaimerAttestationSession
  }> {
    // check for invalid claim structure
    checkValidClaimStructure(claim)
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestAttestation,
      [
        this.secret,
        JSON.stringify(claim),
        startAttestationMsg.valueOf(),
        attesterPubKey.valueOf(),
      ]
    )
    return {
      message: new AttestationRequest(message),
      session: new ClaimerAttestationSession(session),
    }
  }

  public async buildCredential({
    claimerSession,
    attestation,
  }: {
    claimerSession: ClaimerAttestationSession
    attestation: Attestation
  }): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.buildCredential, [
        this.secret,
        claimerSession.valueOf(),
        attestation.valueOf(),
      ])
    )
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
    return new Presentation(
      await goWasmExec<string>(WasmHooks.buildPresentation, [
        this.secret,
        credential.valueOf(),
        presentationReq.valueOf(),
        attesterPubKey.valueOf(),
      ])
    )
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
    return new CombinedPresentation(
      await goWasmExec<string>(WasmHooks.buildCombinedPresentation, [
        this.secret,
        `[${credentials.join(',')}]`,
        combinedPresentationReq.valueOf(),
        `[${attesterPubKeys.join(',')}]`,
      ])
    )
  }

  public async updateCredential({
    credential,
    attesterPubKey,
    accumulator,
  }: IUpdateCredential): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.updateCredential, [
        this.secret,
        credential.valueOf(),
        accumulator.valueOf(),
        attesterPubKey.valueOf(),
      ])
    )
  }
}
