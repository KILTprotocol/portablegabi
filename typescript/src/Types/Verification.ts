import { IGabiContextNonce } from './Attestation'

export interface IGabiAttrMsg extends IGabiContextNonce {
  disclosedAttributes: string[]
}

export interface IGabiVerifiedAtts {
  verified: 'true' | 'false'
  claim: string
}
