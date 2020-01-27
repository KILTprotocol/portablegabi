import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import GabiAttester from './GabiAttester'
import { privKey, pubKey, claim } from '../testSetup/testConfig'
import {
  attestationSetup,
  mixedAttestationsSetup,
  actorSetup,
} from '../testSetup/testSetup'
import {
  Accumulator,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Attestation,
  Witness,
} from '../types/Attestation'
import GabiClaimer from '../claim/GabiClaimer'
import { AttestationRequest } from '../types/Claim'

afterAll(async () => {
  await goWasmClose()
})

describe('Test attester', () => {
  let gabiAttester: GabiAttester
  let gabiClaimer: GabiClaimer
  let update: Accumulator
  let update2: Accumulator
  let initiateAttestationReq: InitiateAttestationRequest
  let attesterSession: AttesterAttestationSession
  let attestationRequest: AttestationRequest
  let attestation: Attestation
  let witness: Witness
  let witness2: Witness
  let mixedAttestationsInvalid: {
    [key: number]: {
      attestationSession: AttesterAttestationSession
      attestationRequest: AttestationRequest
      update: Accumulator
    }
  }
  beforeAll(async () => {
    ;({
      claimers: [gabiClaimer],
      attesters: [gabiAttester],
      accumulators: [update],
    } = await actorSetup())
    ;({
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
      attestation,
      witness,
    } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      update,
    }))
    ;({
      update2,
      witness2,
      mixedAttestationsInvalid,
    } = await mixedAttestationsSetup({
      gabiClaimer,
      gabiAttester,
      update,
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
    }))
  })
  describe('Confirm valid data from runTestSetup', () => {
    it('Checks valid buildFromKeyPair for existing keys', async () => {
      const attester = new GabiAttester(pubKey, privKey)
      expect(attester).toBeDefined()
      expect(attester).toStrictEqual(gabiAttester)
    })
    it('Checks non-deterministic accumulator creation', async () => {
      const updateNew = gabiAttester.createAccumulator()
      expect(update.valueOf()).not.toStrictEqual(updateNew.valueOf())
    })
    it('Checks valid startAttestation', () => {
      expect(initiateAttestationReq).toBeDefined()
      expect(attesterSession).toBeDefined()
    })
    it('Checks valid issueAttestation', async () => {
      expect(attestation).toBeDefined()
      expect(witness).toBeDefined()
    })
  })
  // since the attester acts as a middleman, most of the functionality is tested in GabiClaimer and GabiVerifier
  describe('Test attester functionality', () => {
    it('Should throw when issuing unsigned attestations', async () => {
      return Promise.all(
        Object.values(mixedAttestationsInvalid).map(
          ({
            attestationSession: attestationSessionMixed,
            attestationRequest: attestationRequestMixed,
            update: updateMixed,
          }) =>
            expect(
              gabiAttester.issueAttestation({
                attestationSession: attestationSessionMixed,
                attestationRequest: attestationRequestMixed,
                update: updateMixed,
              })
            ).rejects.toThrow('commit message could not be verified')
        )
      ).then(response =>
        response.map(item => expect(item).not.toEqual(expect.anything()))
      )
    })
    it('Should not throw when revoking with another accumulator of same attester', async () => {
      const updateNew = await gabiAttester.createAccumulator()
      await expect(
        gabiAttester.revokeAttestation({
          update: updateNew,
          witness,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with witness from another attester', async () => {
      await expect(
        gabiAttester.revokeAttestation({
          update,
          witness: witness2,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should throw when revoking with accumulator from another attester', async () => {
      await expect(
        gabiAttester.revokeAttestation({
          update: update2,
          witness,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it.skip('Should throw when tampering context of initiateAttestationReq', async () => {
      const {
        session: attesterSession2,
        message: initiateAttestationReq2,
      } = await gabiAttester.startAttestation()
      console.log(initiateAttestationReq2)
      const tamperObj: { nonce: string; context: string } = {
        ...JSON.parse(initiateAttestationReq2.valueOf()),
        context: 'El1fs5GK2sko8JkfEhWiCITaD38uA2CZN29opxU6TKM=', // === btoa('tampered')
        // context: 'dGFtcGVyZWQ', // === btoa('tampered')
      }
      const initiateAttestationReqTampered = new InitiateAttestationRequest(
        JSON.stringify(tamperObj)
      )
      console.log(initiateAttestationReqTampered)
      const {
        message: attestationRequest2,
        session: claimerSession,
      } = await gabiClaimer.requestAttestation({
        // startAttestationMsg: initiateAttestationReqTampered,
        startAttestationMsg: initiateAttestationReq2,
        claim,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      // Attester issues attestation
      const {
        attestation: attestation2,
        witness: witness3,
      } = await gabiAttester.issueAttestation({
        attestationSession: attesterSession2,
        attestationRequest: attestationRequest2,
        update,
      })
      expect(attestation2).toEqual(expect.anything())
      expect(witness3).toEqual(expect.anything())
      const credential = await gabiClaimer.buildCredential({
        attestation: attestation2,
        claimerSession,
      })
      expect(credential).toEqual(expect.anything())
    })
  })
  it.todo('tamper message nonce')
  it.todo('tamper context nonce')
})
