import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import {
  IPresentationRequest,
  IVerifiedPresentation,
  IVerifiedCombinedPresentation,
  VerificationSession,
  PresentationRequest,
  CombinedVerificationSession,
} from '../types/Verification'
import { IGabiMsgSession } from '../types/Attestation'

export default class GabiVerifier {
  public static async requestPresentation({
    requestedAttributes,
    requestNonRevocationProof,
    minIndex,
  }: IPresentationRequest): Promise<{
    message: PresentationRequest
    session: VerificationSession
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestPresentation,
      [requestNonRevocationProof, minIndex, ...requestedAttributes]
    )
    return {
      message: message as PresentationRequest,
      session: session as VerificationSession,
    }
  }

  public static async requestCombinedPresentation(
    presentationReqs: IPresentationRequest[]
  ): Promise<{
    message: string
    session: string
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestCombinedPresentation,
      [JSON.stringify(presentationReqs)]
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
    verifierSession: VerificationSession
    attesterPubKey: string
  }): Promise<IVerifiedPresentation> {
    const response = await goWasmExec<{
      verified: boolean
      claim: string
    }>(WasmHooks.verifyPresentation, [
      proof,
      verifierSession as string,
      attesterPubKey,
    ])
    return {
      verified: response.verified,
      claim: JSON.parse(response.claim),
    }
  }

  public static async verifyCombinedPresentation({
    proof,
    verifierSession,
    attesterPubKeys,
  }: {
    proof: string
    verifierSession: CombinedVerificationSession
    attesterPubKeys: string[]
  }): Promise<IVerifiedCombinedPresentation> {
    const response = await goWasmExec<{
      verified: boolean
      claims: string
    }>(WasmHooks.verifyCombinedPresentation, [
      proof,
      verifierSession as string,
      `[${attesterPubKeys.join(',')}]`,
    ])
    return {
      verified: response.verified,
      claims: JSON.parse(response.claims),
    }
  }
}
