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

async function runChainExample(): Promise<void> {
  // get actors
  const {
    attesters: [attester],
    claimers: [claimer],
    accumulators: [accumulator],
  } = await actorSetupChain()
  const blockchain = await connect()

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
  console.log(
    'Pre-revocation Count:',
    await blockchain.getAccumulatorCount(attester.getPublicIdentity().address)
  )
  //   await attester.updateAccumulator(accumulator)
  const accumulatorAfterRevo = await attester.revokeAttestation({
    witnesses: [witnessRev],
    accumulator,
  })
  console.log('Waiting for next block...')
  await blockchain.waitForNextBlock()

  const accumulatorCount = await blockchain.getAccumulatorCount(
    attester.getPublicIdentity().address
  )
  const index = await accumulatorAfterRevo.getRevIndex(attester.getPubKey())
  console.log('Post-revocation Count: ', accumulatorCount)

  // build credential #1
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  const credentialUpdated = await claimer.updateCredentialChain({
    credential,
    attesterPubKey: attester.getPubKey(),
    attesterChainAddress: attester.getPublicIdentity().address,
  })
  // verify credential #1
  const { verified, claim } = await presentationSetupChain({
    claimer,
    attester,
    credential: credentialUpdated,
    requestedAttributes: disclosedAttributes,
    reqIndex: 'latest',
    reqNonRevocationProof: true,
  })
  console.log('Credential #1 verified?', verified)
  console.log('Claim #1 non-empty?', claim)

  // build credential2
  let credRev = await claimer.buildCredential({
    claimerSession: claimerSessionRev,
    attestation: attestationRev,
  })
  try {
    credRev = await claimer.updateCredentialChain({
      credential: credRev,
      attesterPubKey: attester.getPubKey(),
      attesterChainAddress: attester.getPublicIdentity().address,
    })
  } catch (e) {
    console.log(
      'Caught expected error when updating revoked credential:',
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
    reqIndex: 'latest',
    reqNonRevocationProof: true,
  })
  console.log(
    'Expect credential #2.1 not to be verified?',
    verifiedRev === false
  )
  console.log('Expect claim #2.1 to be null?', claimRev === null)

  // verify credential #2.2
  const { verified: verifiedRev2, claim: claimRev2 } = await presentationSetup({
    claimer,
    attester,
    credential: credRev,
    requestedAttributes: disclosedAttributes,
    reqMinIndex: index,
    reqNonRevocationProof: true,
  })
  console.log(
    'Expect credential #2.2 not to be verified?',
    verifiedRev2 === false
  )
  console.log('Expect claim #2.2 to be null?', claimRev2 === null)
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
