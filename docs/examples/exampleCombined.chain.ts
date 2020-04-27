/* eslint-disable no-console */
import Blockchain from '../../src/blockchain/Blockchain'
import connect from '../../src/blockchainApiConnection/BlockchainApiConnection'
import { testEnv1, testEnv2, mnemonic } from './exampleConfig'
import actorProcessChain from './onchain/1_actorProcess'
import issuanceProcess from './offchain/2_issuanceProcess'
import verificationProcessCombinedChain from './onchain/3_verificationProcessCombined'
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
async function completeProcessCombined({
  blockchain,
  expectedVerificationOutcome,
  doRevocation = false,
  reqUpdatedAfter = [new Date(), new Date()],
  reqNonRevocationProofArr = [true, true],
}: {
  blockchain: Blockchain
  expectedVerificationOutcome: boolean
  doRevocation: boolean
  reqUpdatedAfter: [Date, Date]
  reqNonRevocationProofArr: [boolean, boolean]
}): Promise<boolean> {
  // create claimer and both attester entities
  const {
    claimer,
    attester: attester1,
    accumulator: accumulator1,
  } = await actorProcessChain({
    blockchain,
    claimerMnemonic: mnemonic,
    claimerMnemonicPw: 'password',
    attesterPubKey: pubKey1,
    attesterPrivKey: privKey1,
    attesterURI: '//Alice',
  })
  const {
    attester: attester2,
    accumulator: accumulator2,
  } = await actorProcessChain({
    blockchain,
    attesterPubKey: pubKey2,
    attesterPrivKey: privKey2,
    attesterURI: '//Bob',
  })

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
    console.log(
      'AccumulatorCount before revocation:',
      await blockchain.getAccumulatorCount(attester1.address)
    )
    await attester1.revokeAttestation({
      accumulator: accumulator1,
      witnesses: [witness1],
    })

    console.log(
      'AccumulatorCount after revocation:',
      await blockchain.getAccumulatorCount(attester1.address)
    )
  }
  // verify credential with revocation check
  const { verified } = await verificationProcessCombinedChain({
    claimer,
    attesters: [attester1, attester2],
    credentials: [credential1, credential2],
    requestedAttributesArr: [disclosedAttributes1, disclosedAttributes2],
    reqUpdatedAfter,
    reqNonRevocationProofArr, // check revocation status
  })

  // check outcome
  const achievedExpectedOutcome = expectedVerificationOutcome === verified
  console.groupEnd()
  console.log(`Expected outcome achieved? ${achievedExpectedOutcome}`)
  return achievedExpectedOutcome
}

// all calls of completeProcessCombined should return true
async function completeProcessCombinedExamples(): Promise<void> {
  // connect to chain
  const blockchain = await connect({
    pgabiModName: 'portablegabi',
  })
  console.log('Connected to chain')
  // we accept every accumulator when requiring past in reqUpdatedAfter
  const past = new Date(0)
  // we only accept the newest accumulator
  const future = new Date()
  // store outcomes here for CI check
  const outcomes: boolean[] = []

  // without credential revocation
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: false,
      reqUpdatedAfter: [past, past],
      reqNonRevocationProofArr: [true, true],
    })
  )

  // without credential revocation but required dates in future => should verify
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: false,
      reqUpdatedAfter: [future, past],
      reqNonRevocationProofArr: [true, false],
    })
  )
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: false,
      reqUpdatedAfter: [past, future],
      reqNonRevocationProofArr: [false, true],
    })
  )

  // with revocation of 2nd credential and required date in future => should not verify
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: false,
      doRevocation: true,
      reqUpdatedAfter: [future, future],
      reqNonRevocationProofArr: [true, true],
    })
  )

  // with revocation of 2nd credential but required date in past => should verify
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: true,
      reqUpdatedAfter: [future, past],
      reqNonRevocationProofArr: [false, true],
    })
  )

  // with revocation (2nd) but revocation not required in verification
  outcomes.push(
    await completeProcessCombined({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: true,
      reqUpdatedAfter: [past, past],
      reqNonRevocationProofArr: [false, false],
    })
  )

  // check whether outcome is true for all our instances and disconnect from chain
  return teardown('onchain', outcomes)
}

completeProcessCombinedExamples()
