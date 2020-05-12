import Verifier from './Verifier'
import {
  CombinedVerificationSession,
  CombinedPresentationRequest,
  IPresentationRequest,
} from '../types/Verification'

/**
 * The CombinedRequestBuilder can be used to create a combined presentation request with each one consisting of disclosed attributes and an accumulator timestamp.
 */
export default class CombinedRequestBuilder {
  private partialRequests: IPresentationRequest[]

  constructor() {
    this.partialRequests = []
  }

  /**
   * Adds a partial request to the combined request array.
   *
   * @param partialRequest The partial request which should be appended to the combined request array.
   * @returns A [[CombinedRequestBuilder]] that still needs to call `finalise` before the Verifier can send the combined request to the [[Claimer]].
   */
  public requestPresentation(
    partialRequest: IPresentationRequest
  ): CombinedRequestBuilder {
    this.partialRequests.push(partialRequest)
    return this
  }

  /**
   * Converts an array of partial requests to be callable by [[requestCombinedPresentation]].
   *
   * @returns A message for the [[Claimer]] to be used in [[buildCombinedPresentation]] and a session which can be used by the Verifier.
   */
  public async finalise(): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    return Verifier.requestCombinedPresentation(
      this.partialRequests as IPresentationRequest[]
    )
  }
}
