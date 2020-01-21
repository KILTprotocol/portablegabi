/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
export interface IGabiMsgSession {
  message: string
  session: string
}

export default interface IGabiAttester {
  startAttestation: Function
  issueAttestation: Function
  revokeAttestation: Function
  getPubKey: Function
  createAccumulator: Function
}

export class AttesterPublicKey extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class AttesterAttestationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class InitiateAttestationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class Accumulator extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class Witness extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
export class Attestation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: any
}
