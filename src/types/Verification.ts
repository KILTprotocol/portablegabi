/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
export interface IPresentationRequest {
  requestedAttributes: string[]
  reqNonRevocationProof: boolean
  reqMinIndex: number
}

export interface IVerifiedPresentation {
  verified: boolean
  claim: object
}

export interface IVerifiedCombinedPresentation {
  verified: boolean
  claims: object[]
}

export class VerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class PresentationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class CombinedVerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class CombinedPresentationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
