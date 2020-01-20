// eslint-disable-next-line max-classes-per-file
export default interface IGabiClaimer {
  requestAttestation: Function
  buildCredential: Function
  buildPresentation: Function
}

export class AttestationRequest extends String {}
export class ClaimerAttestationSession extends String {}
export class Presentation extends String {}
export class CombinedPresentation extends String {}
export class Credential extends String {}
