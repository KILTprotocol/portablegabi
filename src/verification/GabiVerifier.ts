import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import {
  IGabiReqAttrMsg,
  IGabiVerifiedAtts,
  IPartialPresentationRequest,
} from '../types/Verification'
import { IGabiMsgSession, IGabiContextNonce } from '../types/Attestation'

export default class GabiVerifier {
  public static async requestPresentation({
    requestedAttributes,
    requestNonRevocationProof,
    minIndex,
  }: IPartialPresentationRequest): Promise<{
    message: IGabiReqAttrMsg
    session: IGabiContextNonce
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestPresentation,
      [requestNonRevocationProof, minIndex, ...requestedAttributes]
    )
    return {
      message: JSON.parse(message),
      session: JSON.parse(session),
    }
  }

  public static async requestCombinedPresentation(
    combinedRequest: IPartialPresentationRequest[]
  ): Promise<{
    message: string
    session: string
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestCombinedPresentation,
      [JSON.stringify(combinedRequest)]
    )
    return {
      message,
      session,
    }
  }

  public static async verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey,
  }: {
    proof: string
    verifierSession: IGabiContextNonce
    attesterPubKey: string
  }): Promise<IGabiVerifiedAtts> {
    const response = await goWasmExec<IGabiVerifiedAtts>(
      WasmHooks.verifyPresentation,
      [proof, JSON.stringify(verifierSession), attesterPubKey]
    )
    return { claim: response.claim, verified: Boolean(response.verified) }
  }

  public static async verifyCombinedPresentation({
    proof,
    verifierSession,
    attesterPubKeys,
  }: {
    proof: string
    verifierSession: string
    attesterPubKeys: string[]
  }): Promise<IGabiVerifiedAtts> {
    const response = await goWasmExec<IGabiVerifiedAtts>(
      WasmHooks.verifyCombinedPresentation,
      [proof, JSON.stringify(verifierSession), `[${attesterPubKeys.join(',')}]`]
    )
    return response
  }
}
