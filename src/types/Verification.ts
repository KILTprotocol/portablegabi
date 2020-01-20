// eslint-disable-next-line max-classes-per-file
export interface IPresentationRequest {
  requestedAttributes: string[]
  requestNonRevocationProof: boolean
  minIndex: number
}

export interface IVerifiedPresentation {
  verified: boolean
  claim: any
}

export interface IVerifiedCombinedPresentation {
  verified: boolean
  claims: any[]
}

export class VerificationSession extends String {}
export class PresentationRequest extends String {}
export class CombinedVerificationSession extends String {}
export class CombinedPresentationRequest extends String {}
