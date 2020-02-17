/* eslint-disable no-console */
import connect, {
  disconnect,
} from '../src/blockchainApiConnection/BlockchainApiConnection'
import { attestationSetup, presentationSetup } from '../src/testSetup/testSetup'
import {
  actorSetupChain,
  presentationSetupChain,
} from '../src/testSetup/testSetup.chain'
import { disclosedAttributes } from '../src/testSetup/testConfig'
import { PgabiModName } from '../src/types/Chain'

async function runChainExample(): Promise<void> {
  const pgabiModName: PgabiModName = 'portablegabiPallet'
  const blockchain = await connect({
    pgabiModName,
  })
  // get actors
  const {
    attesters: [attester],
    claimers: [claimer],
    accumulators: [accumulator],
  } = await actorSetupChain({ pgabiModName })
  console.log(accumulator.valueOf())

  // do 2 attestations
  const { claimerSession, attestation } = await attestationSetup({
    claimer,
    attester,
    accumulator,
  })
  const {
    witness: witnessRev,
    claimerSession: claimerSessionRev,
    attestation: attestationRev,
  } = await attestationSetup({
    claimer,
    attester,
    accumulator,
  })
  // revoke attestation #2
  console.log('Chain is running...')
  console.group()
  console.log(
    'Pre-revocation Count:',
    await blockchain.getAccumulatorCount(attester.address)
  )
  //   await attester.updateAccumulator(accumulator)
  const accumulatorAfterRevo = await attester.revokeAttestation({
    witnesses: [witnessRev],
    accumulator,
  })
  console.log('Revoked credential #2')
  console.log('Waiting for next block...')
  await blockchain.waitForNextBlock()

  const accumulatorCount = await blockchain.getAccumulatorCount(
    attester.address
  )

  console.log('Post-revocation Count: ', accumulatorCount)
  console.groupEnd()

  // build credential #1
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  const credentialUpdated = await claimer.updateCredentialChain({
    credential,
    attesterPubKey: attester.publicKey,
    attesterChainAddress: attester.address,
  })
  // verify credential #1
  const { verified, claim } = await presentationSetupChain({
    claimer,
    attester,
    credential: credentialUpdated,
    requestedAttributes: disclosedAttributes,
    reqUpdatedAfter: new Date(),
    reqNonRevocationProof: true,
    accumulator: accumulatorAfterRevo,
  })
  // build credential2
  let credRev = await claimer.buildCredential({
    claimerSession: claimerSessionRev,
    attestation: attestationRev,
  })
  try {
    credRev = await claimer.updateCredentialChain({
      credential: credRev,
      attesterPubKey: attester.publicKey,
      attesterChainAddress: attester.address,
    })
  } catch (e) {
    console.log(
      'Caught expected error when updating revoked credential\n',
      e.message
    )
  }
  // verify credential #2.1.
  const {
    verified: verifiedRev,
    claim: claimRev,
  } = await presentationSetupChain({
    claimer,
    attester,
    credential: credRev,
    requestedAttributes: disclosedAttributes,
    reqUpdatedAfter: new Date(),
    reqNonRevocationProof: true,
    accumulator: accumulatorAfterRevo,
  })

  // verify credential #2.2
  const { verified: verifiedRev2, claim: claimRev2 } = await presentationSetup({
    claimer,
    attester,
    credential: credRev,
    requestedAttributes: disclosedAttributes,
    reqUpdatedAfter: new Date(),
    reqNonRevocationProof: true,
    accumulator: accumulatorAfterRevo,
  })
  console.table({
    isVerified: [verified, verifiedRev, verifiedRev2],
    isEmpty: [claim === null, claimRev === null, claimRev2 === null],
    expected: ['verified', 'revoked', 'revoked'],
  })
  await disconnect()
}

runChainExample()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
