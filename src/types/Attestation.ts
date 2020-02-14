/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable-next-line max-classes-per-file */
import Accumulator from '../attestation/Accumulator'

export interface IGabiMsgSession {
  message: string
  session: string
}

export default interface IGabiAttester {
  publicKey: AttesterPublicKey
  createAccumulator: Function
  startAttestation: Function
  issueAttestation: Function
  revokeAttestation: Function
}

export class AttesterPublicKey extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class AttesterPrivateKey extends String {
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
export class Witness extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}
export class Attestation extends String {
  // @ts-ignore
  private thisIsOnlyHereToPreventClassMixes: int
}

export interface IPublicIdentity {
  publicKey: AttesterPublicKey
  address: string
}
export interface IGabiAttesterChain extends IGabiAttester {
  address: string
  getPublicIdentity: () => IPublicIdentity
  revokeAttestation: ({
    witnesses,
    accumulator,
  }: {
    witnesses: Witness[]
    accumulator?: Accumulator
  }) => Promise<Accumulator>
  updateAccumulator: (accumulator: Accumulator) => Promise<void>
}
