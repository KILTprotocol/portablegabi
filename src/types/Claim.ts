/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
export default interface IGabiClaimer {
  requestAttestation: Function
  buildCredential: Function
  buildPresentation: Function
}

export class AttestationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class ClaimerAttestationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class Presentation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class CombinedPresentation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class Credential extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
