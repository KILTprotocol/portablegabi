/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as portablegabi from '../../../../src'

/**
 * In case you have to change something here, please copy paste the inside of this function (without return)
 * to 3_verification.md below pubKey generation L#55 of the tutorial example
 */
export default async function tutorialVerification({
  pubKey,
  attester,
  claimer,
  credential,
  accumulator,
}: any) {
  // The verifier requests a presentation.
  const {
    // Local information used to verify the presentation later.
    session: verifierSession,
    // The request which should be sent to the claimer containing the requested attributes.
    message: presentationReq,
  } = await portablegabi.Verifier.requestPresentation({
    // Specify which attributes should be disclosed.
    requestedAttributes: ['age'],
    // The threshold for the age of the accumulator.
    // If the accumulator was created before this date, the proof will be rejected
    // except if the accumulator is the newest available accumulator.
    reqUpdatedAfter: new Date(),
  })

  // After the claimer has received the presentationRequest, they build a presentation:
  const presentation = await claimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: pubKey,
  })
  console.log('Presentation:\n\t', presentation.toString())

  // The presentation is sent over to the verifier who validates the proof and extracts the claim.
  const {
    // The contained claim, this value is undefined if the proof could not be validated.
    claim: publicClaim,
    // A boolean which indicates whether the presentation was valid.
    verified,
  } = await portablegabi.Verifier.verifyPresentation({
    // The presentation which was sent over by the claimer.
    proof: presentation,
    verifierSession,
    // The public key which was used by the attester to sign the credential.
    attesterPubKey: pubKey,
    // This accumulator is used to check whether the claimer provided the newest available accumulator.
    latestAccumulator: accumulator,
  })
  console.log('Public claim:\n\t', publicClaim)
  console.log('Verified?', verified)
  return true
}
