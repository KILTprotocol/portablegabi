import GabiClaimer from './claim/GabiClaimer'
import GabiClaimerChain from './claim/GabiClaimer.chain'
import GabiAttester from './attestation/GabiAttester'
import Accumulator from './attestation/Accumulator'
import GabiAttesterChain from './attestation/GabiAttester.chain'
import GabiVerifier from './verification/GabiVerifier'
import GabiVerifierChain from './verification/GabiVerifier.chain'
import CombinedRequestBuilder from './verification/CombinedRequestBuilder'
import Blockchain from './blockchain/Blockchain'
import BlockchainError from './blockchain/ChainError'
import connect from './blockchainApiConnection/BlockchainApiConnection'

import goWasmClose from './wasm/wasm_exec_wrapper'

export * from './types/Verification'
export * from './types/Attestation'
export * from './types/Claim'
export * from './types/Wasm'
export * from './types/Chain'
export * from './blockchainApiConnection/BlockchainApiConnection'

export default {
  goWasmClose,
  GabiClaimer,
  GabiAttester,
  GabiVerifier,
  GabiClaimerChain,
  GabiAttesterChain,
  GabiVerifierChain,
  Accumulator,
  Blockchain,
  BlockchainError,
  CombinedRequestBuilder,
  connect,
}
