/* eslint-disable no-console */
import Blockchain from '../../src/blockchain/Blockchain'
import connect from '../../src/blockchainApiConnection/BlockchainApiConnection'
import { testEnv1, mnemonic } from './exampleConfig'
import actorProcessChain from './onchain/1_actorProcess'
import verificationProcessSingleChain from './onchain/3_verificationProcessSingle'
import issuanceProcess from './offchain/2_issuanceProcess'
import teardown from './offchain/4_teardown'

const { pubKey, privKey, disclosedAttributes, claim } = testEnv1

// all processes from attestation, to possibly revocation and final verification
async function completeProcessSingle({
  blockchain,
  expectedVerificationOutcome,
  doRevocation = false,
  reqUpdatedAfter,
}: {
  blockchain: Blockchain
  expectedVerificationOutcome: boolean
  doRevocation: boolean
  reqUpdatedAfter?: Date
}): Promise<boolean> {
  console.group()
  // create claimer and attester entities
  // eslint-disable-next-line prefer-const
  let { claimer, attester, accumulator } = await actorProcessChain({
    blockchain,
    claimerMnemonic: mnemonic,
    claimerMnemonicPw: 'password',
    attesterPubKey: pubKey,
    attesterPrivKey: privKey,
    attesterURI: '//Alice',
  })

  // issue credential (off-chain method)
  const { credential, witness } = await issuanceProcess({
    attester,
    claimer,
    accumulator,
    claim,
  })

  // (optionally) revoke credentials
  if (doRevocation) {
    console.log(
      'AccumulatorCount before revocation:',
      await blockchain.getAccumulatorCount(attester.address)
    )
    accumulator = await attester.revokeAttestation({
      accumulator,
      witnesses: [witness],
    })
    const tx = await attester.buildUpdateAccumulatorTX(accumulator)
    await blockchain.signAndSend(tx, attester.keyringPair)

    console.log(
      'AccumulatorCount after revocation:',
      await blockchain.getAccumulatorCount(attester.address)
    )
  }

  // verify credential with revocation check
  const { verified } = await verificationProcessSingleChain({
    claimer,
    attester,
    credential,
    requestedAttributes: disclosedAttributes,
    reqUpdatedAfter,
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
  // connect to chain
  const blockchain = await connect({
    pgabiModName: 'portablegabiPallet',
  })
  console.log('Connected to chain')
  // we accept every accumulator when requiring past in reqUpdatedAfter
  const past = new Date(0)
  // we only accept the newest accumulator
  const future = new Date()
  future.setDate(future.getDate() + 100)
  // store outcomes here for CI check
  const outcomes: boolean[] = []

  // without credential revocation
  outcomes.push(
    await completeProcessSingle({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: false,
      reqUpdatedAfter: past,
    })
  )

  // without revocation but required date in future => should verify
  outcomes.push(
    await completeProcessSingle({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: false,
      reqUpdatedAfter: future,
    })
  )

  // with revocation and required date in future => should not verify
  outcomes.push(
    await completeProcessSingle({
      blockchain,
      expectedVerificationOutcome: false,
      doRevocation: true,
      reqUpdatedAfter: future,
    })
  )

  // with credential revocation but revocation not required in verification => should verify
  outcomes.push(
    await completeProcessSingle({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: true,
    })
  )
  // with credential revocation but date in past => should verify
  outcomes.push(
    await completeProcessSingle({
      blockchain,
      expectedVerificationOutcome: true,
      doRevocation: true,
      reqUpdatedAfter: past,
    })
  )

  // check whether outcome is true fall our instances and disconnect from chain
  return teardown('onchain', outcomes)
}

completeProcessSingleExamples()
