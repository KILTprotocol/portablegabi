/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable max-classes-per-file */

export interface IPresentationRequest {
  requestedAttributes: string[]
  reqUpdatedAfter?: Date
}

export interface IVerifiedPresentation {
  verified: boolean
  claim: object
}

export interface IVerifiedCombinedPresentation {
  verified: boolean
  claims: object[]
}

/**
 * The session result of [[requestPresentation]] which should be kept private by the [[Verifier]] and used in [[verifyPresentation]].
 */
export class VerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

/**
 * The message result of [[requestPresentation]] which should be sent to the [[Claimer]] and used in [[buildPresentation]].
 */
export class PresentationRequest extends String {
  private parseCache?: {
    partialPresentationRequest: {
      requestedAttributes: string[]
      reqNonRevocationproof: boolean
      reqUpdatedAfter: string
    }
    context: string
    nonce: string
  }

  /**
   * Returns the [[Verifier]]'s requested date for the presentation of the [[PresentationRequest]].
   *
   * @throws `Invalid presentation request` If the reqUpdateAfter field is missing or empty.
   * @returns The required date of the [[PresentationRequest]] as ISO string.
   */
  public getDate(): Date {
    let parsed = this.parseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const date = parsed?.partialPresentationRequest?.reqUpdatedAfter
      if (date && typeof date === 'string') {
        this.parseCache = parsed
        return new Date(date)
      }
      throw new Error()
    } catch (e) {
      throw new Error('Invalid presentation request, missing required date')
    }
  }
}

/**
 * The session result of [[requestCombinedPresentation]] which should be kept private by the [[Verifier]] and used in [[verifyCombinedPresentation]].
 */
export class CombinedVerificationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

/**
 * The message result of [[requestCombinedPresentation]] which should be sent to the [[Claimer]] and used in [[buildCombiendPresentation]].
 */
export class CombinedPresentationRequest extends String {
  private parseCache?: {
    partialPresentationRequests: Array<{
      requestedAttributes: string[]
      reqNonRevocationproof: boolean
      reqUpdatedAfter: string
    }>
    context: string
    nonce: string
  }

  /**
   * Returns the [[Verifier]]'s requested dates for the presentation of the [[CombinedPresentationRequest]].
   *
   * @throws `Invalid combined presentation request` If for any request the reqUpdateAfter field is missing or empty.
   * @returns An array of required dates as ISO strings.
   */
  public getDates(): Date[] {
    let parsed = this.parseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const requests = parsed?.partialPresentationRequests
      if (
        requests &&
        Array.isArray(requests) &&
        requests.every(
          req => req.reqUpdatedAfter && typeof req.reqUpdatedAfter === 'string'
        )
      ) {
        this.parseCache = parsed
        return requests.map(req => new Date(req.reqUpdatedAfter))
      }
      throw new Error()
    } catch (e) {
      throw new Error(
        'Invalid combined presentation request, missing at least one required date'
      )
    }
  }
}
