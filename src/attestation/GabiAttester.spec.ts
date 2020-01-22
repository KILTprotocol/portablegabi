import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import GabiAttester from './GabiAttester'
import { privKey, pubKey } from '../testSetup/testConfig'
import {
  initClaimerAttesterSetup,
  attestationSetup,
  mixedAttestationsSetup,
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
  let mixedIssuedAttestations: {
    [key: number]: {
      attestation: Attestation
      witness: Witness
    }
  }
  beforeAll(async () => {
    ;({ gabiClaimer, gabiAttester, update } = await initClaimerAttesterSetup())
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
      mixedIssuedAttestations,
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
    it('Should not throw when revoking with another accumulator of same attester', async () => {
      const updateNew = await gabiAttester.createAccumulator()
      await expect(
        gabiAttester.revokeAttestation({
          update: updateNew,
          witness,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with witnesses from mixedIssuedAttestations', async () => {
      // reason: all of these issueAttestation calls have been made from gabiAttester
      Object.values(mixedIssuedAttestations).forEach(
        async ({ witness: theWitness }) => {
          await expect(
            gabiAttester.revokeAttestation({
              update,
              witness: theWitness,
            })
          ).resolves.toEqual(expect.anything())
        }
      )
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
  })
})
