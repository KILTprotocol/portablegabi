/* eslint-disable no-console */
import Attester from '../../../src/attestation/Attester'
import Claimer from '../../../src/claim/Claimer'
import Accumulator from '../../../src/attestation/Accumulator'
import { Witness } from '../../../src/types/Attestation'
import Credential from '../../../src/claim/Credential'

function compareClaims(claim: any, claimFromAtt: any): void {
  const [keys1, values1] = Object.entries(claim)
  const [keys2, values2] = Object.entries(claimFromAtt)
  const checkKeys = keys1.filter((key) => keys2.includes(key)).length === 0
  const checkValues =
    values1.filter((val) => values2.includes(val)).length === 0
  if (!checkKeys || !checkValues) {
    console.error('Original claim and claim from attestation do not match!')
  }
}

// runs a complete issuance process for a claim
export async function issuanceProcess({
  attester,
  claimer,
  accumulator,
  claim,
}: {
  attester: Attester
  claimer: Claimer
  accumulator: Accumulator
  claim: Record<string, any>
}): Promise<{
  credential: Credential
  witness: Witness
}> {
  // attester needs to create nonce and context before each attestation
  const {
    message: startAttestationMsg,
    session: attestationSession,
  } = await attester.startAttestation()

  // claimer commits to nonce and requests attestation
  const {
    message: attestationRequest,
    session: claimerSession,
  } = await claimer.requestAttestation({
    startAttestationMsg,
    claim,
    attesterPubKey: attester.publicKey,
  })

  // the attester might want to inspect the attributes he is about to sign
  const checkClaim = attestationRequest.getClaim()
  compareClaims(claim, checkClaim)

  // attester issues credential
  const { attestation, witness } = await attester.issueAttestation({
    attestationSession,
    attestationRequest,
    accumulator,
  })

  // claimer builds credential from attestation and claimer session
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  return { credential, witness }
}
export default issuanceProcess
