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
  reqMinIndexArr: [number, number] = [0, 0],
  reqNonRevocationProofArr: [boolean, boolean] = [true, true]
): Promise<boolean> {
  // create claimer and both attester entitites
  const {
    claimer,
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
    await attester1.revokeAttestation({
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
    reqMinIndexArr, // require accumulator's revocation index of 0 or greater
    reqNonRevocationProofArr, // check revocation status
  })
  console.log(
    `Expected outcome achieved? ${expectedVerificationOutcome === verified}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessCombined should return true
async function completeProcessCombinedExamples(): Promise<void> {
  // without credential revocation
  await completeProcessCombined(true, false, [0, 0])

  // without credential revocation but revocation index out of range (too big)
  await completeProcessCombined(false, false, [0, 1])
  await completeProcessCombined(false, false, [1, 0])

  // with revocation of 1st credential
  await completeProcessCombined(false, true, [1, 0])

  // with revocation (1st) but revocation index out of range (too small/old)
  await completeProcessCombined(true, true, [0, 0])

  // with revocation (1st) but revocation not required in verification
  await completeProcessCombined(true, true, [1, 0], [false, true])

  // close wasm
  return goWasmClose()
}

completeProcessCombinedExamples()
