import Accumulator from '../attestation/Accumulator'
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
    reqNonRevocationProof,
    reqUpdatedAfter: reqUpdateAfter,
  }: IPresentationRequest): Promise<{
    message: PresentationRequest
    session: VerificationSession
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestPresentation,
      [
        reqNonRevocationProof,
        reqUpdateAfter.toISOString(),
        JSON.stringify(requestedAttributes),
      ]
    )
    return {
      message: new PresentationRequest(message),
      session: new VerificationSession(session),
    }
  }

  public static async requestCombinedPresentation(
    presentationReqs: IPresentationRequest[]
  ): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestCombinedPresentation,
      [JSON.stringify(presentationReqs)]
    )
    return {
      message: new CombinedPresentationRequest(message),
      session: new CombinedVerificationSession(session),
    }
  }

  public static async verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey,
    accumulator,
  }: {
    proof: Presentation
    verifierSession: VerificationSession
    attesterPubKey: AttesterPublicKey
    accumulator: Accumulator
  }): Promise<IVerifiedPresentation> {
    const response = await goWasmExec<{
      verified: string
      claim: string
    }>(WasmHooks.verifyPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      attesterPubKey.valueOf(),
      accumulator.valueOf(),
    ])
    return {
      verified: response.verified === 'true',
      claim: JSON.parse(response.claim),
    }
  }

  public static async verifyCombinedPresentation({
    proof,
    verifierSession,
    attesterPubKeys,
    accumulators,
  }: {
    proof: CombinedPresentation
    verifierSession: CombinedVerificationSession
    attesterPubKeys: AttesterPublicKey[]
    accumulators: Accumulator[]
  }): Promise<IVerifiedCombinedPresentation> {
    const response = await goWasmExec<{
      verified: string
      claims: string
    }>(WasmHooks.verifyCombinedPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      `[${attesterPubKeys.join(',')}]`,
      `[${accumulators.join(',')}]`,
    ])
    return {
      verified: response.verified === 'true',
      claims: JSON.parse(response.claims),
    }
  }
}
