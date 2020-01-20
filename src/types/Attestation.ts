// eslint-disable-next-line max-classes-per-file
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

export class AttesterAttestationSession extends String {}
export class InitiateAttestationRequest extends String {}
export class Accumulator extends String {}
export class Witness extends String {}
export class Attestation extends String {}
