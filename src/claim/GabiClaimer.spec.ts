import GabiClaimer from './GabiClaimer'
import runTestSetup from '../testSetup/testSetup'
import GabiAttester from '../attestation/GabiAttester'
import { claim, numOfClaimKeys } from '../testSetup/testConfig'
import {
  ICredential,
  IIssueAttestation,
  Spy,
  ReqSignMsg,
} from '../testSetup/testTypes'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { InitiateAttestationRequest } from '../../build/types/Attestation'
import {
  ClaimerAttestationSession,
  AttestationRequest,
  Credential,
} from '../types/Claim'
import { Attestation } from '../types/Attestation'

function buildCredentialError(credential: Credential, spy: Spy<'log'>): void {
  expect(credential).toBeUndefined()
  expect(spy.error).toHaveBeenCalledWith(
    'Proof of correctness on signature does not verify.'
  )
  expect(spy.error).toHaveBeenCalledTimes(1)
  expect(spy.exit).not.toHaveBeenCalled()
}

// close WASM instance after tests ran
afterAll(() => {
  goWasmClose()
  process.exitCode = 0
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
    expect(claimer).not.toMatchObject(gabiClaimer)
  })
  it('Builds claimer from empty mnemonic seed', async () => {
    const claimer = await GabiClaimer.buildFromMnemonic('')
    expect(claimer).toHaveProperty(
      'secret',
      '{"MasterSecret":"HdWjkfn17XNA/01FE6q5zORPlJel5+2F/YGIdrbrQC4="}'
    )
    expect(claimer).not.toMatchObject(gabiClaimer)
  })
  it('Builds claimer from non-empty mnemonic seed', async () => {
    const claimer = await GabiClaimer.buildFromMnemonic(
      'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken'
    )
    expect(claimer).toHaveProperty(
      'secret',
      '{"MasterSecret":"ZaWdr/rKSi4/cZNZbsZlMtx71K1foTFbp/QUJXMsrbk="}'
    )
    expect(claimer).not.toMatchObject(gabiClaimer)
  })
})

describe('Test claimer functionality', () => {
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let startAttestationMsg: InitiateAttestationRequest
  let attesterSignSession: ClaimerAttestationSession
  let reqSignMsg: AttestationRequest
  let aSignature: Attestation
  let claimerSignSession: ClaimerAttestationSession
  let claimerSignSession2: ClaimerAttestationSession
  let claimerSignSessionE12: ClaimerAttestationSession
  let claimerSignSessionE21: ClaimerAttestationSession
  let invalidSignatures: Attestation[]
  let aSignature2: Attestation
  let spy: Spy<'log'>

  // get data from runTestSetup
  beforeAll(async () => {
    ;({
      gabiClaimer,
      gabiAttester,
      startAttestationMsg,
      attesterSignSession,
      reqSignMsg,
      claimerSignSession,
      claimerSignSession2,
      claimerSignSessionE12,
      claimerSignSessionE21,
      aSignature,
      aSignature2,
      invalidSignatures,
    } = await runTestSetup())
  }, 20000)

  // clear mocks after each test
  beforeEach(() => {
    spy = {
      exit: jest.spyOn(process, 'exit').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    }
  })
  afterEach(() => {
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
      expect(reqSignMsg).toBeDefined()
      expect(claimerSignSession).toBeDefined()
    })
    it('Should build credential for gabiAttester', async () => {
      const credential = await gabiClaimer.buildCredential({
        attestation: aSignature,
        claimerSignSession,
      })
      expect(credential).toBeDefined()
      expect(spy.error).not.toHaveBeenCalled()
      expect(spy.exit).not.toHaveBeenCalled()
    })
    it('Should build credential for gabiAttester2', async () => {
      const credential = await gabiClaimer.buildCredential({
        attestation: aSignature2,
        claimerSignSession: claimerSignSession2,
      })
      expect(credential).toBeDefined()
      expect(spy.error).not.toHaveBeenCalled()
      expect(spy.exit).not.toHaveBeenCalled()
    })
    it('Checks for correct data in buildCredential', async () => {
      const credential = await gabiClaimer.buildCredential({
        claimerSignSession,
        attestation: aSignature,
      })
      expect(credential).toBeDefined()
      const credObj: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      expect(credObj).toHaveProperty('claim', claim)
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
      const parsedReq = JSON.parse(reqSignMsg.valueOf()) as ReqSignMsg
      parsedReq.values.map(val =>
        expect(credObj.credential.attributes).toContain(val)
      )
    })
    it.todo('correct revealAttributes')
    it.todo('correct updateCredential')
  })

  // run tests on invalid data
  describe('Checks invalid data', () => {
    it('Should throw for signature from wrong attester (gabiAttester)', async () => {
      const credential = await gabiClaimer.buildCredential({
        attestation: aSignature,
        claimerSignSession: claimerSignSession2,
      })
      buildCredentialError(credential, spy)
    })
    it('Should throw for signature from wrong attester (gabiAttester2)', async () => {
      const credential = await gabiClaimer.buildCredential({
        attestation: aSignature2,
        claimerSignSession,
      })
      buildCredentialError(credential, spy)
    })
    it('Should throw on all invalid signatures', async () => {
      return Promise.all(
        invalidSignatures.map(async attestation => {
          return [
            await gabiClaimer.buildCredential({
              attestation,
              claimerSignSession,
            }),
            await gabiClaimer.buildCredential({
              attestation,
              claimerSignSession: claimerSignSessionE12,
            }),
            await gabiClaimer.buildCredential({
              attestation,
              claimerSignSession: claimerSignSessionE21,
            }),
            await gabiClaimer.buildCredential({
              attestation,
              claimerSignSession: claimerSignSession2,
            }),
          ]
        })
      ).then(() => {
        expect(spy.error).toHaveBeenCalledWith(
          'Proof of correctness on signature does not verify.'
        )
        expect(spy.error).toHaveBeenCalledTimes(
          invalidSignatures.length * 4 - 1
        )
        expect(spy.exit).not.toHaveBeenCalled()
      })
    })
    it.todo('incorrect revealAttributes')
    it.todo('incorrect updateCredential')
  })
})
