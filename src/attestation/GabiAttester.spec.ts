import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import GabiAttester from './GabiAttester'
import { privKey, pubKey } from '../testSetup/testConfig'
import runTestSetup from '../testSetup/testSetup'
import {
  Accumulator,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Attestation,
  Witness,
} from '../types/Attestation'

afterAll(async () => {
  await goWasmClose()
})

describe('Test attester', () => {
  let gabiAttester: GabiAttester
  let update: Accumulator
  let update2: Accumulator
  let startAttestationMsg: InitiateAttestationRequest
  let attesterSignSession: AttesterAttestationSession
  let aSignature: Attestation
  let witness: Witness
  let witness2: Witness
  let mixedIssuedAttestations: {
    [key: number]: {
      attestation: Attestation
      witness: Witness
    }
  }
  beforeAll(async () => {
    ;({
      gabiAttester,
      update,
      update2,
      startAttestationMsg,
      attesterSignSession,
      aSignature,
      witness,
      witness2,
      mixedIssuedAttestations,
    } = await runTestSetup())
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
      expect(startAttestationMsg).toBeDefined()
      expect(attesterSignSession).toBeDefined()
    })
    it('Checks valid issueAttestation', async () => {
      expect(aSignature).toBeDefined()
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
