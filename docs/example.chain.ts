import connect from '../src/blockchain/BlockchainApiConnection'
import { attestationSetup, presentationSetup } from '../src/testSetup/testSetup'
import {
  actorSetupChain,
  presentationSetupChain,
} from '../src/testSetup/testSetup.chain'
import { disclosedAttributes } from '../src/testSetup/testConfig'

async function runChainExample(): Promise<void> {
  const chain = await connect()
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
  console.log('Post-revocation Count: ', accumulatorCount)

  // build credential #1
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  })
  console.log(1)
  //   const credentialUpdated = await claimer.updateCredentialChain({
  //     credential,
  //     attesterPubKey: attester.getPubKey(),
  //     attesterChainAddress: attester.getPublicIdentity().address,
  //     // _accumulator: accumulatorAfterRevo,
  //   })
  console.log(1.5)
  // verify credential #1
  const { verified, claim } = await presentationSetupChain({
    claimer,
    attester,
    credential,
    requestedAttributes: disclosedAttributes,
    reqIndex: 'latest',
    reqNonRevocationProof: true,
  })
  console.log('Credential #1 verified?', verified)
  console.log('Claim #1 non-empty?', claim)
  console.log(2)
  console.log('accumulatorCount', accumulatorCount)
  console.log(
    'revocation events',
    JSON.parse(accumulatorAfterRevo.valueOf()).e.length
  )
  // build credential2
  try {
    const credentialRev = await claimer.buildCredential({
      claimerSession: claimerSessionRev,
      attestation: attestationRev,
    })
    console.log(3)

    // verify credential #2.1.
    const {
      verified: verifiedRev,
      claim: claimRev,
    } = await presentationSetupChain({
      claimer,
      attester,
      credential: credentialRev,
      requestedAttributes: disclosedAttributes,
      reqIndex: 'latest',
      reqNonRevocationProof: true,
    })
    console.log(
      'Expect credential #2.1 not to be verified?',
      verifiedRev === false,
      verifiedRev
    )
    console.log('Expect claim #2.1 to be null?', claimRev === null)

    // verify credential #2.2
    const {
      verified: verifiedRev2,
      claim: claimRev2,
    } = await presentationSetup({
      claimer,
      attester,
      credential: credentialRev,
      requestedAttributes: disclosedAttributes,
      reqMinIndex:
        (await chain.getLatestRevocationIndex(
          attester.getPublicIdentity().address
        )) + 1,
      reqNonRevocationProof: true,
    })
    console.log(
      'Expect credential #2.2 not to be verified?',
      verifiedRev2 === false,
      verifiedRev2
    )
    console.log('Expect claim #2.2 to be null?', claimRev2 === null)
  } catch (e) {
    console.log('yo')
    console.error(e)
  }
}

runChainExample()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
