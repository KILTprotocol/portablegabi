import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import {
  IGabiContextNonce,
  IGabiAttestationResponse,
} from '../types/Attestation'
import { AttesterSignSession, ReqSignMsg } from './testTypes'
import { pubKey, privKey, pubKeyRevo2, privKeyRevo2, claim } from './testConfig'

const runTestSetup = async (): Promise<{
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  gabiAttester2: GabiAttester
  startAttestationMsg: IGabiContextNonce
  attesterSignSession: AttesterSignSession
  reqSignMsg: ReqSignMsg
  aSignature: string
  aSignature2: string
  claimerSignSession: any // IClaimerSignSession
  startAttestationMsg2: IGabiContextNonce
  attesterSignSession2: AttesterSignSession
  reqSignMsg2: ReqSignMsg
  reqSignMsgE12: ReqSignMsg
  reqSignMsgE21: ReqSignMsg
  claimerSignSession2: any // IClaimerSignSession
  claimerSignSessionE12: any // IClaimerSignSession
  claimerSignSessionE21: any // IClaimerSignSession
  invalidAttestationResponses: { [key: number]: IGabiAttestationResponse }
  invalidSignatures: string[]
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
  const { signature: aSignature } = await gabiAttester.issueAttestation({
    attesterSignSession,
    reqSignMsg,
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
  const { signature: aSignature2 } = await gabiAttester2.issueAttestation({
    attesterSignSession: attesterSignSession2,
    reqSignMsg: reqSignMsg2,
    update: update2,
  })
  const invalidAttestationResponses = {
    1112_2221: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsgE12, // 12
      update,
    }),
    1122_2211: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsg2, // 22
      update,
    }),
    1222_2111: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 2
      reqSignMsg: reqSignMsg2, // 22
      update,
    }),
    1211_2122: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 1
      reqSignMsg, // 11
      update,
    }),
    1121_2212: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsgE21, // 21
      update,
    }),
    // this is a correct signature when called from gabiAttester since the pk matches
    1221_2112: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 1
      reqSignMsg: reqSignMsgE21, // 21
      update,
    }),
    1212_2121: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 2
      reqSignMsg: reqSignMsgE12, // 12
      update,
    }),
  }
  const invalidSignatures = Object.values(invalidAttestationResponses).map(
    response => response.signature
  )
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
  }
}
export default runTestSetup
