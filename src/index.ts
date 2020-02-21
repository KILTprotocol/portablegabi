import GabiClaimer from './claim/GabiClaimer'
import GabiAttester from './attestation/GabiAttester'
import Accumulator from './attestation/Accumulator'
import Credential from './claim/Credential'
import GabiAttesterChain from './attestation/GabiAttester.chain'
import GabiVerifier from './verification/GabiVerifier'
import CombinedRequestBuilder from './verification/CombinedRequestBuilder'
import Blockchain from './blockchain/Blockchain'
import BlockchainError from './blockchain/BlockchainError'
import connect from './blockchainApiConnection/BlockchainApiConnection'

import goWasmClose from './wasm/wasm_exec_wrapper'

export * from './types/Verification'
export * from './types/Attestation'
export * from './types/Claim'
export * from './types/Wasm'
export * from './types/Chain'
export * from './blockchainApiConnection/BlockchainApiConnection'

export {
  goWasmClose,
  GabiClaimer,
  GabiAttester,
  GabiVerifier,
  GabiAttesterChain,
  Accumulator,
  Blockchain,
  BlockchainError,
  CombinedRequestBuilder,
  connect,
}

export default {
  goWasmClose,
  GabiClaimer,
  GabiAttester,
  GabiVerifier,
  GabiAttesterChain,
  Accumulator,
  Credential,
  Blockchain,
  BlockchainError,
  CombinedRequestBuilder,
  connect,
}
