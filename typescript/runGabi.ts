import testEnv from './TestEnv'
import GabiClaimer from './src/GabiClaimer'
import GabiAttester from './src/GabiAttester'
import GabiVerifier from './src/GabiVerifier'

// class IGabiIdentity extends Identity {}

const runGabi = async (): Promise<void> => {
  // load from test environment
  const { disclosedAttributes, claim, privKey, pubKey, mnemonic } = testEnv

  console.time('>> Complete Gabi process <<')

  // build claimer identity
  console.time('(1) Build claimer identity')
  const gabiClaimer = await GabiClaimer.buildFromMnemonic(mnemonic)
  console.timeEnd('(1) Build claimer identity')

  console.time('(2) Start attestation: attester sends 2 nonces to claimer')
  const gabiAttester = new GabiAttester(pubKey, privKey)
  const attesterPubKey = gabiAttester.getPubKey()
  const {
    message: startAttestationMsg,
    session: attesterSignSession,
  } = await gabiAttester.startAttestation()
  console.timeEnd('(2) Start attestation: attester sends 2 nonces to claimer')

  console.time('(3) Claimer requests attestation')
  const {
    message: reqSignMsg,
    session: claimerSignSession,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim,
    attesterPubKey,
  })
  console.timeEnd('(3) Claimer requests attestation')

  console.time('(4) Attester issues requested attestation')
  const aSignature = await gabiAttester.issueAttestation({
    attesterSignSession,
    reqSignMsg,
  })
  console.timeEnd('(4) Attester issues requested attestation')

  console.time('(5) Claimer builds credential')
  const credential = await gabiClaimer.buildCredential({
    claimerSignSession,
    signature: aSignature,
  })
  console.timeEnd('(5) Claimer builds credential')

  console.time('(6) Start verification: verifier sends 2 nonces to claimer')
  const {
    session: verifierSession,
    message: reqRevealedAttrMsg,
  } = await GabiVerifier.startVerificationSession({ disclosedAttributes })
  console.timeEnd('(6) Start verification: verifier sends 2 nonces to claimer')

  console.time('(7) Slaimer reveals attributes')
  const proof = await gabiClaimer.revealAttributes({
    credential,
    reqRevealedAttrMsg,
    attesterPubKey,
  })
  console.timeEnd('(7) Slaimer reveals attributes')

  console.time('(8) Verifier verifies attributes')
  const {
    claim: verifiedClaim,
    verified,
  } = await GabiVerifier.verifyAttributes({
    proof,
    verifierSession,
    attesterPubKey,
  })
  console.timeEnd('(8) Verifier verifies attributes')

  console.log('   Verified claim: ', verifiedClaim)
  console.log('   Claim verified?', verified)
  console.timeEnd('>> Complete Gabi process <<')
}

runGabi()
