enum WasmHooks {
  // Attesters methods
  genKeypair = 'genKeypair',
  revokeAttestation = 'revokeAttestation',
  createAccumulator = 'createAccumulator',
  startAttestationSession = 'startAttestationSession',
  issueAttestation = 'issueAttestation',

  // Claimer methods
  keyFromMnemonic = 'keyFromMnemonic',
  genKey = 'genKey',
  requestAttestation = 'requestAttestation',
  buildCredential = 'buildCredential',
  revealAttributes = 'revealAttributes',
  updateCredential = 'updateCredential',

  // Verifier methods
  startVerificationSession = 'startVerificationSession',
  verifyAttributes = 'verifyAttributes',
}
export default WasmHooks
