import goWasmExec from './wasm/wasm_exec_wrapper'
import WasmHooks from './wasm/WasmHooks'
import { IGabiAttrMsg, IGabiVerifiedAtts } from './Types/Verification'
import { IGabiMsgSession, IGabiContextNonce } from './Types/Attestation'

export default class GabiVerifier {
  public static async verifyAttributes({
    proof,
    verifierSession,
    attesterPubKey,
  }: {
    proof: string
    verifierSession: IGabiContextNonce
    attesterPubKey: string
  }): Promise<IGabiVerifiedAtts> {
    const reponse = await goWasmExec<IGabiVerifiedAtts>(
      WasmHooks.verifyAttributes,
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
    session: IGabiContextNonce
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startVerificationSession,
      disclosedAttributes
    )
    return {
      message: JSON.parse(message),
      session: JSON.parse(session),
    }
  }
}
