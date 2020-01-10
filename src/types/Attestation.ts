export interface IGabiContextNonce {
  context: string
  nonce: string
}

export interface IGabiMsgSession {
  message: string
  session: string
}
export interface IGabiAttestationStart {
  message: IGabiContextNonce
  session: any
}

export interface IGabiAttestationRequest {
  message: any
  session: {
    claim: {
      contents: {
        [key: string]: any
      }
      [key: string]: any
    }
    cb: {
      [cryptoStuff: string]: any
    }
  }
}

export default interface IGabiAttester {
  startAttestation: Function
  issueAttestation: Function
  revokeAttestation: Function
  getPubKey: Function
}
