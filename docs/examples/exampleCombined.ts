/* eslint-disable no-console */
import { testEnv1, testEnv2, mnemonic } from './exampleConfig'
import actorProcess from './offchain/1_actorProcess'
import issuanceProcess from './offchain/2_issuanceProcess'
import verificationProcessCombined from './offchain/3_verificationProcessCombined'
import Attester from '../../src/attestation/Attester'
import {
  AttesterPublicKey,
  AttesterPrivateKey,
} from '../../src/types/Attestation'
import teardown from './offchain/4_teardown'

const {
  pubKey: pubKey1,
  privKey: privKey1,
  disclosedAttributes: disclosedAttributes1,
  claim: claim1,
} = testEnv1
const {
  pubKey: pubKey2,
  privKey: privKey2,
  claim: claim2,
  disclosedAttributes: disclosedAttributes2,
} = testEnv2

// Do all processes from attestation, to possibly revocation and final verification
async function completeProcessCombined(
  expectedVerificationOutcome: boolean,
  doRevocation = false,
  reqUpdatesAfter: [Date?, Date?]
): Promise<boolean> {
  // create claimer and both attester entities
  let {
    // eslint-disable-next-line prefer-const
    claimer,
    // eslint-disable-next-line prefer-const
    attester: attester1,
    accumulator: accumulator1,
  } = await actorProcess({
    claimerMnemonic: mnemonic,
    claimerMnemonicPw: 'password',
    attesterPubKey: pubKey1,
    attesterPrivKey: privKey1,
  })
  const attester2 = new Attester(
    new AttesterPublicKey(pubKey2),
    new AttesterPrivateKey(privKey2)
  )
  const accumulator2 = await attester2.createAccumulator()

  // issue both credential
  const { credential: credential1, witness: witness1 } = await issuanceProcess({
    attester: attester1,
    claimer,
    accumulator: accumulator1,
    claim: claim1,
  })
  const { credential: credential2 } = await issuanceProcess({
    attester: attester2,
    claimer,
    accumulator: accumulator2,
    claim: claim2,
  })

  // (optionally) revoke credentials, could revoke any or both to fail verification process
  if (doRevocation) {
    console.log('revoke attestation')
    accumulator1 = await attester1.revokeAttestation({
      accumulator: accumulator1,
      witnesses: [witness1],
    })
  }

  // verify credential with revocation check
  const { verified } = await verificationProcessCombined({
    claimer,
    attesters: [attester1, attester2],
    credentials: [credential1, credential2],
    requestedAttributesArr: [disclosedAttributes1, disclosedAttributes2],
    reqUpdatesAfter, // requires that witnesses are updates after specified date or using the latests available accumulator
    accumulators: [accumulator1, accumulator2],
  })

  // check outcome
  const achievedExpectedOutcome = expectedVerificationOutcome === verified
  console.groupEnd()
  console.log(`Expected outcome achieved? ${achievedExpectedOutcome}`)
  return achievedExpectedOutcome
}

// all calls of completeProcessCombined should return true
async function completeProcessCombinedExamples(): Promise<void> {
  // we accept every accumulator when requiring past in reqUpdatedAfter
  const past = new Date()
  // we only accept the newest accumulator
  const future = new Date()
  future.setDate(past.getDate() + 100)
  // store outcomes here for CI check
  const outcomes: boolean[] = []

  // without credential revocation
  outcomes.push(
    await completeProcessCombined(true, false, [undefined, undefined])
  )

  // without credential revocation but required dates in future => should verify
  outcomes.push(await completeProcessCombined(true, false, [future, undefined]))
  outcomes.push(await completeProcessCombined(true, false, [undefined, future]))

  // with revocation of 2nd credential and required date in future => should not verify
  outcomes.push(await completeProcessCombined(false, true, [future, future]))

  // with revocation of 2nd credential but required date in past => should verify
  outcomes.push(await completeProcessCombined(true, true, [past, past]))

  // with revocation (2nd) but revocation not required in verification
  outcomes.push(await completeProcessCombined(true, true, [undefined, past]))

  // check whether outcome is true fall our instances and close wasm
  return teardown('offchain', outcomes)
}

completeProcessCombinedExamples()
