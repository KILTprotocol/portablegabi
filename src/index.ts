import Claimer from './claim/Claimer'
import Attester from './attestation/Attester'
import Accumulator from './attestation/Accumulator'
import Credential from './claim/Credential'
import AttesterChain from './attestation/Attester.chain'
import Verifier from './verification/Verifier'
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
  Claimer,
  Attester,
  Verifier,
  AttesterChain,
  Accumulator,
  Blockchain,
  BlockchainError,
  CombinedRequestBuilder,
  connect,
  Credential,
}

export default {
  goWasmClose,
  Claimer,
  Attester,
  Verifier,
  AttesterChain,
  Accumulator,
  Credential,
  Blockchain,
  BlockchainError,
  CombinedRequestBuilder,
  connect,
}
