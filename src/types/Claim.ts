/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
export default interface IGabiClaimer {
  requestAttestation: Function
  buildCredential: Function
  buildPresentation: Function
}

export class AttestationRequest extends String {
  public getClaim(): object {
    let claim: object
    try {
      claim = JSON.parse(this.valueOf()).claim
    } catch (e) {
      throw Error('invalid request: could not parse json')
    }
    if (claim === undefined) {
      throw Error('invalid request: claim is missing')
    }
    return claim
  }
}
export class ClaimerAttestationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Presentation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class CombinedPresentation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Credential extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
