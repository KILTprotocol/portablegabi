import {
  attestationSetup,
  mixedAttestationsSetup,
  actorSetup,
} from '../testSetup/testSetup'
import GabiClaimer from './GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { Spy } from '../testSetup/testTypes'
import {
  Attestation,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Witness,
} from '../types/Attestation'
import { ClaimerAttestationSession, AttestationRequest } from '../types/Claim'
import Accumulator from '../attestation/Accumulator'
import Credential from './Credential'

describe('Test claimer functionality', () => {
  let spy: Spy<'log'>
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let accumulator: Accumulator
  let initiateAttestationReq: InitiateAttestationRequest
  let attesterSession: AttesterAttestationSession
  let claimerSession: ClaimerAttestationSession
  let attestationRequest: AttestationRequest
  let witness: Witness
  let attestation: Attestation
  let credential: Credential
  let gabiAttester2: GabiAttester
  let accumulator2: Accumulator

  // get data from testSetup
  beforeAll(async () => {
    ;({
      claimers: [gabiClaimer],
      attesters: [gabiAttester],
      accumulators: [accumulator],
    } = await actorSetup())
    ;({
      initiateAttestationReq,
      attesterSession,
      claimerSession,
      attestationRequest,
      attestation,
      witness,
      credential,
    } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      accumulator,
    }))
    credential = await gabiClaimer.buildCredential({
      claimerSession,
      attestation,
    })
    ;({ gabiAttester2, accumulator2 } = await mixedAttestationsSetup({
      gabiClaimer,
      gabiAttester,
      accumulator,
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
    }))
  }, 20000)

  // clear mocks after each test
  beforeEach(() => {
    spy = {
      exit: jest.spyOn(process, 'exit').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    }
  })
  afterEach(() => {
    expect(spy.exit).not.toHaveBeenCalled()
    expect(spy.error).not.toHaveBeenCalled()
    spy.error.mockRestore()
    spy.exit.mockRestore()
  })

  // run tests on valid data
  describe('Positive tests', () => {
    it('Updates credential and compares both versions (without revoking)', async () => {
      const updatedCred = await credential.update({
        attesterPubKey: gabiAttester.publicKey,
        accumulators: [accumulator],
      })
      expect(updatedCred).toBeDefined()
      expect(credential).toBeDefined()
      expect(updatedCred).toStrictEqual(credential)
    })
    it('Should throw when updating a revoked credential', async () => {
      const revUpdate = await gabiAttester.revokeAttestation({
        accumulator,
        witnesses: [witness],
      })
      expect(revUpdate).toBeDefined()
      await expect(
        credential.update({
          attesterPubKey: gabiAttester.publicKey,
          accumulators: [revUpdate],
        })
      ).rejects.toThrowError('revoked')
    })
  })
  describe('Test updating with multiple accumulators', () => {
    let witnesses: Witness[]
    let accumulators: Accumulator[]
    const limit = 4
    beforeAll(async () => {
      // create witnesses that will be revoked
      witnesses = (
        await Promise.all(
          new Array(limit).fill(1).map(() =>
            attestationSetup({
              claimer: gabiClaimer,
              attester: gabiAttester,
              accumulator,
            })
          )
        )
      ).map(x => x.witness)
      // revoke witnesses
      const accRev1 = await gabiAttester.revokeAttestation({
        accumulator,
        witnesses: [witnesses[0]],
      })
      const accRev2 = await gabiAttester.revokeAttestation({
        accumulator: accRev1,
        witnesses: [witnesses[1]],
      })

      const accRev3 = await gabiAttester.revokeAttestation({
        accumulator: accRev2,
        witnesses: witnesses.slice(2, limit),
      })
      accumulators = [accRev1, accRev2, accRev3]
    })
    it('Should return expected revocation indices', async () => {
      await expect(
        accumulators[0].getRevIndex(gabiAttester.publicKey)
      ).resolves.toBe(1)
      await expect(
        accumulators[1].getRevIndex(gabiAttester.publicKey)
      ).resolves.toBe(2)
      await expect(
        accumulators[2].getRevIndex(gabiAttester.publicKey)
      ).resolves.toBe(limit)
    })
    it('Should throw when updating credential while skipping accumulator versions (revIndex 1 to 5)', async () => {
      // expect failure when updating from revIndex === 0 to revIndex === limit
      await expect(
        credential.update({
          attesterPubKey: gabiAttester.publicKey,
          accumulators: [accumulators[2]],
        })
      ).rejects.toThrowError('update too new')
    })
    it('Should not throw when updating credential from sorted accumulator array', async () => {
      await expect(
        credential.update({
          attesterPubKey: gabiAttester.publicKey,
          accumulators,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when updating credential from unsorted accumulator array', async () => {
      await expect(
        credential.update({
          attesterPubKey: gabiAttester.publicKey,
          accumulators: [
            accumulators[2],
            accumulators[1],
            accumulator,
            accumulators[0],
          ],
        })
      ).resolves.toEqual(expect.anything())
    })
  })
  // run tests on invalid data
  describe('Negative tests', () => {
    it('Should throw in updateCredential with pubkey from different attester', async () => {
      await expect(
        credential.update({
          attesterPubKey: gabiAttester2.publicKey, // should be gabiAttester to be valid
          accumulators: [accumulator],
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw in updateCredential with different accumulator of same attester', async () => {
      const acc = await gabiAttester.createAccumulator()
      await expect(
        credential.update({
          attesterPubKey: gabiAttester2.publicKey, // should be gabiAttester to be valid
          accumulators: [acc],
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw in updateCredential with accumulator from different attester', async () => {
      await expect(
        credential.update({
          attesterPubKey: gabiAttester.publicKey,
          accumulators: [accumulator2], // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw in updateCredential with accumulator + pubkey from different attester', async () => {
      await expect(
        credential.update({
          attesterPubKey: gabiAttester2.publicKey, // should be gabiAttester to be valid
          accumulators: [accumulator2], // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
  })
})
