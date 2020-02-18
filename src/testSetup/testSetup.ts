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
} from '../types/Attestation'
import {
  VerificationSession,
  PresentationRequest,
  CombinedPresentationRequest,
  CombinedVerificationSession,
  IPresentationRequest,
} from '../types/Verification'
import {
  AttestationRequest,
  Presentation,
  ClaimerAttestationSession,
  Credential,
  CombinedPresentation,
} from '../types/Claim'
import Accumulator from '../attestation/Accumulator'

// creates instances for two claimers, attesters and corresponding accumulators each
export async function actorSetup(): Promise<{
  claimers: GabiClaimer[]
  attesters: GabiAttester[]
  accumulators: Accumulator[]
}> {
  const gabiAttester1 = new GabiAttester(pubKey, privKey)
  const gabiAttester2 = new GabiAttester(pubKey2, privKey2)
  const gabiClaimer1 = await GabiClaimer.create()
  const gabiClaimer2 = await GabiClaimer.create()
  const accumulator1 = await gabiAttester1.createAccumulator()
  const accumulator2 = await gabiAttester2.createAccumulator()

  return {
    claimers: [gabiClaimer1, gabiClaimer2],
    attesters: [gabiAttester1, gabiAttester2],
    accumulators: [accumulator1, accumulator2],
  }
}

// attests claim and builds credential
export async function attestationSetup({
  claimer,
  attester,
  accumulator,
}: {
  claimer: GabiClaimer
  attester: GabiAttester
  accumulator: Accumulator
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
    claim,
    attesterPubKey: attester.publicKey,
  })
  // Attester issues attestation
  const { attestation, witness } = await attester.issueAttestation({
    attestationSession: attesterSession,
    attestationRequest,
    accumulator,
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
  accumulator,
  reqUpdatedAfter = new Date(),
}: {
  claimer: GabiClaimer
  attester: GabiAttester
  credential: Credential
  accumulator: Accumulator
  requestedAttributes?: string[]
  reqUpdatedAfter?: Date
  reqNonRevocationProof?: boolean
}): Promise<{
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  presentation: Presentation
  verified: boolean
  claim: object
}> {
  // request
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestedAttributes,
    reqUpdatedAfter,
  })
  // response
  const presentation = await claimer.buildPresentation({
    credential,
    attesterPubKey: attester.publicKey,
    presentationReq,
  })
  // verify
  const { verified, claim: aClaim } = await GabiVerifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
    latestAccumulator: accumulator,
  })
  return {
    verifierSession,
    presentationReq,
    presentation,
    verified,
    claim: aClaim,
  }
}

// creates mixed attestations that will fail buildCredential in almost all cases
export async function mixedAttestationsSetup({
  gabiClaimer,
  gabiAttester,
  accumulator,
  initiateAttestationReq,
  attesterSession,
  attestationRequest,
}: {
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  accumulator: Accumulator
  initiateAttestationReq: InitiateAttestationRequest
  attesterSession: AttesterAttestationSession
  attestationRequest: AttestationRequest
}): Promise<{
  gabiAttester2: GabiAttester
  accumulator2: Accumulator
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
  mixedAttestationsInvalid: {
    [key: number]: {
      attestationSession: AttesterAttestationSession
      attestationRequest: AttestationRequest
      accumulator: Accumulator
    }
  }
  mixedAttestationsValid: {
    issuance: {
      attestation: Attestation
      witness: Witness
    }
    claimerSession: ClaimerAttestationSession
  }
}> {
  const gabiAttester2 = new GabiAttester(pubKey2, privKey2)
  const accumulator2 = await gabiAttester2.createAccumulator()

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
    claim,
    attesterPubKey: gabiAttester2.publicKey,
  })
  // E12: Mixed data, should use startAttestationMsg2
  const {
    message: attestationRequestE12,
    session: claimerSessionE12,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: initiateAttestationReq,
    claim,
    attesterPubKey: gabiAttester2.publicKey,
  })
  // E21: Mixed data, should use gabiAttester2.publicKey
  const {
    message: attestationRequestE21,
    session: claimerSessionE21,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim,
    attesterPubKey: gabiAttester.publicKey,
  })

  // (3) Issue attestation
  const {
    attestation: attestation2,
    witness: witness2,
  } = await gabiAttester2.issueAttestation({
    attestationSession: attesterSignSession2,
    attestationRequest: attestationRequest2,
    accumulator: accumulator2,
  })

  const mixedAttestationsInvalid = {
    1112_2221: {
      attestationSession: attesterSession, // 1
      attestationRequest: attestationRequestE12, // 12
      accumulator,
    },
    1122_2211: {
      attestationSession: attesterSession, // 1
      attestationRequest: attestationRequest2, // 22
      accumulator,
    },
    1222_2111: {
      attestationSession: attesterSignSession2, // 2
      attestationRequest: attestationRequest2, // 22
      accumulator,
    },
    1211_2122: {
      attestationSession: attesterSignSession2, // 1
      attestationRequest, // 11
      accumulator,
    },
    1121_2212: {
      attestationSession: attesterSession, // 1
      attestationRequest: attestationRequestE21, // 21
      accumulator,
    },
    1212_2121: {
      attestationSession: attesterSignSession2, // 2
      attestationRequest: attestationRequestE12, // 12
      accumulator,
    },
  }

  const mixedAttestationsValid = {
    issuance: await gabiAttester.issueAttestation({
      attestationSession: attesterSignSession2, // 1
      attestationRequest: attestationRequestE21, // 21
      accumulator,
    }),
    claimerSession: claimerSessionE21,
  }

  return {
    gabiAttester2,
    witness2,
    accumulator2,
    attestation2,
    startAttestationMsg2,
    attesterSignSession2,
    attestationRequest2,
    attestationRequestE12,
    attestationRequestE21,
    claimerSession2,
    claimerSessionE12,
    claimerSessionE21,
    mixedAttestationsInvalid,
    mixedAttestationsValid,
  }
}

export async function combinedSetup({
  claimer,
  attesters,
  accumulators,
  disclosedAttsArr,
  reqUpdatesAfter,
  inputCredentials,
}: {
  claimer: GabiClaimer
  attesters: GabiAttester[]
  accumulators: Accumulator[]
  disclosedAttsArr: string[][]
  reqUpdatesAfter: Array<Date | undefined>
  inputCredentials?: Credential[]
}): Promise<{
  combinedPresentation: CombinedPresentation
  combinedPresentationReq: CombinedPresentationRequest
  combinedSession: CombinedVerificationSession
  verified: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  claims: any[]
}> {
  if (
    attesters.length !== accumulators.length ||
    accumulators.length !== disclosedAttsArr.length ||
    disclosedAttsArr.length !== reqUpdatesAfter.length
  ) {
    throw new Error("Array lengths don't match up in combined setup")
  }
  const attesterPubKeys = attesters.map(attester => attester.publicKey)
  // build credentials if inputCredentials is missing
  let credentials: Credential[]
  if (
    inputCredentials &&
    inputCredentials.filter(cred => cred instanceof Credential).length ===
      attesters.length
  ) {
    credentials = inputCredentials
  } else {
    credentials = await Promise.all(
      attesters.map((attester, idx) =>
        attestationSetup({
          attester,
          claimer,
          accumulator: accumulators[idx],
        })
      )
    ).then(attestations =>
      attestations.map(attestation => attestation.credential)
    )
  }
  // build combined requests
  const requests: IPresentationRequest[] = disclosedAttsArr.map(
    (requestedAttributes, idx) => ({
      requestedAttributes,
      reqUpdatedAfter: reqUpdatesAfter[idx],
    })
  )
  // request combined presentation
  const {
    message: combinedPresentationReq,
    session: combinedSession,
  } = await GabiVerifier.requestCombinedPresentation(requests)
  // build presentation
  const combinedPresentation = await claimer.buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  })
  // verify presentation
  const { verified, claims } = await GabiVerifier.verifyCombinedPresentation({
    proof: combinedPresentation,
    attesterPubKeys,
    verifierSession: combinedSession,
    latestAccumulators: accumulators,
  })
  return {
    combinedPresentationReq,
    combinedSession,
    combinedPresentation,
    verified,
    claims,
  }
}
