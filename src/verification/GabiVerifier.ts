import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import { IGabiReqAttrMsg, IGabiVerifiedAtts } from '../types/Verification'
import { IGabiMsgSession, IGabiContextNonce } from '../types/Attestation'

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
    const response = await goWasmExec<IGabiVerifiedAtts>(
      WasmHooks.verifyAttributes,
      [proof, JSON.stringify(verifierSession), attesterPubKey]
    )
    return response
  }

  // start verification
  public static async startVerificationSession({
    disclosedAttributes,
    requestNonRevocationProof,
    minIndex,
  }: {
    disclosedAttributes: string[]
    requestNonRevocationProof: boolean
    minIndex: number
  }): Promise<{
    message: IGabiReqAttrMsg
    session: IGabiContextNonce
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startVerificationSession,
      [requestNonRevocationProof, minIndex, ...disclosedAttributes]
    )
    return {
      message: JSON.parse(message),
      session: JSON.parse(session),
    }
  }
}
