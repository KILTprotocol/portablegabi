/* eslint-disable no-console */
import Claimer from '../../../src/claim/Claimer'
import AttesterChain from '../../../src/attestation/Attester.chain'
import { IPresentationRequest } from '../../../src/types/Verification'
import Verifier from '../../../src/verification/Verifier'
import Credential from '../../../src/claim/Credential'
import connect from '../../../src/blockchainApiConnection/BlockchainApiConnection'

// runs a complete verification process on a credential
export async function verificationProcessCombinedChain({
  claimer,
  attesters,
  credentials,
  requestedAttributesArr,
  reqUpdatedAfter,
  reqNonRevocationProofArr,
}: {
  claimer: Claimer
  attesters: AttesterChain[]
  credentials: Credential[]
  requestedAttributesArr: string[][]
  reqUpdatedAfter: Date[]
  reqNonRevocationProofArr: boolean[]
}): Promise<{
  verified: boolean
  verifiedClaims: object[]
}> {
  if (
    attesters.length !== credentials.length ||
    credentials.length !== requestedAttributesArr.length ||
    requestedAttributesArr.length !== reqUpdatedAfter.length ||
    reqUpdatedAfter.length !== reqNonRevocationProofArr.length ||
    reqNonRevocationProofArr.length !== attesters.length
  ) {
    throw new Error(
      'Input array lengths do not match up in "verificationProcessCombinedChain"'
    )
  }
  console.group()
  const attesterPubKeys = attesters.map((attester) => attester.publicKey)
  const blockchain = await connect()
  const accumulators = await Promise.all(
    attesters.map((attester) => {
      return blockchain.getLatestAccumulator(attester.address)
    })
  )

  // verifier requests presentation for each credential and combines request by calling `finalise`
  // build combined requests
  const requests: IPresentationRequest[] = requestedAttributesArr.map(
    (requestedAttributes, idx) => ({
      requestedAttributes,
      reqNonRevocationProof: reqNonRevocationProofArr[idx],
      reqUpdatedAfter: reqUpdatedAfter[idx],
    })
  )
  // request combined presentation
  const {
    message: combinedPresentationReq,
    session: combinedSession,
  } = await Verifier.requestCombinedPresentation(requests)

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
  } = await Verifier.verifyCombinedPresentation({
    proof,
    attesterPubKeys,
    verifierSession: combinedSession,
    latestAccumulators: accumulators,
  })

  console.log(`Claim could ${verified ? 'be verified' : 'not be verified'}`)
  console.groupEnd()
  return {
    verified,
    verifiedClaims,
  }
}

export default verificationProcessCombinedChain
