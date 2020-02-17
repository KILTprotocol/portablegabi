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
  reqMinIndex = 0,
  reqNonRevocationProof = true
): Promise<boolean> {
  console.group()
  // create claimer and attester entitites
  const { claimer, attester, accumulator } = await actorProcess({
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
    await attester.revokeAttestation({ accumulator, witnesses: [witness] })
  }

  // verify credential with revocation check
  const { verified } = await verificationProcessSingle({
    claimer,
    attester,
    credential,
    requestedAttributes: disclosedAttributes,
    reqMinIndex, // require accumulator's revocation index of 0 or greater
    reqNonRevocationProof, // check revocation status
  })
  console.groupEnd()
  console.log(
    `Expected outcome achieved? ${expectedVerificationOutcome === verified}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessSingle should return true
async function completeProcessSingleExamples(): Promise<void> {
  // without credential revocation
  await completeProcessSingle(true, false, 0)

  // without credential revocation but revocation index out of range (too big)
  await completeProcessSingle(false, false, 1)

  // with credential revocation
  await completeProcessSingle(false, true, 1)

  // with credential revocation but revocation index out of range (too small/old)
  await completeProcessSingle(true, true, 0)

  // with credential revocation but revocation not required in verification
  await completeProcessSingle(true, true, 1, false)

  // close wasm
  return goWasmClose()
}

completeProcessSingleExamples()
