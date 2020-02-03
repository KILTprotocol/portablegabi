import GabiVerifier from './GabiVerifier'

import {
  IPresentationRequest,
  PresentationRequest,
  VerificationSession,
  CombinedPresentationRequest,
  CombinedVerificationSession,
  IPresentationRequestChain,
} from '../types/Verification'
import getCached from '../blockchain/BlockchainApiConnection'

export default class GabiVerifierChain extends GabiVerifier {
  public static async requestPresentationChain({
    requestedAttributes,
    reqNonRevocationProof,
    reqIndex,
    address,
  }: IPresentationRequestChain): Promise<{
    message: PresentationRequest
    session: VerificationSession
  }> {
    const chain = await getCached()
    const reqMinIndex = await chain.checkReqRevoIndex(reqIndex, address)
    return super.requestPresentation({
      requestedAttributes,
      reqNonRevocationProof,
      reqMinIndex,
    })
  }

  public static async requestCombinedPresentationChain(
    presentationReqs: IPresentationRequestChain[]
  ): Promise<{
    message: CombinedPresentationRequest
    session: CombinedVerificationSession
  }> {
    const chain = await getCached()
    const requests: IPresentationRequest[] = await Promise.all(
      presentationReqs.map(async req => {
        const {
          requestedAttributes,
          reqNonRevocationProof,
          reqIndex,
          address,
        } = req
        const reqMinIndex = await chain.checkReqRevoIndex(reqIndex, address)
        return {
          requestedAttributes,
          reqNonRevocationProof,
          reqMinIndex,
        }
      })
    )
    return super.requestCombinedPresentation(requests)
  }
}
