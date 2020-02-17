/* eslint-disable no-console */
import GabiClaimerChain from '../../../src/claim/GabiClaimer.chain'
import GabiAttesterChain from '../../../src/attestation/GabiAttester.chain'
import {
  VerificationSession,
  PresentationRequest,
} from '../../../src/types/Verification'
import { Presentation, Credential } from '../../../src/types/Claim'
import GabiVerifierChain from '../../../src/verification/GabiVerifier.chain'

// runs a complete verification process on a credential
export async function verificationProcessSingleChain({
  claimer,
  attester,
  credential,
  requestedAttributes,
  reqIndex,
  reqNonRevocationProof,
}: {
  claimer: GabiClaimerChain
  attester: GabiAttesterChain
  credential: Credential
  requestedAttributes: string[]
  reqIndex: number | 'latest'
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
  } = await GabiVerifierChain.requestPresentationChain({
    requestedAttributes,
    reqNonRevocationProof,
    reqIndex,
    attesterIdentity: attester.getPublicIdentity(),
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
  } = await GabiVerifierChain.verifyPresentation({
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

export default verificationProcessSingleChain
