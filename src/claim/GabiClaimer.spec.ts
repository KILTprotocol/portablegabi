/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  attestationSetup,
  mixedAttestationsSetup,
  presentationSetup,
  actorSetup,
} from '../testSetup/testSetup'
import GabiClaimer from './GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { claim } from '../testSetup/testConfig'
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
  Witness,
} from '../types/Attestation'
import {
  ClaimerAttestationSession,
  AttestationRequest,
  Credential,
  Presentation,
  ClaimError,
} from '../types/Claim'
import { PresentationRequest } from '../types/Verification'
import Accumulator from '../attestation/Accumulator'

async function buildCredentialError(
  claimer: GabiClaimer,
  attestation: Attestation,
  claimerSession: ClaimerAttestationSession
): Promise<void> {
  await expect(
    claimer.buildCredential({
      attestation,
      claimerSession,
    })
  ).rejects.toThrowError('Proof of correctness on signature does not verify')
}

// close WASM instance after tests ran
afterAll(() => goWasmClose())

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
  let attestation2: Attestation
  let claimerSession2: ClaimerAttestationSession
  let claimerSessionE12: ClaimerAttestationSession
  let claimerSessionE21: ClaimerAttestationSession
  let mixedAttestationsValid: {
    issuance: {
      attestation: Attestation
      witness: Witness
    }
    claimerSession: ClaimerAttestationSession
  }
  let presentationReq: PresentationRequest
  let presentation: Presentation

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
    ;({ presentationReq, presentation } = await presentationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      credential,
    }))
    ;({
      gabiAttester2,
      accumulator2,
      attestation2,
      claimerSession2,
      mixedAttestationsValid,
      claimerSessionE12,
      claimerSessionE21,
    } = await mixedAttestationsSetup({
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
    it('Checks valid requestAttestation', async () => {
      const request = await gabiClaimer.requestAttestation({
        startAttestationMsg: initiateAttestationReq,
        claim,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(request).toBeDefined()
      expect(typeof request).toBe('object')
      expect(Object.keys(request)).toContain('session')
      expect(Object.keys(request)).toContain('message')
    })
    it('Checks for correct data in requestAttestion', async () => {
      expect(initiateAttestationReq).toBeDefined()
      expect(attesterSession).toBeDefined()
      expect(attestationRequest).toBeDefined()
      expect(claimerSession).toBeDefined()
    })
    it('Should throw when requesting attestation with empty object as claim', async () => {
      await expect(
        gabiClaimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: {},
          attesterPubKey: gabiAttester.getPubKey(),
        })
      ).rejects.toThrowError(ClaimError.claimMissing)
    })
    it('Should throw when requesting attestation with non-object as claim', async () => {
      await expect(
        gabiClaimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: ('string' as unknown) as object,
          attesterPubKey: gabiAttester.getPubKey(),
        })
      ).rejects.toThrowError(ClaimError.notAnObject('string'))
    })
    it('Should throw when requesting attestation with array as claim', async () => {
      await expect(
        gabiClaimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: [1],
          attesterPubKey: gabiAttester.getPubKey(),
        })
      ).rejects.toThrowError(ClaimError.duringParsing)
    })
    it('Should build credential for gabiAttester', async () => {
      await expect(
        gabiClaimer.buildCredential({
          attestation,
          claimerSession,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should build credential for gabiAttester2', async () => {
      await expect(
        gabiClaimer.buildCredential({
          attestation: attestation2,
          claimerSession: claimerSession2,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Checks for correct data in buildCredential', async () => {
      const cred = await gabiClaimer.buildCredential({
        claimerSession,
        attestation,
      })
      expect(cred).toBeDefined()
      const credObj: ICredential<typeof claim> = JSON.parse(cred.valueOf())
      expect(credObj).toHaveProperty('claim', claim)
      expect(
        new Date(credObj.credential.nonrevWitness.Updated).getTime()
      ).toBeLessThan(0)
      // compare signatures
      const aSigObj: IIssueAttestation = JSON.parse(attestation.valueOf())
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
    })
    it('Checks for correct data in buildPresentation', () => {
      expect(presentation).not.toBe('undefined')
      const proofObj: IProof = JSON.parse(presentation.valueOf())
      const sigObj: IIssueAttestation = JSON.parse(attestation.valueOf())
      expect(proofObj.proof.A).not.toEqual(sigObj.signature.A)
      expect(proofObj.proof.e_response).not.toEqual(sigObj.proof.e_response)
      expect(proofObj.proof.c).not.toEqual(sigObj.proof.c)
    })
    it('Updates credential and compares both versions (without revoking)', async () => {
      const timeBeforeUpdate = new Date().getTime()
      const updatedCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        accumulator,
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
        accumulator,
        witnesses: [witness],
      })
      expect(revUpdate).toBeDefined()
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester.getPubKey(),
          accumulator: revUpdate,
        })
      ).rejects.toThrowError('revoked')
    })
    it('Should not throw when two claimers interchange credential', async () => {
      // reason: credential is a secret one should not share
      const gabiClaimer2 = await GabiClaimer.buildFromScratch()
      const sameCredFromOtherClaimer = await gabiClaimer2.buildCredential({
        claimerSession,
        attestation,
      })
      expect(sameCredFromOtherClaimer).toEqual(expect.anything())
      const { credential: diffCredFromOtherClaimer } = await attestationSetup({
        claimer: gabiClaimer2,
        attester: gabiAttester,
        accumulator,
      })
      expect(diffCredFromOtherClaimer).toEqual(expect.anything())
      await expect(
        gabiClaimer.updateCredential({
          credential: diffCredFromOtherClaimer,
          attesterPubKey: gabiAttester.getPubKey(),
          accumulator,
        })
      ).resolves.toEqual(expect.anything())
    })
  })

  // run tests on invalid data
  describe('Negative tests', () => {
    it('Should throw in buildCredential for incorrect combination of session and signature', async () => {
      await buildCredentialError(
        gabiClaimer,
        attestation, // attester 1
        claimerSession2 // attester 2
      )
      return buildCredentialError(
        gabiClaimer,
        attestation2, // attester 2
        claimerSession // attester 1
      )
    })
    it('Should throw for 3 of all 4 possibilties to build a credential from valid mixed attestation', async () => {
      expect(mixedAttestationsValid).toEqual(expect.anything())
      await expect(
        gabiClaimer.buildCredential({
          attestation: mixedAttestationsValid.issuance.attestation,
          claimerSession: claimerSessionE21,
        })
      ).resolves.toEqual(expect.anything())
      const throwingSessions = [
        claimerSession,
        claimerSession2,
        claimerSessionE12,
      ]
      return Promise.all(
        throwingSessions.map(session =>
          buildCredentialError(
            gabiClaimer,
            mixedAttestationsValid.issuance.attestation,
            session
          )
        )
      )
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
          accumulator,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with different accumulator of same attester', async () => {
      const acc = await gabiAttester.createAccumulator()
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
          accumulator: acc,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with accumulator from different attester', async () => {
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester.getPubKey(),
          accumulator: accumulator2, // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with accumulator + pubkey from different attester', async () => {
      await expect(
        gabiClaimer.updateCredential({
          credential,
          attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
          accumulator: accumulator2, // should be gabiAttester to be valid
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
  })
  it.todo('chain: ')
})
