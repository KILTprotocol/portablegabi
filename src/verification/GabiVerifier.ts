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
    reqUpdatedAfter,
  }: IPresentationRequest): Promise<{
    message: PresentationRequest
    session: VerificationSession
  }> {
    let args: [boolean, string, string]
    if (typeof reqUpdatedAfter === 'undefined') {
      args = [
        false,
        // date will be ignored, we won't check for a revocation proof
        new Date().toISOString(),
        JSON.stringify(requestedAttributes),
      ]
    } else {
      args = [
        true,
        reqUpdatedAfter.toISOString(),
        JSON.stringify(requestedAttributes),
      ]
    }
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.requestPresentation,
      args
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
      [
        JSON.stringify(
          presentationReqs.map(req => ({
            // check if we want to request a revocation proof
            reqNonRevocationProof: typeof req.reqUpdatedAfter !== 'undefined',
            ...req,
          }))
        ),
      ]
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
    latestAccumulator,
  }: {
    proof: Presentation
    verifierSession: VerificationSession
    attesterPubKey: AttesterPublicKey
    latestAccumulator?: Accumulator
  }): Promise<IVerifiedPresentation> {
    if (!latestAccumulator && proof.valueOf().includes('nonrev_proof')) {
      throw new Error('Missing accumulator for requested revocation proof')
    }
    const response = await goWasmExec<{
      verified: string
      claim: string
    }>(WasmHooks.verifyPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      attesterPubKey.valueOf(),
      (latestAccumulator || new Accumulator('null')).valueOf(),
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
    latestAccumulators,
  }: {
    proof: CombinedPresentation
    verifierSession: CombinedVerificationSession
    attesterPubKeys: AttesterPublicKey[]
    latestAccumulators: Array<Accumulator | undefined>
  }): Promise<IVerifiedCombinedPresentation> {
    const response = await goWasmExec<{
      verified: string
      claims: string
    }>(WasmHooks.verifyCombinedPresentation, [
      proof.valueOf(),
      verifierSession.valueOf(),
      `[${attesterPubKeys.join(',')}]`,
      `[${latestAccumulators
        .map(accumulator => (accumulator || new Accumulator('null')).valueOf())
        .join(',')}]`,
    ])
    return {
      verified: response.verified === 'true',
      claims: JSON.parse(response.claims),
    }
  }
}
