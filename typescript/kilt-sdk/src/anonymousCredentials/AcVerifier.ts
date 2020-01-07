import PublicIdentity from '../identity/PublicIdentity'
import goWasmExec from './wasm_exec_wrapper'
import GoHooks from './Enums'
import {
  IGabiAttrMsg,
  IGabiMessageSession,
  IGabiVerifiedAtts,
  IGabiVerifierSession,
} from './Types'

// TODO: Remove extends PublicIdentity?
export default class AcVerifier extends PublicIdentity {
  public static async verifyAttributes({
    proof,
    verifierSession,
    attesterPubKey,
  }: {
    proof: string
    verifierSession: IGabiVerifierSession
    attesterPubKey: string
  }): Promise<IGabiVerifiedAtts> {
    const reponse = await goWasmExec<IGabiVerifiedAtts>(
      GoHooks.verifyAttributes,
      [proof, JSON.stringify(verifierSession), attesterPubKey]
    )
    return reponse
  }

  // start verification
  public static async startVerificationSession({
    disclosedAttributes,
  }: {
    disclosedAttributes: string[]
  }): Promise<{
    message: IGabiAttrMsg
    session: IGabiVerifierSession
  }> {
    const { message, session } = await goWasmExec<IGabiMessageSession>(
      GoHooks.startVerificationSession,
      disclosedAttributes
    )
    return { message: JSON.parse(message), session: JSON.parse(session) }
  }
}
