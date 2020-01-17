import { IGabiContextNonce } from './Attestation'

export interface IGabiReqAttrMsg
  extends IGabiContextNonce,
    IPartialPresentationRequest {}

export interface IGabiVerifiedAtts {
  verified: boolean
  claim: string
}

export interface IPartialPresentationRequest {
  requestedAttributes: string[]
  requestNonRevocationProof: boolean
  minIndex: number
}
