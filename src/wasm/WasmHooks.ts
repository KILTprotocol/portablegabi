enum WasmHooks {
  // attester methods
  genKeypair = 'genKeypair',
  createAccumulator = 'createAccumulator',
  startAttestationSession = 'startAttestationSession',
  issueAttestation = 'issueAttestation',
  revokeAttestation = 'revokeAttestation',
  getAccumulatorIndex = 'getAccumulatorIndex',

  // Claimer methods
  genKey = 'genKey',
  keyFromMnemonic = 'keyFromMnemonic',
  requestAttestation = 'requestAttestation',
  buildCredential = 'buildCredential',
  updateCredential = 'updateCredential',
  buildPresentation = 'buildPresentation',
  buildCombinedPresentation = 'buildCombinedPresentation',

  // Verifier methods
  requestPresentation = 'requestPresentation',
  requestCombinedPresentation = 'requestCombinedPresentation',
  verifyPresentation = 'verifyPresentation',
  verifyCombinedPresentation = 'verifyCombinedPresentation',
}
export default WasmHooks
