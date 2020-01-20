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
import GabiVerifier from '../../build/verification/GabiVerifier'
import {
  InitiateAttestationRequest,
  Attestation,
  Witness,
  AttesterAttestationSession,
} from '../types/Attestation'
import { VerificationSession } from '../types/Verification'
import { PresentationRequest } from '../../build/types/Verification'
import { AttestationRequest } from '../types/Claim'

const runTestSetup = async (): Promise<{
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  gabiAttester2: GabiAttester
  startAttestationMsg: InitiateAttestationRequest
  attesterSignSession: AttesterAttestationSession
  reqSignMsg: AttestationRequest
  aSignature: Attestation
  aSignature2: Attestation
  claimerSignSession: any // IClaimerSignSession
  startAttestationMsg2: InitiateAttestationRequest
  attesterSignSession2: AttesterAttestationSession
  reqSignMsg2: AttestationRequest
  reqSignMsgE12: AttestationRequest
  reqSignMsgE21: AttestationRequest
  claimerSignSession2: any // IClaimerSignSession
  claimerSignSessionE12: any // IClaimerSignSession
  claimerSignSessionE21: any // IClaimerSignSession
  invalidAttestationResponses: {
    [key: number]: {
      attestation: Attestation
      witness: Witness
    }
  }
  invalidSignatures: Attestation[]
  credential: string
  verifierSession: VerificationSession
  reqRevealedAttrMsg: PresentationRequest
  proof: string
  verifiedClaim: string
  verified: boolean
}> => {
  const gabiAttester = new GabiAttester(pubKey, privKey)
  const gabiAttester2 = new GabiAttester(pubKeyRevo2, privKeyRevo2)
  const gabiClaimer = await GabiClaimer.buildFromScratch()
  const update = await gabiAttester.createAccumulator()
  const update2 = await gabiAttester2.createAccumulator()
  // TODO: add update2
  // const update2 = await gabiAttester2.createAccumulator()

  const {
    message: startAttestationMsg,
    session: attesterSignSession,
  } = await gabiAttester.startAttestation()
  // Claimer requests attestation
  const {
    message: reqSignMsg,
    session: claimerSignSession,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })
  // Attester issues claim
  const { attestation: aSignature } = await gabiAttester.issueAttestation({
    attestationSession: attesterSignSession,
    attestationRequest: reqSignMsg,
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
    message: reqSignMsg2,
    session: claimerSignSession2,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E12: Incorrect data, should use startAttestationMsg2
  const {
    message: reqSignMsgE12,
    session: claimerSignSessionE12,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E21: Incorrect data, should use gabiAttester2.getPubKey()
  const {
    message: reqSignMsgE21,
    session: claimerSignSessionE21,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })

  // (3) Issue attestation
  const { attestation: aSignature2 } = await gabiAttester2.issueAttestation({
    attestationSession: attesterSignSession2,
    attestationRequest: reqSignMsg2,
    update: update2,
  })
  const invalidAttestationResponses = {
    1112_2221: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: reqSignMsgE12, // 12
      update,
    }),
    1122_2211: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: reqSignMsg2, // 22
      update,
    }),
    1222_2111: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 2
      attestationRequest: reqSignMsg2, // 22
      update,
    }),
    1211_2122: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest: reqSignMsg, // 11
      update,
    }),
    1121_2212: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession, // 1
      attestationRequest: reqSignMsgE21, // 21
      update,
    }),
    // this is a correct signature when called from gabiAttester since the pk matches
    1221_2112: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest: reqSignMsgE21, // 21
      update,
    }),
    1212_2121: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 2
      attestationRequest: reqSignMsgE12, // 12
      update,
    }),
  }
  const invalidSignatures = Object.values(invalidAttestationResponses).map(
    response => response.attestation
  )

  const credential = await gabiClaimer.buildCredential({
    claimerSignSession,
    attestation: aSignature,
  })

  // verification
  const {
    session: verifierSession,
    message: reqRevealedAttrMsg,
  } = await GabiVerifier.requestPresentation({
    requestNonRevocationProof: true,
    requestedAttributes: disclosedAttributes,
    minIndex: 1,
  })

  const proof = await gabiClaimer.revealAttributes({
    credential,
    presentationReq: reqRevealedAttrMsg,
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
    reqSignMsg,
    aSignature,
    aSignature2,
    claimerSignSession,
    startAttestationMsg2,
    attesterSignSession2,
    reqSignMsg2,
    reqSignMsgE12,
    reqSignMsgE21,
    claimerSignSession2,
    claimerSignSessionE12,
    claimerSignSessionE21,
    invalidAttestationResponses,
    invalidSignatures,
    credential,
    verifierSession,
    reqRevealedAttrMsg,
    proof,
    verifiedClaim,
    verified,
  }
}

export const verifySetup = async (
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: string,
  disclosedAttributesInput: string[],
  index: number
): Promise<{ verified: boolean; verifiedClaim: string }> => {
  const {
    session: verifierSession,
    message: reqRevealedAttrMsg,
  } = await GabiVerifier.requestPresentation({
    requestNonRevocationProof: true,
    requestedAttributes: disclosedAttributesInput,
    minIndex: index,
  })
  const proof = await claimer.revealAttributes({
    credential,
    presentationReq: reqRevealedAttrMsg,
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
String(Boolean)
export default runTestSetup
