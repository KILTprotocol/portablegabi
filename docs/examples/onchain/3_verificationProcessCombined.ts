/* eslint-disable no-console */
import GabiClaimerChain from '../../../src/claim/GabiClaimer.chain'
import GabiAttesterChain from '../../../src/attestation/GabiAttester.chain'
import { Credential } from '../../../src/types/Claim'
import GabiVerifierChain from '../../../src/verification/GabiVerifier.chain'
import { IPresentationRequestChain } from '../../../src/types/Verification'

// runs a complete verification process on a credential
export async function verificationProcessCombinedChain({
  claimer,
  attesters,
  credentials,
  requestedAttributesArr,
  reqIndexArr,
  reqNonRevocationProofArr,
}: {
  claimer: GabiClaimerChain
  attesters: GabiAttesterChain[]
  credentials: Credential[]
  requestedAttributesArr: string[][]
  reqIndexArr: Array<number | 'latest'>
  reqNonRevocationProofArr: boolean[]
}): Promise<{
  verified: boolean
  verifiedClaims: object[]
}> {
  if (
    attesters.length !== credentials.length ||
    credentials.length !== requestedAttributesArr.length ||
    requestedAttributesArr.length !== reqIndexArr.length ||
    reqIndexArr.length !== reqNonRevocationProofArr.length ||
    reqNonRevocationProofArr.length !== attesters.length
  ) {
    throw new Error(
      'Input array lengths do not match up in "verificationProcessCombinedChain"'
    )
  }
  console.group()
  const attesterPubKeys = attesters.map(attester => attester.publicKey)

  // verifier requests presentation for each credential and combines request by calling `finalise`
  // build combined requests
  const requests: IPresentationRequestChain[] = requestedAttributesArr.map(
    (requestedAttributes, idx) => ({
      requestedAttributes,
      reqNonRevocationProof: reqNonRevocationProofArr[idx],
      reqIndex: reqIndexArr[idx],
      attesterIdentity: attesters[idx].getPublicIdentity(),
    })
  )
  // request combined presentation
  const {
    message: combinedPresentationReq,
    session: combinedSession,
  } = await GabiVerifierChain.requestCombinedPresentationChain(requests)

  // claimer builds combined presentation
  const proof = await claimer.buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  })

  // verifier checks each claim and returns true if all claims could be verified
  const {
    verified,
    claims: verifiedClaims,
  } = await GabiVerifierChain.verifyCombinedPresentation({
    proof,
    attesterPubKeys,
    verifierSession: combinedSession,
  })

  console.log(`Claim could ${verified ? 'be verified' : 'not be verified'}`)
  console.groupEnd()
  return {
    verified,
    verifiedClaims,
  }
}

export default verificationProcessCombinedChain
