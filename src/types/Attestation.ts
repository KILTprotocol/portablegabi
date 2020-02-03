/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
export interface IGabiMsgSession {
  message: string
  session: string
}

export default interface IGabiAttester {
  createAccumulator: Function
  getPubKey: Function
  startAttestation: Function
  issueAttestation: Function
  revokeAttestation: Function
}

export class AttesterPublicKey extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class AttesterAttestationSession extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class InitiateAttestationRequest extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Accumulator extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Witness extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Attestation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
