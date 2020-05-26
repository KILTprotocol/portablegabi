/* eslint-disable no-console */
import Claimer from '../../../src/claim/Claimer'
import AttesterChain from '../../../src/attestation/Attester.chain'
import {
  VerificationSession,
  PresentationRequest,
} from '../../../src/types/Verification'
import { Presentation } from '../../../src/types/Claim'
import Verifier from '../../../src/verification/Verifier'
import Accumulator from '../../../src/attestation/Accumulator'
import Credential from '../../../src/claim/Credential'

// runs a complete verification process on a credential
export async function verificationProcessSingleChain({
  claimer,
  attester,
  credential,
  requestedAttributes,
  reqUpdatedAfter,
  accumulator,
}: {
  claimer: Claimer
  attester: AttesterChain
  credential: Credential
  requestedAttributes: string[]
  reqUpdatedAfter?: Date
  accumulator: Accumulator
}): Promise<{
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  presentation: Presentation
  verified: boolean
  verifiedClaim: Record<string, unknown>
}> {
  // verifier sends nonce and context to claimer + requests disclosed attributes
  const {
    session: verifierSession,
    message: presentationReq,
  } = await Verifier.requestPresentation({
    requestedAttributes,
    reqUpdatedAfter,
  })

  // claimer commits to nonce and builds presentation from credential
  const presentation = await claimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: attester.publicKey,
  })

  // verifier checks presentation for non revocation, valid data and matching attester's public key
  const { verified, claim: verifiedClaim } = await Verifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
    latestAccumulator: accumulator,
  })
  console.log(`Claim could ${verified ? 'be verified' : 'not be verified'}`)
  return {
    verifierSession,
    presentationReq,
    presentation,
    verified,
    verifiedClaim,
  }
}

export default verificationProcessSingleChain
