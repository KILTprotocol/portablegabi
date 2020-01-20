// eslint-disable-next-line max-classes-per-file
export default interface IGabiClaimer {
  requestAttestation: Function
  buildCredential: Function
  revealAttributes: Function
}

export class AttestationRequest extends String {}
export class ClaimerAttestationSession extends String {}
