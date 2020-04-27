/* eslint-disable no-console */
import { testEnv1, mnemonic } from './exampleConfig'
import actorProcess from './offchain/1_actorProcess'
import issuanceProcess from './offchain/2_issuanceProcess'
import verificationProcessSingle from './offchain/3_verificationProcessSingle'
import { goWasmClose } from '../../src/wasm/wasm_exec_wrapper'

const { pubKey, privKey, disclosedAttributes, claim } = testEnv1

// all processes from attestation, to possibly revocation and final verification
async function completeProcessSingle(
  expectedVerificationOutcome: boolean,
  doRevocation = false,
  reqUpdatedAfter?: Date
): Promise<boolean> {
  console.group()
  // create claimer and attester entities
  // eslint-disable-next-line prefer-const
  let { claimer, attester, accumulator } = await actorProcess({
    claimerMnemonic: mnemonic,
    claimerMnemonicPw: 'password',
    attesterPubKey: pubKey,
    attesterPrivKey: privKey,
  })

  // issue credential
  const { credential, witness } = await issuanceProcess({
    attester,
    claimer,
    accumulator,
    claim,
  })

  // (optionally) revoke credentials
  if (doRevocation) {
    accumulator = await attester.revokeAttestation({
      accumulator,
      witnesses: [witness],
    })
  }

  // verify credential with revocation check
  const { verified } = await verificationProcessSingle({
    claimer,
    attester,
    credential,
    requestedAttributes: disclosedAttributes,
    reqUpdatedAfter, // require that the witness is not older than the provided date or updated to the latest accumulator
    accumulator,
  })

  // check outcome
  const achievedExpectedOutcome = expectedVerificationOutcome === verified
  console.groupEnd()
  console.log(`Expected outcome achieved? ${achievedExpectedOutcome}`)
  return achievedExpectedOutcome
}

// all calls of completeProcessSingle should return true
async function completeProcessSingleExamples(): Promise<void> {
  // we accept every accumulator when requiring past in reqUpdatedAfter
  const past = new Date()
  // we only accept the newest accumulator
  const future = new Date()
  future.setDate(past.getDate() + 100)

  // without credential revocation
  await completeProcessSingle(true, false, undefined)

  // without revocation but required dates in future => should verify
  await completeProcessSingle(true, false, future)

  // with revocation and required date in future => should not verify
  await completeProcessSingle(false, true, future)

  // with revocation but required date in past => should verify
  await completeProcessSingle(true, true, past)

  // with revocation but revocation not required in verification
  await completeProcessSingle(true, true, undefined)

  // close wasm
  return goWasmClose()
}

completeProcessSingleExamples()
