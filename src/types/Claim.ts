/* eslint-disable max-classes-per-file */

import WasmData from './Wasm'
import { IIssueAttestation } from './Attestation'

/* eslint-disable @typescript-eslint/ban-ts-ignore */
export default interface IClaimer {
  requestAttestation: Function
  buildCredential: Function
  buildPresentation: Function
  buildCombinedPresentation: Function
}

export interface IClaimerChain {
  updateCredentialChain: Function
}

export interface IProof {
  proof: {
    A: 'string'
    a_disclosed: {
      [key: number]: string
    }
    a_responses: {
      [key: number]: string
    }
    c: string
    e_response: string
    nonrev_proof: {
      C_r: string
      C_u: string
      responses: {
        beta: string
        delta: string
        epsilon: string
        zeta: string
      }
      sacc: {
        data: string
        pk: number
      }
    }
    nonrev_response: string
    v_response: string
  }
}

/**
 * An error which can occur during the [[Attestation]] process.
 */
export class ClaimError extends Error {
  /**
   * An error which is thrown when the [[Attestation]] object cannot be deserialized to JSON.
   */
  public static duringParsing = new ClaimError(
    'invalid request: could not parse json'
  )

  /**
   * An error which is thrown when the [[Attestation]] object does not include the original claim object.
   */
  public static claimMissing = new ClaimError(
    'invalid request: claim is missing'
  )

  /**
   * An error which is thrown when the [[Attestation]] object includes a non-object type claim.
   *
   * @param type The type of the claim found in the [[Attestation]] object.
   * @returns A new claim error.
   */
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

/**
 * The message result of [[requestAttestation]] which is sent to the [[Attester]] and used in [[Attester.issueAttestation]].
 */
export class AttestationRequest extends WasmData {
  /**
   * Extracts the original claim object from the [[AttestationRequest]].
   *
   * @throws {ClaimError.duringParsing} If an error occurs during JSON deserialization.
   * @throws {ClaimError.claimMissing} If the claim is missing inside the [[AttestationRequest]].
   * @returns The original claim object which has been attested.
   */
  public getClaim(): object {
    let claim: object
    try {
      claim = this.parse()?.claim
    } catch (e) {
      throw ClaimError.duringParsing
    }
    if (claim === undefined) {
      throw ClaimError.claimMissing
    }
    return claim
  }
}

/**
 * The session result of [[requestAttestation]] which should be kept private by the [[Claimer]] and used in [[buildCredential]].
 */
export class ClaimerAttestationSession extends WasmData {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

/**
 * The result of [[buildPresentation]] which can be used to disclose attributes with a Verifier.
 */
export class Presentation extends WasmData {
  public parse(): IProof {
    return JSON.parse(this.toString())
  }
}

/**
 *  The result of [[buildCombinedPresentation]] which can be used to verify of multiple [[Credential]]s at once.
 */
export class CombinedPresentation extends WasmData {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

export interface ICredential<Claim> {
  claim: Claim
  credential: {
    attributes: string[]
    nonrevWitness: IIssueAttestation['nonrev']
    signature: IIssueAttestation['signature']
  }
  updateCounter: number
}
