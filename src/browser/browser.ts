import Claimer from '../claim/Claimer'
import Attester from '../attestation/Attester'
import Accumulator from '../attestation/Accumulator'
import Credential from '../claim/Credential'
import AttesterChain from '../attestation/Attester.chain'
import Verifier from '../verification/Verifier'
import CombinedRequestBuilder from '../verification/CombinedRequestBuilder'
import Blockchain from '../blockchain/Blockchain'
import BlockchainError from '../blockchain/BlockchainError'
import connect, {
  clearCache,
  disconnect,
  getCached,
  buildConnection,
} from '../blockchainApiConnection/BlockchainApiConnection'
import {
  AttesterPublicKey,
  AttesterPrivateKey,
  AttesterAttestationSession,
  InitiateAttestationRequest,
  Witness,
  Attestation,
} from '../types/Attestation'
import {
  ClaimError,
  AttestationRequest,
  ClaimerAttestationSession,
  Presentation,
  CombinedPresentation,
} from '../types/Claim'
import {
  VerificationSession,
  PresentationRequest,
  CombinedVerificationSession,
  CombinedPresentationRequest,
} from '../types/Verification'
import goWasmClose from '../wasm/wasm_exec_wrapper'

global['portablegabi'] = {
  Claimer,
  ClaimError,
  AttestationRequest,
  ClaimerAttestationSession,
  Presentation,
  CombinedPresentation,
  Attester,
  AttesterPublicKey,
  AttesterPrivateKey,
  AttesterAttestationSession,
  InitiateAttestationRequest,
  Witness,
  Attestation,
  Accumulator,
  Credential,
  AttesterChain,
  Verifier,
  VerificationSession,
  PresentationRequest,
  CombinedVerificationSession,
  CombinedPresentationRequest,
  CombinedRequestBuilder,
  Blockchain,
  BlockchainError,
  connect,
  clearCache,
  disconnect,
  getCached,
  buildConnection,
  goWasmClose,
}
