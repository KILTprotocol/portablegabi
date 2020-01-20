import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import {
  IPresentationRequest,
  IVerifiedPresentation,
  IVerifiedCombinedPresentation,
  VerificationSession,
  PresentationRequest,
  CombinedVerificationSession,
  CombinedPresentationRequest,
} from '../types/Verification'
import { IGabiMsgSession, AttesterPublicKey } from '../types/Attestation'
import { Presentation, CombinedPresentation } from '../types/Claim'

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
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    return goWasmExec<IGabiMsgSession>(WasmHooks.requestCombinedPresentation, [
      JSON.stringify(presentationReqs),
    ])
  }

  public static async verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey,
  }: {
    proof: Presentation
    verifierSession: VerificationSession
    attesterPubKey: AttesterPublicKey
  }): Promise<IVerifiedPresentation> {
    const response = await goWasmExec<{
      verified: boolean
      claim: string
    }>(WasmHooks.verifyPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      attesterPubKey.valueOf(),
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
    proof: CombinedPresentation
    verifierSession: CombinedVerificationSession
    attesterPubKeys: AttesterPublicKey[]
  }): Promise<IVerifiedCombinedPresentation> {
    const response = await goWasmExec<{
      verified: boolean
      claims: string
    }>(WasmHooks.verifyCombinedPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      `[${attesterPubKeys.join(',')}]`,
    ])
    return {
      verified: response.verified,
      claims: JSON.parse(response.claims),
    }
  }
}
