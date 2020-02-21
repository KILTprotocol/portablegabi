/* eslint-disable no-console */
import GabiClaimer from '../../../src/claim/GabiClaimer'
import GabiAttesterChain from '../../../src/attestation/GabiAttester.chain'
import { IPresentationRequest } from '../../../src/types/Verification'
import GabiVerifier from '../../../src/verification/GabiVerifier'
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
  claimer: GabiClaimer
  attesters: GabiAttesterChain[]
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
  const attesterPubKeys = attesters.map(attester => attester.publicKey)
  const blockchain = await connect()
  const accumulators = await Promise.all(
    attesters.map(attester => {
      return blockchain.getLatestAccumulator(
        attester.getPublicIdentity().address
      )
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
  } = await GabiVerifier.requestCombinedPresentation(requests)

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
  } = await GabiVerifier.verifyCombinedPresentation({
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
