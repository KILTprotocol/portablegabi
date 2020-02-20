/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
export default interface IGabiClaimer {
  requestAttestation: Function
  buildCredential: Function
  buildPresentation: Function
  buildCombinedPresentation: Function
}

export interface IGabiClaimerChain {
  updateCredentialChain: Function
}
export class ClaimError extends Error {
  public static duringParsing = new ClaimError(
    'invalid request: could not parse json'
  )

  public static claimMissing = new ClaimError(
    'invalid request: claim is missing'
  )

  public static notAnObject = (
    type:
      | 'string'
      | 'number'
      | 'bigint'
      | 'boolean'
      | 'symbol'
      | 'undefined'
      | 'object'
      | 'function'
  ): ClaimError =>
    new ClaimError(`invalid request: expected object, received ${type}`)
}

export class AttestationRequest extends String {
  public getClaim(): object {
    let claim: object
    try {
      claim = JSON.parse(this.valueOf()).claim
    } catch (e) {
      throw ClaimError.duringParsing
    }
    if (claim === undefined) {
      throw ClaimError.claimMissing
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
