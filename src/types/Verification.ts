import { IGabiContextNonce } from './Attestation'

export interface IGabiReqAttrMsg extends IGabiContextNonce {
  disclosedAttributes: string[]
  reqNonRevocationProof: boolean
  ReqMinIndex: number
}

export interface IGabiVerifiedAtts {
  verified: 'true' | 'false'
  claim: string
}
