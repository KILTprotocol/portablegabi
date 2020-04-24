enum WasmHooks {
  // claimer methods
  genKey = 'genKey',
  keyFromSeed = 'keyFromSeed',
  requestAttestation = 'requestAttestation',
  buildCredential = 'buildCredential',
  buildPresentation = 'buildPresentation',
  buildCombinedPresentation = 'buildCombinedPresentation',

  // attester methods
  genKeypair = 'genKeypair',
  createAccumulator = 'createAccumulator',
  startAttestationSession = 'startAttestationSession',
  issueAttestation = 'issueAttestation',
  revokeAttestation = 'revokeAttestation',

  // accumulator methods
  getAccumulatorIndex = 'getAccumulatorIndex',
  getAccumulatorTimestamp = 'getAccumulatorTimestamp',

  // credential methods
  updateCredential = 'updateCredential',
  updateAllCredential = 'updateAllCredential',

  // verifier methods
  requestPresentation = 'requestPresentation',
  requestCombinedPresentation = 'requestCombinedPresentation',
  verifyPresentation = 'verifyPresentation',
  verifyCombinedPresentation = 'verifyCombinedPresentation',
}
export default WasmHooks
