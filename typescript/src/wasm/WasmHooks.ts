enum WasmHooks {
  genKeypair = 'genKeypair',
  keyFromMnemonic = 'keyFromMnemonic',
  genKey = 'genKey',
  startAttestationSession = 'startAttestationSession',
  requestAttestation = 'requestAttestation',
  issueAttestation = 'issueAttestation',
  buildCredential = 'buildCredential',
  startVerificationSession = 'startVerificationSession',
  revealAttributes = 'revealAttributes',
  verifyAttributes = 'verifyAttributes',
  revokeAttestation = 'revokeAttestation',
}
export default WasmHooks
