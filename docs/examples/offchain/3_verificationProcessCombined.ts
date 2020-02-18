/* eslint-disable no-console */
import GabiClaimer from '../../../src/claim/GabiClaimer'
import GabiAttester from '../../../src/attestation/GabiAttester'
import { Credential } from '../../../src/types/Claim'
import GabiVerifier from '../../../src/verification/GabiVerifier'
import CombinedRequestBuilder from '../../../src/verification/CombinedRequestBuilder'
import Accumulator from '../../../src/attestation/Accumulator'

// runs a complete verification process on a credential
export async function verificationProcessCombined({
  claimer,
  attesters,
  credentials,
  requestedAttributesArr,
  reqUpdatesAfter,
  accumulators,
}: {
  claimer: GabiClaimer
  attesters: GabiAttester[]
  credentials: Credential[]
  requestedAttributesArr: string[][]
  reqUpdatesAfter: Array<Date | undefined>
  accumulators: Array<Accumulator | undefined>
}): Promise<{
  verified: boolean
  verifiedClaims: object[]
}> {
  if (
    attesters.length !== credentials.length ||
    attesters.length !== requestedAttributesArr.length ||
    attesters.length !== reqUpdatesAfter.length
  ) {
    throw new Error(
      'Input array lengths do not match up in "verificationProcessCombined"'
    )
  }
  console.group()
  const attesterPubKeys = attesters.map(attester => attester.publicKey)

  // verifier requests presentation for each credential and combines request by calling `finalise`
  // call requestPresentation for every array index
  const { message, session } = await requestedAttributesArr
    .reduce(
      (cBuilder, requestedAttributes, idx) =>
        cBuilder.requestPresentation({
          requestedAttributes,
          reqUpdatedAfter: reqUpdatesAfter[idx],
        }),
      new CombinedRequestBuilder()
    )
    .finalise()

  // claimer builds combined presentation
  const proof = await claimer.buildCombinedPresentation({
    credentials,
    combinedPresentationReq: message,
    attesterPubKeys,
  })

  // verifier checks each claim and returns true if all claims could be verified
  const {
    verified,
    claims: verifiedClaims,
  } = await GabiVerifier.verifyCombinedPresentation({
    proof,
    attesterPubKeys,
    verifierSession: session,
    latestAccumulators: accumulators,
  })

  console.log(`Claim could ${verified ? 'be verified' : 'not be verified'}`)
  console.groupEnd()
  return {
    verified,
    verifiedClaims,
  }
}

export default verificationProcessCombined
