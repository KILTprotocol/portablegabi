import * as portablegabi from '../../../../src'
import { testEnv1 } from '../../exampleConfig'

const pubKey = new portablegabi.AttesterPublicKey(testEnv1.pubKey)
const privKey = new portablegabi.AttesterPrivateKey(testEnv1.privKey)

/**
 * In case you have to change something here, please copy paste the inside of this function (without return)
 * to 2_attestation.md below privKey generation L#37 of the tutorial example
 */
export default async function tutorialAttestation() {
  const attester = new portablegabi.Attester(pubKey, privKey)

  // Create a new accumulator (which is used for revocation).
  const accumulator = await attester.createAccumulator()
  console.log('Accumulator:\n\t', accumulator.toString())

  // Build a new claimer and generate a new master key.
  // const claimer = await portablegabi.Claimer.create()
  // or use a mnemonic:
  const claimer = await portablegabi.Claimer.buildFromMnemonic(
    'siege decrease quantum control snap ride position strategy fire point airport include'
  )

  // The attester initiates the attestation session.
  const {
    message: startAttestationMsg,
    session: attestationSession,
  } = await attester.startAttestation()

  // The claimer answers with an attestation request.
  const claim = {
    age: 15,
    name: 'George',
  }

  const {
    message: attestationRequest,
    session: claimerSession,
  } = await claimer.requestAttestation({
    // The received attestation message.
    startAttestationMsg,
    // The claim which should get attested.
    claim,
    // The public key of the attester.
    attesterPubKey: attester.publicKey,
  })

  // The attester should check the claim they are about to attest.
  const receivedClaim = attestationRequest.getClaim()
  console.log('Claim built from attestation\n\t', receivedClaim)

  // Do checks on receivedClaim.
  // If everything checks out the attester issues an attestation.
  const {
    // The attestation should be sent over to the claimer.
    attestation,
    // The witness should be stored for later revocation.
    witness,
  } = await attester.issueAttestation({
    attestationSession,
    attestationRequest,
    // The update is used to generate a non-revocation witness.
    accumulator,
  })
  console.log('Witness:\n\t', witness.toString())

  // After the claimer has received their attestation, they can build their credential.
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  console.log('Credential:\n\t', credential.toString())

  return { pubKey, attester, claimer, credential, accumulator, witness }
}
