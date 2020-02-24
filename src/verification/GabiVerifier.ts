/**
 * This module contains the GabiVerifier class which is used to verify [[Credential]]s.
 */
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

/**
 * The GabiVerifier can be used to request presentations of claims and verify [[Credential]]s.
 */
export default class GabiVerifier {
  /**
   * Initiates a verification session.
   *
   * @param p The parameter object.
   * @param p.requestedAttributes The attributes that need to be disclosed for the [[Verifier]] in order to verify the [[Credential]].
   * @param p.reqUpdatedAfter The minimum [[Accumulator]] timestamp on which the [[Credential]] needs to be updated.
   * @returns A session and a message object. The message should be send to the [[Claimer]] and used in [[buildPresentation]]. The session should be kept private and used in [[verifyPresentation]].
   */
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

  /**
   * Initiates a verification session for a combined proof.
   *
   * @param presentationReqs An array of [[PresentationRequest]]s created by the [[Verifier]].
   * @returns A session and a message object. The message should be send to the [[Claimer]] and used in [[buildPresentation]]. The session should be kept private and used in [[verifyPresentation]].
   */
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

  /**
   * Checks whether the presented [[Credential]] is valid.
   *
   * @param p The parameter object.
   * @param p.proof The result of combining the [[Credential]], the [[PresentationRequest]] and the [[Attester]]s public key in [[buildPresentation]].
   * @param p.verifierSession The [[Verifier]]s session generated in [[requestPresentation]].
   * @param p.attesterPubKey The public key of the [[Attester]] of the [[Credential]].
   * @param p.latestAccumulator The [[Accumulator]] used to create or update the [[Credential]].
   *
   * @returns Whether the presentation could be verified.
   */
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

  /**
   * Checks whether the presented combined [[Credential]] is valid.
   *
   * @param p The parameter object.
   * @param p.proof The result of combining the [[Credential]]s, the [[PresentationRequest]]s and the [[Attester]]s public keys in [[buildCombinedPresentation]].
   * @param p.verifierSession The [[Verifier]]s session generated in [[requestCombinedPresentation]].
   * @param p.attesterPubKey The public keys of all [[Attester]]s of the [[Credential]]s.
   * @param p.latestAccumulator The [[Accumulator]]s used to create or update the [[Credential]]s.
   *
   * @returns Whether the combined presentation could be verified.
   */
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
