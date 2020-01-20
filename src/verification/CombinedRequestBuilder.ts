import GabiVerifier from '../../build/verification/GabiVerifier'
import {
  CombinedVerificationSession,
  CombinedPresentationRequest,
  IPresentationRequest,
} from '../../build/types/Verification'

export default class CombinedProofBuilder {
  private partialRequests: IPresentationRequest[]

  constructor() {
    this.partialRequests = []
  }

  public requestPresentation(
    partialRequest: IPresentationRequest
  ): CombinedProofBuilder {
    this.partialRequests.push(partialRequest)
    return this
  }

  public async finalise(): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    return GabiVerifier.requestCombinedPresentation(this.partialRequests)
  }
}
