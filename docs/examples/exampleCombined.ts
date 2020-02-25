/* eslint-disable no-console */
import { testEnv1, testEnv2, mnemonic } from './exampleConfig'
import actorProcess from './offchain/1_actorProcess'
import issuanceProcess from './offchain/2_issuanceProcess'
import verificationProcessCombined from './offchain/3_verificationProcessCombined'
import GabiAttester from '../../src/attestation/GabiAttester'
import {
  AttesterPublicKey,
  AttesterPrivateKey,
} from '../../src/types/Attestation'
import { goWasmClose } from '../../src/wasm/wasm_exec_wrapper'

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
  const attester2 = new GabiAttester(
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
  console.log(
    `Expected outcome achieved? ${expectedVerificationOutcome === verified}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessCombined should return true
async function completeProcessCombinedExamples(): Promise<void> {
  // we accept every accumulator create later on
  const now = new Date()
  // we only accept the newest accumulator
  const future = new Date()
  future.setDate(now.getDate() + 100)

  // without credential revocation
  await completeProcessCombined(true, false, [undefined, undefined])

  // with revocation of 1st credential
  await completeProcessCombined(false, true, [future, future])

  // with revocation (1st) but revocation not required in verification
  await completeProcessCombined(true, true, [undefined, future])

  // close wasm
  return goWasmClose().finally(() => process.exit())
}

completeProcessCombinedExamples()
