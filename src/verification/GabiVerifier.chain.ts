import GabiVerifier from './GabiVerifier'

import {
  IPresentationRequest,
  PresentationRequest,
  VerificationSession,
  CombinedPresentationRequest,
  CombinedVerificationSession,
  IPresentationRequestChain,
} from '../types/Verification'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

export default class GabiVerifierChain extends GabiVerifier {
  public static async requestPresentationChain({
    requestedAttributes,
    reqNonRevocationProof,
    reqIndex,
    attesterIdentity,
  }: IPresentationRequestChain): Promise<{
    message: PresentationRequest
    session: VerificationSession
  }> {
    const chain = await connect()
    const reqMinIndex = await chain.checkReqRevIndex(reqIndex, attesterIdentity)
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
    const chain = await connect()
    const requests: IPresentationRequest[] = await Promise.all(
      presentationReqs.map(async req => {
        const {
          requestedAttributes,
          reqNonRevocationProof,
          reqIndex,
          attesterIdentity,
        } = req
        const reqMinIndex = await chain.checkReqRevIndex(
          reqIndex,
          attesterIdentity
        )
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
