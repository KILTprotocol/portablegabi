import { IGabiContextNonce } from './Attestation'

export interface IGabiReqAttrMsg
  extends IGabiContextNonce,
    IPartialPresentationRequest {}

export interface IGabiVerifiedPresentation {
  verified: boolean
  claim: Map<string, any>
}

export interface IGabiVerifiedCombinedPresentations {
  verified: boolean
  claims: Array<Map<string, any>>
}

export interface IPartialPresentationRequest {
  requestedAttributes: string[]
  requestNonRevocationProof: boolean
  minIndex: number
}
