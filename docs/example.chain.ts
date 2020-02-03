import getCached from '../src/blockchain/BlockchainApiConnection'
import { attestationSetup, presentationSetup } from '../src/testSetup/testSetup'
import {
  actorSetupChain,
  presentationSetupChain,
} from '../src/testSetup/testSetup.chain'
import { disclosedAttributes } from '../src/testSetup/testConfig'
import { Accumulator } from '../src/types/Attestation'

async function runChainExample(): Promise<void> {
  const chain = await getCached()
  // get actors
  const {
    attesters: [attester],
    claimers: [claimer],
    accumulators: [accumulator],
  } = await actorSetupChain()
  const blockchain = await getCached()

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
  const accumulatorAfterRevo = new Accumulator(
    await attester.revokeAttestation({
      witness: witnessRev,
      accumulator,
    })
  )
  console.log('Waiting for next block...')
  await blockchain.waitForNextBlock()
  const accumulatorCount = await blockchain.getAccumulatorCount(
    attester.getPublicIdentity().address
  )
  console.log('Post-revocation Count: ', accumulatorCount)
  // build credential #1
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  const credentialUpdated = await claimer.updateCredentialChain({
    credential,
    attesterPubKey: attester.getPubKey(),
    _accumulator: accumulatorAfterRevo,
  })
  // expect failure to build credential #2
  //   try {
  const credentialRev = await claimer.buildCredential({
    claimerSession: claimerSessionRev,
    attestation: attestationRev,
  })
  //   const credentialUpdatedRev = await claimer.updateCredentialChain({
  //     credential: credentialRev,
  //     attesterPubKey: attester.getPubKey(),
  //     _accumulator: accumulator,
  //   })
  const credentialUpdatedRev = await claimer.updateCredential({
    credential: credentialRev,
    attesterPubKey: attester.getPubKey(),
    accumulator,
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
  console.log('Credential #2 verified?', verified)
  console.log('Claim #2 non-empty?', claim)

  // verify credential #2.1.
  const {
    verified: verifiedRev,
    claim: claimRev,
  } = await presentationSetupChain({
    claimer,
    attester,
    credential: credentialUpdatedRev,
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
    credential: credentialUpdatedRev,
    requestedAttributes: disclosedAttributes,
    reqMinIndex: await chain.getLatestRevocationIndex(
      attester.getPublicIdentity().address
    ),
    reqNonRevocationProof: true,
  })
  console.log(
    'Expect credential #2.2 not to be verified?',
    verifiedRev2 === false
  )
  console.log('Expect claim #2.2 to be null?', claimRev2 === null)
}

runChainExample()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
