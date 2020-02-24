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
  console.groupEnd()
  console.log(
    `Expected outcome achieved? ${expectedVerificationOutcome === verified}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessSingle should return true
async function completeProcessSingleExamples(): Promise<void> {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + 100)

  // without credential revocation
  await completeProcessSingle(true, false)

  // with credential revocation but accept old accumulator
  await completeProcessSingle(true, true, now)

  // with credential revocation but require new accumulator
  await completeProcessSingle(false, true, future)

  // close wasm
  return goWasmClose().finally(() => process.exit())
}

completeProcessSingleExamples()
