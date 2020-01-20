import GabiClaimer from './GabiClaimer'
import runTestSetup, { verifySetup } from '../testSetup/testSetup'
import GabiAttester from '../attestation/GabiAttester'
import { IGabiContextNonce } from '../types/Attestation'
import {
  claim,
  numOfClaimKeys,
  disclosedAttributes,
} from '../testSetup/testConfig'
import {
  IClaimerSignSession,
  ICredential,
  AttesterSignSession,
  IIssueAttestation,
  ReqSignMsg,
  Spy,
  IProof,
} from '../testSetup/testTypes'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { IGabiReqAttrMsg } from '../types/Verification'
import GabiVerifier from '../verification/GabiVerifier'
// import { IGabiReqAttrMsg } from '../types/Verification'

function buildCredentialError(credential: string, spy: Spy<'log'>): void {
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
  let spy: Spy<'log'>
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let gabiAttester2: GabiAttester
  let startAttestationMsg: IGabiContextNonce
  let attesterSignSession: AttesterSignSession
  let reqSignMsg: ReqSignMsg
  let aSignature: string
  let witness: string
  let update: string
  let update2: string
  let claimerSignSession: IClaimerSignSession
  let claimerSignSession2: IClaimerSignSession
  let claimerSignSessionE12: IClaimerSignSession
  let claimerSignSessionE21: IClaimerSignSession
  let invalidSignatures: string[]
  let aSignature2: string
  let credential: string
  let proof: string
  let reqRevealedAttrMsg: IGabiReqAttrMsg
  let verifierSession: IGabiContextNonce
  // let verifiedClaim: string
  // let verified: boolean

  // get data from runTestSetup
  beforeAll(async () => {
    ;({
      gabiClaimer,
      gabiAttester,
      gabiAttester2,
      startAttestationMsg,
      attesterSignSession,
      reqSignMsg,
      claimerSignSession,
      claimerSignSession2,
      claimerSignSessionE12,
      claimerSignSessionE21,
      aSignature,
      witness,
      update,
      update2,
      aSignature2,
      invalidSignatures,
      credential,
      proof,
      reqRevealedAttrMsg,
      verifierSession,
      // verifiedClaim,
      // verified,
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
      expect(Object.keys(request)).toStrictEqual(['message', 'session'])
    })
    it('Checks for correct data in requestAttestion', async () => {
      expect(startAttestationMsg).toBeDefined()
      expect(attesterSignSession).toBeDefined()
      expect(reqSignMsg).toBeDefined()
      expect(claimerSignSession).toBeDefined()
      // check context
      expect(claimerSignSession.cb.Context).toStrictEqual(
        startAttestationMsg.context
      )
      expect(claimerSignSession.cb.Context).toStrictEqual(
        attesterSignSession.context
      )
      // values
      expect(reqSignMsg.values).toContain(claimerSignSession.cb.UCommit)
    })
    it('Should build credential for gabiAttester', async () => {
      expect(credential).toBeDefined()
      expect(spy.error).not.toHaveBeenCalled()
      expect(spy.exit).not.toHaveBeenCalled()
    })
    it('Should build cred for gabiAttester2', async () => {
      const cred = await gabiClaimer.buildCredential({
        signature: aSignature2,
        claimerSignSession: claimerSignSession2,
      })
      expect(cred).toBeDefined()
      expect(spy.error).not.toHaveBeenCalled()
      expect(spy.exit).not.toHaveBeenCalled()
    })
    it('Checks for correct data in buildCredential', async () => {
      const cred = await gabiClaimer.buildCredential({
        claimerSignSession,
        signature: aSignature,
      })
      expect(cred).toBeDefined()
      const credObj: ICredential<typeof claim> = JSON.parse(cred)
      expect(credObj).toHaveProperty('claim', claim)
      expect(
        new Date(credObj.credential.nonrevWitness.Updated).getTime()
      ).toBeLessThan(0)
      // compare signatures
      const aSigObj: IIssueAttestation = JSON.parse(aSignature)
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
      reqSignMsg.values.map(val =>
        expect(credObj.credential.attributes).toContain(val)
      )
    })
    it('Checks for correct data in revealAttributes', () => {
      expect(proof).toBeDefined()
      const proofObj: IProof = JSON.parse(proof)
      const sigObj: IIssueAttestation = JSON.parse(aSignature)
      expect(proofObj.attributes).toHaveLength(numOfClaimKeys)
      // TODO: verify this
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
      const credObj: ICredential<typeof claim> = JSON.parse(credential)
      const cred2Obj: ICredential<typeof claim> = JSON.parse(updatedCred)
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
    it('Revokes credential and checks for empty updateCredential', async () => {
      await verifySetup(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        1
      )
      const revUpdate = await gabiAttester.revokeAttestation({
        update,
        witness,
      })
      expect(revUpdate).toBeDefined()
      console.log(revUpdate)
      const updatedCredential = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        update: revUpdate,
      })
      expect(updatedCredential).toBeUndefined()
      const {
        verified: revVerified,
        verifiedClaim: revVerifiedClaim,
      } = await verifySetup(
        gabiClaimer,
        gabiAttester,
        updatedCredential,
        disclosedAttributes,
        1
      )
      expect(revVerified).toBeFalsy()
      expect(revVerifiedClaim).toBeUndefined()
    })
  })

  // run tests on invalid data
  describe('Checks invalid data', () => {
    it('Should throw for signature from wrong attester (gabiAttester)', async () => {
      const cred = await gabiClaimer.buildCredential({
        signature: aSignature,
        claimerSignSession: claimerSignSession2,
      })
      buildCredentialError(cred, spy)
    })
    it('Should throw for signature from wrong attester (gabiAttester2)', async () => {
      const cred = await gabiClaimer.buildCredential({
        signature: aSignature2,
        claimerSignSession,
      })
      buildCredentialError(cred, spy)
    })
    it('Should throw on all invalid signatures', async () => {
      return Promise.all(
        invalidSignatures.map(async signature => {
          return [
            await gabiClaimer.buildCredential({
              signature,
              claimerSignSession,
            }),
            await gabiClaimer.buildCredential({
              signature,
              claimerSignSession: claimerSignSessionE12,
            }),
            await gabiClaimer.buildCredential({
              signature,
              claimerSignSession: claimerSignSessionE21,
            }),
            await gabiClaimer.buildCredential({
              signature,
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
    it('Should throw on updateCredential with pubkey from different attester', async () => {
      const updatedCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester2.getPubKey(),
        update,
      })
      expect(updatedCred).toBeUndefined()
      expect(spy.error).toHaveBeenCalledTimes(1)
      expect(spy.error).toHaveBeenCalledWith('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with update from different attester', async () => {
      const updatedCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        update: update2,
      })
      expect(updatedCred).toBeUndefined()
      expect(spy.error).toHaveBeenCalledTimes(1)
      expect(spy.error).toHaveBeenCalledWith('ecdsa signature was invalid')
    })
    it('Should throw on updateCredential with update + pubkey from different attester', async () => {
      const updatedCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester2.getPubKey(),
        update: update2,
      })
      expect(updatedCred).toBeUndefined()
      expect(spy.error).toHaveBeenCalledTimes(1)
      expect(spy.error).toHaveBeenCalledWith('ecdsa signature was invalid')
    })
    it('Should throw on revealAttributes with pubkey from different attester', async () => {
      const proof2 = await gabiClaimer.revealAttributes({
        credential,
        reqRevealedAttrMsg,
        attesterPubKey: gabiAttester2.getPubKey(), // should be gabiAttester to be valid
      })
      expect(proof2).toBeUndefined()
      expect(spy.error).toHaveBeenCalledTimes(1)
      expect(spy.error).toHaveBeenCalledWith('ecdsa signature was invalid')
    })
    it('Should throw on verifyAttributes with mixed startVerificationSessions', async () => {
      // session 2
      const {
        message: reqRevealedAttrMsg2,
      } = await GabiVerifier.startVerificationSession({
        requestNonRevocationProof: true,
        disclosedAttributes,
        minIndex: 0,
      })
      const proof2 = await gabiClaimer.revealAttributes({
        credential,
        reqRevealedAttrMsg: reqRevealedAttrMsg2, // from 2nd session
        attesterPubKey: gabiAttester.getPubKey(),
      })
      const {
        claim: verifiedClaim,
        verified,
      } = await GabiVerifier.verifyAttributes({
        proof: proof2, // from 2nd session
        verifierSession, // from 1st session
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(proof2).toBeDefined()
      expect(verified).toBeTruthy() // FIXME: Remove after fix
      expect(verifiedClaim).toBeNull() // FIXME: Remove after fix
      // expect(verified).toBeFalsy() // FIXME: Should hold true @weichweich
      // expect(spy.error).toHaveBeenCalledTimes(1) // FIXME: Should hold true
      // expect(spy.error).toHaveBeenCalledWith('ecdsa signature was invalid') // FIXME: Should hold true
    })
    it('')
  })
})
