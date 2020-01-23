/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import runTestSetup, { issuanceSetup } from '../testSetup/testSetup'
import GabiClaimer from './GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { claim, numOfClaimKeys } from '../testSetup/testConfig'
import {
  ICredential,
  IIssueAttestation,
  Spy,
  IProof,
} from '../testSetup/testTypes'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import {
  Attestation,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Accumulator,
  Witness,
} from '../types/Attestation'
import {
  ClaimerAttestationSession,
  AttestationRequest,
  Credential,
  Presentation,
} from '../types/Claim'
import { PresentationRequest } from '../types/Verification'

async function buildCredentialError(
  claimer: GabiClaimer,
  attestation: Attestation,
  claimerSignSession: ClaimerAttestationSession,
  spy: Spy<'log'>,
  errCount = 1
): Promise<number> {
  await expect(
    claimer.buildCredential({
      attestation,
      claimerSignSession,
    })
  ).rejects.toThrowError('Proof of correctness on signature does not verify')
  return errCount + 1
}

// close WASM instance after tests ran
afterAll(async () => {
  await goWasmClose()
})

describe('Test claimer creation', () => {
  let gabiClaimer: GabiClaimer
  beforeEach(async () => {
    gabiClaimer = await GabiClaimer.buildFromScratch()
  })
  it('Builds claimer from scratch', async () => {
    const claimer = await GabiClaimer.buildFromScratch()
    expect(claimer).toHaveProperty('secret')
    expect(gabiClaimer).toHaveProperty('secret')
    expect(claimer).not.toBe(gabiClaimer)
  })
  it('Builds claimer from empty mnemonic seed', async () => {
    const claimer = await GabiClaimer.buildFromMnemonic('')
    expect(claimer).toHaveProperty(
      'secret',
      '{"MasterSecret":"HdWjkfn17XNA/01FE6q5zORPlJel5+2F/YGIdrbrQC4="}'
    )
    expect(claimer).not.toBe(gabiClaimer)
  })
  it('Builds claimer from non-empty mnemonic seed', async () => {
    const claimer = await GabiClaimer.buildFromMnemonic(
      'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken'
    )
    expect(claimer).toHaveProperty(
      'secret',
      '{"MasterSecret":"ZaWdr/rKSi4/cZNZbsZlMtx71K1foTFbp/QUJXMsrbk="}'
    )
    expect(claimer).not.toBe(gabiClaimer)
  })
})

describe('Test claimer functionality', () => {
  let spy: Spy<'log'>
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let gabiAttester2: GabiAttester
  let witness: Witness
  let update: Accumulator
  let update2: Accumulator
  let startAttestationMsg: InitiateAttestationRequest
  let attesterSignSession: AttesterAttestationSession
  let attestationRequest: AttestationRequest
  let aSignature: Attestation
  let claimerSignSession: ClaimerAttestationSession
  let claimerSignSession2: ClaimerAttestationSession
  let claimerSignSessionE12: ClaimerAttestationSession
  let claimerSignSessionE21: ClaimerAttestationSession
  let claimerSessions: ClaimerAttestationSession[]
  let invalidSignatures: Attestation[]
  let validSignatureBuildCredential: {
    attestation: Attestation
    claimerSignSession: ClaimerAttestationSession
  }
  let aSignature2: Attestation
  let credential: Credential
  let presentationReq: PresentationRequest
  let proof: Presentation

  // get data from runTestSetup
  beforeAll(async () => {
    ;({
      gabiClaimer,
      gabiAttester,
      gabiAttester2,
      update,
      update2,
      startAttestationMsg,
      attesterSignSession,
      attestationRequest,
      claimerSignSession,
      claimerSignSession2,
      claimerSignSessionE12,
      claimerSignSessionE21,
      aSignature,
      witness,
      aSignature2,
      invalidSignatures,
      validSignatureBuildCredential,
      credential,
      proof,
      presentationReq,
    } = await runTestSetup())
    claimerSessions = [
      claimerSignSession,
      claimerSignSession2,
      claimerSignSessionE12,
      claimerSignSessionE21,
    ]
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
  describe('Checks valid data', () => {
    it('Checks valid requestAttestation', async () => {
      const request = await gabiClaimer.requestAttestation({
        startAttestationMsg,
        claim: JSON.stringify(claim),
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(request).toBeDefined()
      expect(typeof request).toBe('object')
      expect(Object.keys(request)).toContain('session')
      expect(Object.keys(request)).toContain('message')
    })
    it('Checks for correct data in requestAttestion', async () => {
      expect(startAttestationMsg).toBeDefined()
      expect(attesterSignSession).toBeDefined()
      expect(attestationRequest).toBeDefined()
      expect(claimerSignSession).toBeDefined()
    })
    it('Should build credential for gabiAttester', async () => {
      const cred = await gabiClaimer.buildCredential({
        attestation: aSignature,
        claimerSignSession,
      })
      expect(cred).toBeDefined()
    })
    it('Should build credential for gabiAttester2', async () => {
      const cred = await gabiClaimer.buildCredential({
        attestation: aSignature2,
        claimerSignSession: claimerSignSession2,
      })
      expect(cred).toBeDefined()
    })
    it('Checks for correct data in buildCredential', async () => {
      const cred = await gabiClaimer.buildCredential({
        claimerSignSession,
        attestation: aSignature,
      })
      expect(cred).toBeDefined()
      const credObj: ICredential<typeof claim> = JSON.parse(cred.valueOf())
      expect(credObj).toHaveProperty('claim', claim)
      expect(
        new Date(credObj.credential.nonrevWitness.Updated).getTime()
      ).toBeLessThan(0)
      // compare signatures
      const aSigObj: IIssueAttestation = JSON.parse(aSignature.valueOf())
      expect(Object.keys(aSigObj.signature)).toStrictEqual(
        Object.keys(credObj.credential.signature)
      )
      expect(aSigObj.signature.A).toStrictEqual(credObj.credential.signature.A)
      expect(aSigObj.signature.KeyShareP).toStrictEqual(
        credObj.credential.signature.KeyShareP
      )
      expect(aSigObj.signature.e).toStrictEqual(credObj.credential.signature.e)
      expect(aSigObj.signature.v).not.toStrictEqual(
        credObj.credential.signature
      )
      expect(aSigObj.nonrev).toStrictEqual(credObj.credential.nonrevWitness)
      // compare attributes
      expect(credObj.credential.attributes).toHaveLength(numOfClaimKeys + 1)
      const parsedReq = JSON.parse(attestationRequest.valueOf())
      parsedReq.values.map((val: any) =>
        expect(credObj.credential.attributes).toContain(val)
      )
    })
    it('Checks for correct data in buildPresentation', () => {
      expect(proof).not.toBe('undefined')
      const proofObj: IProof = JSON.parse(proof.valueOf())
      const sigObj: IIssueAttestation = JSON.parse(aSignature.valueOf())
      expect(proofObj.attributes).toHaveLength(numOfClaimKeys)
      expect(proofObj.proof.A).not.toEqual(sigObj.signature.A)
      expect(proofObj.proof.e_response).not.toEqual(sigObj.proof.e_response)
      expect(proofObj.proof.c).not.toEqual(sigObj.proof.c)
    })
    it('Updates credential and compares both versions (without revoking)', async () => {
      const timeBeforeUpdate = new Date().getTime()
      const updatedCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        update,
      })
      const timeAfterUpdate = new Date().getTime()
      expect(updatedCred).toBeDefined()
      expect(credential).toBeDefined()
      const credObj: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      const cred2Obj: ICredential<typeof claim> = JSON.parse(
        updatedCred.valueOf()
      )
      const { Updated: nonUpdatedDate } = credObj.credential.nonrevWitness
      const { Updated: updatedDate } = cred2Obj.credential.nonrevWitness
      expect(nonUpdatedDate).not.toStrictEqual(updatedDate)
      expect(new Date(nonUpdatedDate).getTime()).toBeLessThan(
        new Date(updatedDate).getTime()
      )
      expect(new Date(updatedDate).getTime()).toBeGreaterThan(timeBeforeUpdate)
      expect(new Date(updatedDate).getTime()).toBeLessThan(timeAfterUpdate)

      // create deep clone of credential with updatedDate
      const credObjWithUpdatedDate: ICredential<typeof claim> = JSON.parse(
        JSON.stringify({
          ...credObj,
        })
      )
      credObjWithUpdatedDate.credential.nonrevWitness.Updated = updatedDate
      expect(credObjWithUpdatedDate).toStrictEqual(cred2Obj)
    })
    it('Should throw when updating a revoked credential', async () => {
      const revUpdate = await gabiAttester.revokeAttestation({
        update,
        witness,
      })
      expect(revUpdate).toBeDefined()
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester.getPubKey(),
          update: new Accumulator(revUpdate),
        })
      ).rejects.toThrowError('revoked')
    })
    it('Should not throw when two claimers interchange credential', async () => {
      // reason: credential is a secret one should not share
      const gabiClaimer2 = await GabiClaimer.buildFromScratch()
      const sameCredFromOtherClaimer = await gabiClaimer2.buildCredential({
        claimerSignSession,
        attestation: aSignature,
      })
      expect(sameCredFromOtherClaimer).toEqual(expect.anything())
      const { credential: diffCredFromOtherClaimer } = await issuanceSetup(
        gabiClaimer2,
        gabiAttester,
        update,
        JSON.stringify(claim)
      )
      expect(diffCredFromOtherClaimer).toEqual(expect.anything())
      await expect(
        gabiClaimer.updateCredential({
          credential: diffCredFromOtherClaimer,
          attesterPubKey: gabiAttester.getPubKey(),
          update,
        })
      ).resolves.toEqual(expect.anything())
    })
  })

  // run tests on invalid data
  describe('Checks invalid/tampered data', () => {
    it('Should throw in buildCredential for incorrect (session, signature) combination', async () => {
      await buildCredentialError(
        gabiClaimer,
        aSignature, // attester 1
        claimerSignSession2, // attester 2
        spy
      )
      return buildCredentialError(
        gabiClaimer,
        aSignature2, // attester 2
        claimerSignSession, // attester 1
        spy
      )
    })
    it('Should throw for 27 of all 28 instances of mixed signatures', async () => {
      let errCounter = 1
      for (const attestation of invalidSignatures) {
        for (const session of claimerSessions) {
          // there is exactly one possiblity to build a credential from the sessions and signatures
          if (
            attestation === validSignatureBuildCredential.attestation &&
            session === validSignatureBuildCredential.claimerSignSession
          ) {
            const validCred = await gabiClaimer.buildCredential({
              attestation: validSignatureBuildCredential.attestation,
              claimerSignSession:
                validSignatureBuildCredential.claimerSignSession,
            })
            expect(validCred).toBeDefined()
            expect(validCred.length).toBeGreaterThan(10)
          } else {
            errCounter = await buildCredentialError(
              gabiClaimer,
              attestation,
              session,
              spy,
              errCounter
            )
          }
        }
      }
    })
    it('Should throw on buildPresentation with pubkey from different attester', async () => {
      await expect(
        gabiClaimer.buildPresentation({
          credential,
          presentationReq,
          attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with pubkey from different attester', async () => {
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
          update,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with update from different attester', async () => {
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester.getPubKey(),
          update: update2, // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with update + pubkey from different attester', async () => {
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
          update: update2, // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
  })
})
