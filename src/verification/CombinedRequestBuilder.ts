import GabiVerifier from '../../build/verification/GabiVerifier'
import { IPartialPresentationRequest } from '../../build/types/Verification'

export default class CombinedProofBuilder {
  private partialRequests: IPartialPresentationRequest[]

  constructor() {
    this.partialRequests = []
  }

  public requestPresentation(
    partialRequest: IPartialPresentationRequest
  ): CombinedProofBuilder {
    this.partialRequests.push(partialRequest)
    return this
  }

  public async finalise(): Promise<{
    message: string
    session: string
  }> {
    console.log(this.partialRequests)
    return GabiVerifier.requestCombinedPresentation(this.partialRequests)
  }
}
