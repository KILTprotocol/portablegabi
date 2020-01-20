import { IGabiContextNonce } from './Attestation'

export interface IGabiReqAttrMsg extends IGabiContextNonce {
  discloseAttributes: string[]
  reqNonRevocationProof: boolean
  ReqMinIndex: number
}

export interface IGabiVerifiedAtts<Claim> {
  verified: boolean
  claim: Claim
}
