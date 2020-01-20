import GabiClaimer from './claim/GabiClaimer'
import GabiAttester from './attestation/GabiAttester'
import GabiVerifier from './verification/GabiVerifier'
import CombinedRequestBuilder from './verification/CombinedRequestBuilder'

import goWasmClose from './wasm/wasm_exec_wrapper'

export * from './types/Verification'
export * from './types/Attestation'
export * from './types/Claim'

export default {
  goWasmClose,
  GabiClaimer,
  GabiAttester,
  GabiVerifier,
  CombinedRequestBuilder,
}
