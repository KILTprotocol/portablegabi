import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'

import {
  pubKey,
  privKey,
  pubKeyRevo2,
  privKeyRevo2,
  claim,
  disclosedAttributes,
} from './testConfig'
import GabiVerifier from '../verification/GabiVerifier'
import {
  InitiateAttestationRequest,
  Attestation,
  Witness,
  AttesterAttestationSession,
  Accumulator,
} from '../types/Attestation'
import { VerificationSession, PresentationRequest } from '../types/Verification'
import {
  AttestationRequest,
  Presentation,
  ClaimerAttestationSession,
  Credential,
} from '../types/Claim'

async function runTestSetup(): Promise<{
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  gabiAttester2: GabiAttester
  update: Accumulator
  update2: Accumulator
  startAttestationMsg: InitiateAttestationRequest
  attesterSignSession: AttesterAttestationSession
  attestationRequest: AttestationRequest
  aSignature: Attestation
  witness: Witness
  aSignature2: Attestation
  claimerSignSession: ClaimerAttestationSession
  startAttestationMsg2: InitiateAttestationRequest
  attesterSignSession2: AttesterAttestationSession
  attestationRequest2: AttestationRequest
  attestationRequestE12: AttestationRequest
  attestationRequestE21: AttestationRequest
  claimerSignSession2: ClaimerAttestationSession
  claimerSignSessionE12: ClaimerAttestationSession
  claimerSignSessionE21: ClaimerAttestationSession
  invalidAttestationResponses: {
    [key: number]: {
      attestation: Attestation
      witness: Witness
    }
  }
  invalidSignatures: Attestation[]
  validSignatureBuildCredential: {
    attestation: Attestation
    claimerSignSession: ClaimerAttestationSession
  }
  credential: Credential
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  proof: Presentation
  verifiedClaim: any
  verified: boolean
}> {
  const gabiAttester = new GabiAttester(pubKey, privKey)
  const gabiAttester2 = new GabiAttester(pubKeyRevo2, privKeyRevo2)
  const gabiClaimer = await GabiClaimer.buildFromScratch()
  const update = await gabiAttester.createAccumulator()
  const update2 = await gabiAttester2.createAccumulator()

  const {
    message: startAttestationMsg,
    session: attesterSignSession,
  } = await gabiAttester.startAttestation()
  // Claimer requests attestation
  const {
    message: attestationRequest,
    session: claimerSignSession,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })
  // Attester issues claim
  const {
    attestation: aSignature,
    witness,
  } = await gabiAttester.issueAttestation({
    attestationSession: attesterSignSession,
    attestationRequest,
    update,
  })

  // (1) Start attestation
  // Start1: Correct data (already defined in beforeEach)
  // Start2: Correct data
  const {
    message: startAttestationMsg2,
    session: attesterSignSession2,
  } = await gabiAttester2.startAttestation()

  // (2) Request attestation
  // Attester1: Correct (already defined in beforeEach)
  // Attester2: Correct
  const {
    message: attestationRequest2,
    session: claimerSignSession2,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E12: Incorrect data, should use startAttestationMsg2
  const {
    message: attestationRequestE12,
    session: claimerSignSessionE12,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E21: Incorrect data, should use gabiAttester2.getPubKey()
  const {
    message: attestationRequestE21,
    session: claimerSignSessionE21,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })

  // (3) Issue attestation
  const { attestation: aSignature2 } = await gabiAttester2.issueAttestation({
    attestationSession: attesterSignSession2,
    attestationRequest: attestationRequest2,
    update: update2,
  })
  const invalidAttestationResponses = {
    1112_2221: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: attestationRequestE12, // 12
      update,
    }),
    1122_2211: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: attestationRequest2, // 22
      update,
    }),
    1222_2111: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 2
      attestationRequest: attestationRequest2, // 22
      update,
    }),
    1211_2122: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest, // 11
      update,
    }),
    1121_2212: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: attestationRequestE21, // 21
      update,
    }),
    1221_2112: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest: attestationRequestE21, // 21
      update,
    }),
    // this is a correct signature when called from gabiAttester since the pk matches
    1212_2121: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 2
      attestationRequest: attestationRequestE12, // 12
      update,
    }),
  }
  const invalidSignatures = Object.values(invalidAttestationResponses).map(
    response => response.attestation
  )
  const validSignatureBuildCredential = {
    attestation: invalidAttestationResponses[1212_2121].attestation,
    claimerSignSession: claimerSignSessionE21,
  }

  const credential = await gabiClaimer.buildCredential({
    claimerSignSession,
    attestation: aSignature,
  })

  // verification
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestNonRevocationProof: true,
    requestedAttributes: disclosedAttributes,
    minIndex: 1,
  })

  const proof = await gabiClaimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: gabiAttester.getPubKey(),
  })

  const {
    claim: verifiedClaim,
    verified,
  } = await GabiVerifier.verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey: gabiAttester.getPubKey(),
  })

  return {
    gabiClaimer,
    gabiAttester,
    gabiAttester2,
    startAttestationMsg,
    attesterSignSession,
    attestationRequest,
    aSignature,
    witness,
    update,
    update2,
    aSignature2,
    claimerSignSession,
    startAttestationMsg2,
    attesterSignSession2,
    attestationRequest2,
    attestationRequestE12,
    attestationRequestE21,
    claimerSignSession2,
    claimerSignSessionE12,
    claimerSignSessionE21,
    invalidAttestationResponses,
    invalidSignatures,
    validSignatureBuildCredential,
    credential,
    verifierSession,
    presentationReq,
    proof,
    verifiedClaim,
    verified,
  }
}

export async function verifySetup(
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: Credential,
  requestedAttributes: string[],
  index: number
): Promise<{ verified: boolean; verifiedClaim: any }> {
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestNonRevocationProof: true,
    requestedAttributes,
    minIndex: index,
  })
  const proof = await claimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: attester.getPubKey(),
  })
  const {
    claim: verifiedClaim,
    verified,
  } = await GabiVerifier.verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey: attester.getPubKey(),
  })
  return { verified, verifiedClaim }
}

export default runTestSetup
