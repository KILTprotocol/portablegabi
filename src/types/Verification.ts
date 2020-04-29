/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable max-classes-per-file */

import { KeyLength } from './Attestation'
import WasmData from './Wasm'

export interface IPresentationRequest {
  requestedAttributes: string[]
  reqUpdatedAfter?: Date
  keyLength?: KeyLength
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
export class VerificationSession extends WasmData {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

/**
 * The message result of [[requestPresentation]] which should be sent to the [[Claimer]] and used in [[buildPresentation]].
 */
export class PresentationRequest extends WasmData {
  /**
   * Returns the attributes a [[Verifier]] requested during [[requestPresentation]].
   *
   * @throws `Invalid request` If the parsed object of this [[PresentationRequest]] does not have the correct structure (missing mandatory properties).
   * @returns An array of strings representing the requested attributes of a [[Claimer]]'s claim.
   */
  public getRequestedProperties(): string[] {
    const parsed = this.parse()
    if ('partialPresentationRequest' in parsed) {
      const { partialPresentationRequest } = parsed
      if ('requestedAttributes' in partialPresentationRequest) {
        return partialPresentationRequest.requestedAttributes
      }
    }
    throw new Error('Invalid request')
  }
}

/**
 * The session result of [[requestCombinedPresentation]] which should be kept private by the [[Verifier]] and used in [[verifyCombinedPresentation]].
 */
export class CombinedVerificationSession extends WasmData {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

/**
 * The message result of [[requestCombinedPresentation]] which should be sent to the [[Claimer]] and used in [[buildCombiendPresentation]].
 */
export class CombinedPresentationRequest extends WasmData {
  /**
   * Returns the attributes a [[Verifier]] requested during [[requestCombinedPresentation]].
   *
   * @throws `Invalid request` If the parsed object of this [[CombinedPresentationRequest]] does not have the correct structure (missing mandatory properties).
   * @returns An array of array of strings representing the requested attributes of a [[Claimer]]'s claim.
   */
  public getRequestedProperties(): string[][] {
    const parsed = this.parse()
    if ('partialPresentationRequests' in parsed) {
      const { partialPresentationRequests } = parsed
      return partialPresentationRequests.map(
        (req: { requestedAttributes: unknown }) => req.requestedAttributes
      )
    }
    throw new Error('Invalid request')
  }
}
