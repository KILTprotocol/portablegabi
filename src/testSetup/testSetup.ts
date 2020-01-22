import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'

import {
  pubKey,
  privKey,
  pubKey2,
  privKey2,
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

// creates instances for claimer and attester with accumulator
export async function initClaimerAttesterSetup(): Promise<{
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  update: Accumulator
}> {
  const gabiAttester = new GabiAttester(pubKey, privKey)
  const gabiClaimer = await GabiClaimer.buildFromScratch()
  const update = await gabiAttester.createAccumulator()
  return { gabiClaimer, gabiAttester, update }
}

// attests claim and builds credential
export async function attestationSetup({
  claimer,
  attester,
  update,
}: {
  claimer: GabiClaimer
  attester: GabiAttester
  update: Accumulator
}): Promise<{
  initiateAttestationReq: InitiateAttestationRequest
  attesterSession: AttesterAttestationSession
  claimerSession: ClaimerAttestationSession
  attestationRequest: AttestationRequest
  attestation: Attestation
  witness: Witness
  credential: Credential
}> {
  const {
    message: initiateAttestationReq,
    session: attesterSession,
  } = await attester.startAttestation()
  // Claimer requests attestation
  const {
    message: attestationRequest,
    session: claimerSession,
  } = await claimer.requestAttestation({
    startAttestationMsg: initiateAttestationReq,
    claim: JSON.stringify(claim),
    attesterPubKey: attester.getPubKey(),
  })
  // Attester issues attestation
  const { attestation, witness } = await attester.issueAttestation({
    attestationSession: attesterSession,
    attestationRequest,
    update,
  })
  // Claimer builds credential
  const credential = await claimer.buildCredential({
    attestation,
    claimerSession,
  })
  return {
    initiateAttestationReq,
    attesterSession,
    claimerSession,
    attestationRequest,
    attestation,
    witness,
    credential,
  }
}

// runs a verification process on a credential
export async function presentationSetup({
  claimer,
  attester,
  credential,
  requestedAttributes = disclosedAttributes,
  minIndex = 1,
}: {
  claimer: GabiClaimer
  attester: GabiAttester
  credential: Credential
  requestedAttributes?: string[]
  minIndex?: number
}): Promise<{
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  presentation: Presentation
  verified: boolean
  claim: any
}> {
  // request
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestedAttributes,
    requestNonRevocationProof: true,
    minIndex,
  })
  // response
  const presentation = await claimer.buildPresentation({
    credential,
    attesterPubKey: attester.getPubKey(),
    presentationReq,
  })
  // verify
  const { verified, claim: aClaim } = await GabiVerifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.getPubKey(),
  })
  return {
    verifierSession,
    presentationReq,
    presentation,
    verified,
    claim: aClaim,
  }
}

// creates mixed attestions that will fail buildCredential in almost all cases
export async function mixedAttestationsSetup({
  gabiClaimer,
  gabiAttester,
  update,
  initiateAttestationReq,
  attesterSession,
  attestationRequest,
}: {
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  update: Accumulator
  initiateAttestationReq: InitiateAttestationRequest
  attesterSession: AttesterAttestationSession
  attestationRequest: AttestationRequest
}): Promise<{
  gabiAttester2: GabiAttester
  update2: Accumulator
  witness2: Witness
  attestation2: Attestation
  startAttestationMsg2: InitiateAttestationRequest
  attesterSignSession2: AttesterAttestationSession
  attestationRequest2: AttestationRequest
  attestationRequestE12: AttestationRequest
  attestationRequestE21: AttestationRequest
  claimerSession2: ClaimerAttestationSession
  claimerSessionE12: ClaimerAttestationSession
  claimerSessionE21: ClaimerAttestationSession
  mixedIssuedAttestations: {
    [key: number]: {
      attestation: Attestation
      witness: Witness
    }
  }
  mixedSignatures: Attestation[]
  validSignatureBuildCredential: {
    attestation: Attestation
    claimerSession: ClaimerAttestationSession
  }
}> {
  const gabiAttester2 = new GabiAttester(pubKey2, privKey2)
  const update2 = await gabiAttester2.createAccumulator()

  // (1) Start attestation
  const {
    message: startAttestationMsg2,
    session: attesterSignSession2,
  } = await gabiAttester2.startAttestation()

  // (2) Request attestation
  const {
    message: attestationRequest2,
    session: claimerSession2,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E12: Mixed data, should use startAttestationMsg2
  const {
    message: attestationRequestE12,
    session: claimerSessionE12,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: initiateAttestationReq,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E21: Mixed data, should use gabiAttester2.getPubKey()
  const {
    message: attestationRequestE21,
    session: claimerSessionE21,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })

  // (3) Issue attestation
  const {
    attestation: attestation2,
    witness: witness2,
  } = await gabiAttester2.issueAttestation({
    attestationSession: attesterSignSession2,
    attestationRequest: attestationRequest2,
    update: update2,
  })
  const mixedIssuedAttestations = {
    1112_2221: await gabiAttester.issueAttestation({
      attestationSession: attesterSession, // 1
      attestationRequest: attestationRequestE12, // 12
      update,
    }),
    1122_2211: await gabiAttester.issueAttestation({
      attestationSession: attesterSession, // 1
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
      attestationSession: attesterSession, // 1
      attestationRequest: attestationRequestE21, // 21
      update,
    }),
    1212_2121: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 2
      attestationRequest: attestationRequestE12, // 12
      update,
    }),
    // this is a correct signature when called from gabiAttester since the pk matches
    1221_2112: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest: attestationRequestE21, // 21
      update,
    }),
  }
  const mixedSignatures = Object.values(mixedIssuedAttestations).map(
    response => response.attestation
  )
  const validSignatureBuildCredential = {
    attestation: mixedIssuedAttestations[1221_2112].attestation,
    claimerSession: claimerSessionE21,
  }

  return {
    gabiAttester2,
    witness2,
    update2,
    attestation2,
    startAttestationMsg2,
    attesterSignSession2,
    attestationRequest2,
    attestationRequestE12,
    attestationRequestE21,
    claimerSession2,
    claimerSessionE12,
    claimerSessionE21,
    mixedIssuedAttestations,
    mixedSignatures,
    validSignatureBuildCredential,
  }
}
