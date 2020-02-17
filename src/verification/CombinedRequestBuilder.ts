import GabiVerifier from './GabiVerifier'
import {
  CombinedVerificationSession,
  CombinedPresentationRequest,
  IPresentationRequest,
} from '../types/Verification'

export default class CombinedRequestBuilder {
  private partialRequests: IPresentationRequest[]

  constructor() {
    this.partialRequests = []
  }

  public requestPresentation(
    partialRequest: IPresentationRequest
  ): CombinedRequestBuilder {
    this.partialRequests.push(partialRequest)
    return this
  }

  public async finalise(): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    return GabiVerifier.requestCombinedPresentation(
      this.partialRequests as IPresentationRequest[]
    )
  }
}
