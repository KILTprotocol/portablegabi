import GabiVerifier from './GabiVerifier'
import GabiVerifierChain from './GabiVerifier.chain'
import {
  CombinedVerificationSession,
  CombinedPresentationRequest,
  IPresentationRequest,
  IPresentationRequestChain,
} from '../types/Verification'

// Typeguard to check conditional generic
function isOnchain(
  s: IPresentationRequest | IPresentationRequestChain
): s is IPresentationRequestChain {
  return 'attesterIdentity' in s && 'reqIndex' in s
}

export default class CombinedRequestBuilder<
  T extends IPresentationRequest | IPresentationRequestChain
> {
  private partialRequests: T[]

  constructor() {
    this.partialRequests = []
  }

  public requestPresentation(partialRequest: T): CombinedRequestBuilder<T> {
    this.partialRequests.push(partialRequest)
    return this
  }

  public async finalise(): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    if (isOnchain(this.partialRequests[0])) {
      return GabiVerifierChain.requestCombinedPresentationChain(
        this.partialRequests as IPresentationRequestChain[]
      )
    }
    return GabiVerifier.requestCombinedPresentation(
      this.partialRequests as IPresentationRequest[]
    )
  }
}
