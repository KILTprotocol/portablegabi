/* eslint-disable no-console */
import Blockchain from '../../src/blockchain/Blockchain'
import connect, {
  disconnect,
} from '../../src/blockchainApiConnection/BlockchainApiConnection'
import { testEnv1, mnemonic } from './exampleConfig'
import actorProcessChain from './onchain/1_actorProcess'
import verificationProcessSingleChain from './onchain/3_verificationProcessSingle'
import issuanceProcess from './offchain/2_issuanceProcess'

const { pubKey, privKey, disclosedAttributes, claim } = testEnv1

// all processes from attestation, to possibly revocation and final verification
async function completeProcessSingle({
  blockchain,
  expectedVerificationOutcome,
  doRevocation = false,
  reqIndex = 'latest',
  reqNonRevocationProof = true,
}: {
  blockchain: Blockchain
  expectedVerificationOutcome: boolean
  doRevocation: boolean
  reqIndex: number | 'latest'
  reqNonRevocationProof: boolean
}): Promise<boolean> {
  console.group()
  // create claimer and attester entitites
  const { claimer, attester, accumulator } = await actorProcessChain({
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
      'Accumulatorcount before revocation:',
      await blockchain.getAccumulatorCount(attester.address)
    )
    await attester.revokeAttestation({ accumulator, witnesses: [witness] })
    await blockchain.waitForNextBlock()
    console.log(
      'Accumulatorcount after revocation:',
      await blockchain.getAccumulatorCount(attester.address)
    )
  }
  // check whether newest accumulator is different to old one if revocation
  const revAccCheck = doRevocation
    ? (await (
        await blockchain.getLatestAccumulator(attester.address)
      ).valueOf()) !== accumulator.valueOf()
    : true

  // verify credential with revocation check
  const { verified } = await verificationProcessSingleChain({
    claimer,
    attester,
    credential,
    requestedAttributes: disclosedAttributes,
    reqIndex, // require accumulator's revocation index of 0 or greater
    reqNonRevocationProof, // check revocation status
  })

  console.groupEnd()
  console.log(
    `Expected outcome achieved? ${expectedVerificationOutcome === verified &&
      revAccCheck}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessSingle should return true
async function completeProcessSingleExamples(): Promise<void> {
  // connect to chain
  const blockchain = await connect({ pgabiModName: 'portablegabiPallet' })
  console.log('Connected to chain')

  // without credential revocation
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: true,
    doRevocation: false,
    reqIndex: 'latest',
    reqNonRevocationProof: true,
  })

  // with credential revocation
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: false,
    doRevocation: true,
    reqIndex: 'latest',
    reqNonRevocationProof: true,
  })

  // with credential revocation but revocation not required in verification
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: true,
    doRevocation: true,
    reqIndex: 'latest',
    reqNonRevocationProof: false,
  })

  // disconnect from chain
  await disconnect()
}

completeProcessSingleExamples()
