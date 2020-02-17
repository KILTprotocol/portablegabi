/* eslint-disable no-console */
import GabiClaimer from '../../../src/claim/GabiClaimer'
import GabiAttester from '../../../src/attestation/GabiAttester'
import {
  VerificationSession,
  PresentationRequest,
} from '../../../src/types/Verification'
import { Presentation, Credential } from '../../../src/types/Claim'
import GabiVerifier from '../../../src/verification/GabiVerifier'

// runs a complete verification process on a credential
export async function verificationProcessSingle({
  claimer,
  attester,
  credential,
  requestedAttributes,
  reqMinIndex,
  reqNonRevocationProof,
}: {
  claimer: GabiClaimer
  attester: GabiAttester
  credential: Credential
  requestedAttributes: string[]
  reqMinIndex: number
  reqNonRevocationProof: boolean
}): Promise<{
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  presentation: Presentation
  verified: boolean
  verifiedClaim: object
}> {
  // verifier sends nonce and context to claimer + requests disclosed attributes
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestedAttributes,
    reqNonRevocationProof,
    reqMinIndex,
  })

  // claimer commits to nonce and builds presentation from credential
  const presentation = await claimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: attester.publicKey,
  })
  // verifier checks presentation for non revocation, valid data and matching attester's public key
  const {
    verified,
    claim: verifiedClaim,
  } = await GabiVerifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
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

export default verificationProcessSingle
