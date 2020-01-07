export interface IGabiClaimer {
  MasterSecret: string
}

export interface IGabiMessageSession {
  message: string
  session: string
}
export interface IGabiAttestationStart {
  message: {
    nonce: string
    context: string
  }
  session: { [key: string]: any }
}

export interface IGabiAttestationRequest {
  message: { [key: string]: any }
  session: {
    claim: {
      cType: string
      contents: any
    }
    [key: string]: any
  }
}

export interface IGabiAttrMsg {
  disclosedAttributes: string[]
  context: string
  nonce: string
}

export interface IGabiVerifiedAtts {
  verified: 'true' | 'false'
  claim: string
}

export interface IGabiVerifierSession {
  context: string
  nonce: string
}

export interface IAcClaimer {
  requestAttestation: Function
  buildCredential: Function
  revealAttributes: Function
}

export interface IAcAttester {
  startAttestation: Function
  issueAttestation: Function
  revokeAttestation: Function
  getPubKey: Function
}
