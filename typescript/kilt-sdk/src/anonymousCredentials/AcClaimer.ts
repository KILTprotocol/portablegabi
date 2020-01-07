import IClaim from 'src/types/Claim'
import goWasmExec from './wasm_exec_wrapper'
import GoHooks from './Enums'
import {
  IGabiAttestationRequest,
  IGabiAttestationStart,
  IGabiAttrMsg,
  IGabiClaimer,
  IGabiMessageSession,
  IAcClaimer,
} from './Types'

export default class AcClaimer implements IAcClaimer {
  private secret: string

  // TODO: Add checks for invalid mnemonic
  public static async buildFromMnemonic(mnemonic: string): Promise<AcClaimer> {
    const { MasterSecret: secret } = await AcClaimer.genClaimer(mnemonic)
    return new AcClaimer(secret)
  }

  constructor(secret: string) {
    this.secret = secret
  }

  private static async genClaimer(mnemonic: string): Promise<IGabiClaimer> {
    return JSON.parse(
      await goWasmExec<string>(GoHooks.genKey, [mnemonic])
    )
  }

  // request attestation
  public async requestAttestation({
    claim,
    startAttestationMsg,
    attesterPubKey,
  }: {
    claim: IClaim
    startAttestationMsg: IGabiAttestationStart['message']
    attesterPubKey: string
  }): Promise<IGabiAttestationRequest> {
    const { session, message } = await goWasmExec<IGabiMessageSession>(
      GoHooks.requestAttestation,
      [
        JSON.stringify({ MasterSecret: this.secret }),
        JSON.stringify(claim),
        JSON.stringify(startAttestationMsg),
        attesterPubKey,
      ]
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
    console.log(this.secret)
    const response = await goWasmExec<string>(GoHooks.buildCredential, [
      JSON.stringify({ MasterSecret: this.secret }),
      JSON.stringify(claimerSignSession),
      signature,
    ])
    return response
  }

  // reveal attributes
  public async revealAttributes({
    credential,
    reqRevealedAttrMsg,
    attesterPubKey,
  }: {
    credential: string
    reqRevealedAttrMsg: IGabiAttrMsg
    attesterPubKey: string
  }): Promise<string> {
    const response = await goWasmExec<string>(GoHooks.revealAttributes, [
      JSON.stringify({ MasterSecret: this.secret }),
      credential,
      JSON.stringify(reqRevealedAttrMsg),
      attesterPubKey,
    ])
    return response
  }
}
