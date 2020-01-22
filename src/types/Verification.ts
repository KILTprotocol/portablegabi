/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
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

export class VerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class PresentationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class CombinedVerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class CombinedPresentationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
