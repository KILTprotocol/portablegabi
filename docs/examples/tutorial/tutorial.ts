import tutorialAttestation from './sections/1_attestation'
import tutorialVerification from './sections/2_verification'
import tutorialRevocation from './sections/3_revocation'

async function main() {
  const results = []
  console.group('#### [1/4] Attestation tutorial ####')
  const {
    pubKey,
    attester,
    claimer,
    credential,
    accumulator,
    witness,
  } = await tutorialAttestation()
  results.push(
    pubKey && attester && claimer && credential && accumulator && witness
  )
  console.groupEnd()
  console.group('\n#### [2/4] Verification tutorial ####')
  results.push(
    await tutorialVerification({
      pubKey,
      attester,
      claimer,
      credential,
      accumulator,
    })
  )
  console.groupEnd()
  console.group('\n#### [3/4] Revocation tutorial ####')
  results.push(
    await tutorialRevocation({
      pubKey,
      attester,
      claimer,
      credential,
      accumulator,
      witness,
    })
  )
  console.groupEnd()
  if (results.length !== 3 || !results.every(Boolean)) {
    throw new Error(`Did not receive expected results: ${results.toString()}`)
  }
  console.log('Done with off-chain')
}

main()
