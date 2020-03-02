/* eslint-disable prefer-const */
/* eslint-disable no-console */
import Blockchain from '../../src/blockchain/Blockchain'
import connect, {
  disconnect,
} from '../../src/blockchainApiConnection/BlockchainApiConnection'
import { testEnv1 } from './exampleConfig'
import verificationProcessSingleChain from './onchain/3_verificationProcessSingle'
import issuanceProcess from './offchain/2_issuanceProcess'
import { actorSetupChain } from '../../src/testSetup/testSetup.chain'
import { chainCfg } from '../../src/testSetup/testConfig'
import { PgabiModName } from '../../src/types/Chain'

const { disclosedAttributes, claim } = testEnv1
const pgabiModName: PgabiModName = 'portablegabi'

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
  let {
    attesters: [attester],
    claimers: [claimer],
    accumulators: [accumulator],
  } = await actorSetupChain({
    pgabiModName,
    mnemonics: [chainCfg.mnemonic, chainCfg.mnemonic],
    keypairTypes: ['ed25519', 'ed25519'],
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
    await blockchain.waitForNextBlock()
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
    reqUpdatedAfter, // require accumulator's revocation index of 0 or greater
    accumulator,
  })

  console.groupEnd()
  console.log(
    // eslint-disable-next-line eqeqeq
    `Expected outcome achieved? ${expectedVerificationOutcome == verified}`
  )
  return expectedVerificationOutcome === verified
}

// all calls of completeProcessSingle should return true
async function completeProcessSingleExamples(): Promise<void> {
  // connect to chain
  const blockchain = await connect({
    pgabiModName,
    types: {
      DelegationNodeId: 'Hash',
      PublicSigningKey: 'Hash',
      PublicBoxKey: 'Hash',
      Permissions: 'u32',
      ErrorCode: 'u16',
    },
  })
  console.log('Connected to chain')
  const past = new Date()
  const future = new Date()
  future.setDate(past.getDate() + 100)

  // without credential revocation
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: true,
    doRevocation: false,
    reqUpdatedAfter: past,
  })

  // with credential revocation
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: false,
    doRevocation: true,
    reqUpdatedAfter: future,
  })

  // with credential revocation but revocation not required in verification
  await completeProcessSingle({
    blockchain,
    expectedVerificationOutcome: true,
    doRevocation: true,
  })

  // disconnect from chain
  await disconnect().finally(() => process.exit())
}

completeProcessSingleExamples()
