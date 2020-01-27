import {
  attestationSetup,
  presentationSetup,
  actorSetup,
} from '../testSetup/testSetup'
import { disclosedAttributes, claim } from '../testSetup/testConfig'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { VerificationSession, PresentationRequest } from '../types/Verification'
import { ICredential, IProof } from '../testSetup/testTypes'
import GabiVerifier from './GabiVerifier'
import GabiClaimer from '../claim/GabiClaimer'
import { Accumulator, Witness } from '../types/Attestation'
import { Credential, Presentation } from '../types/Claim'
import GabiAttester from '../attestation/GabiAttester'

afterAll(async () => {
  await goWasmClose()
})

function expectFailure(verified: boolean, presentationClaim: any): void {
  expect(presentationClaim).toBeNull()
  expect(verified).toBe(false)
}
async function expectVerificationFailed(
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: Credential,
  requestedAttributes: string[],
  index: number
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    minIndex: index,
  })
  expect(presentationClaim).toBeNull()
  expect(verified).toBe(false)
  return { verified, presentationClaim }
}

function expectSuccess(verified: boolean, presentationClaim: any): void {
  expect(presentationClaim).toEqual(expect.anything())
  expect(verified).toBe(true)
}

async function expectVerificationSucceeded(
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: Credential,
  requestedAttributes: string[],
  index: number
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    minIndex: index,
  })
  expect(presentationClaim).toEqual(expect.anything())
  expect(verified).toBe(true)
  return { verified, presentationClaim }
}

describe('Test verifier functionality', () => {
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let gabiAttester2: GabiAttester
  let update: Accumulator
  let witness: Witness
  let credential: Credential
  let verifierSession: VerificationSession
  let presentationReq: PresentationRequest
  let presentation: Presentation
  let presentedClaim: any
  let verified: boolean
  beforeAll(async () => {
    ;({
      claimers: [gabiClaimer],
      attesters: [gabiAttester, gabiAttester2],
      accumulators: [update],
    } = await actorSetup())
    ;({ credential, witness } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      update,
    }))
    ;({
      verifierSession,
      presentationReq,
      presentation,
      verified,
      claim: presentedClaim,
    } = await presentationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      credential,
    }))
  }, 10000)
  describe('Checks valid data', () => {
    it('Checks valid startVerficiationSession', async () => {
      expect(verifierSession).toBeDefined()
      expect(presentationReq).toBeDefined()

      const verObj = JSON.parse(verifierSession.valueOf())
      const presObj = JSON.parse(presentationReq.valueOf())
      expect(verObj.context).toStrictEqual(presObj.context)
      expect(verObj.nonce).toStrictEqual(presObj.nonce)
      expect(
        presObj.partialPresentationRequest.requestedAttributes
      ).toStrictEqual(disclosedAttributes)
      expect(verObj.reqNonRevocationProof).toEqual(
        presObj.partialPresentationRequest.reqNonRevocationProof
      )
      expect(verObj.reqMinIndex).toEqual(
        presObj.partialPresentationRequest.reqMinIndex
      )
    })
    it('Checks valid verifyPresentation', () => {
      expectSuccess(verified, presentedClaim)
      expect(presentedClaim).not.toStrictEqual(claim)
      expect(presentedClaim).toHaveProperty('contents', {
        id: claim.contents.id,
        picture: { DATA: claim.contents.picture.DATA },
        eyeColor: claim.contents.eyeColor,
      })
    })
    it('Verifies presentationSetup works as intended', async () => {
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        1
      )
    })
    it('Verifies current accumulator index is 1 for imported gabiAttester', async () => {
      // show current index is 1 by expecting success for index === 1
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        1
      )
      // but failure for index === 2
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2
      )
    })
    // this is intended to work since the original claim data is already hidden inside the credential
    it('Should still verify after tampering with claim data (post-attestation)', async () => {
      const tamperedCredential: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      tamperedCredential.claim.contents.id = 0
      tamperedCredential.claim.contents.eyeColor = false
      tamperedCredential.claim.contents.picture = {
        URL: 'undefined',
        DATA: 'undefined',
      }
      const uCred = await gabiClaimer.updateCredential({
        credential: new Credential(JSON.stringify(tamperedCredential)),
        attesterPubKey: gabiAttester.getPubKey(),
        update,
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        uCred,
        disclosedAttributes,
        1
      )
    })
    it('Should not reveal any personal information when contacting multiple verifiers', async () => {
      // create 2nd session
      const {
        message: presentationReq2,
        session: verifierSession2,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        requestNonRevocationProof: true,
        minIndex: 1,
      })
      const proof2 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq2,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(proof2).toBeDefined()
      // create 3rd session
      const {
        message: presentationReq3,
        session: verifierSession3,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        requestNonRevocationProof: true,
        minIndex: 1,
      })
      const proof3 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq3,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(proof3).toBeDefined()
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: proof2,
        verifierSession: verifierSession2,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expectSuccess(verified2, verifiedClaim2)
      const {
        claim: verifiedClaim3,
        verified: verified3,
      } = await GabiVerifier.verifyPresentation({
        proof: proof3,
        verifierSession: verifierSession3,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expectSuccess(verified3, verifiedClaim3)

      // pairwise comparison
      let checkValues: any[]
      const proofArr: IProof[] = [presentation, proof2, proof3].map(proof =>
        JSON.parse(proof.valueOf())
      )
      // start to compare prev = proofArr[2] with curr = proofArr[0], then set prev[i+1] to curr[i] and curr[i+1] to proofArr[i+1]
      proofArr.reduce((prevProof, currProof) => {
        // proof.A
        expect(currProof.proof.A).not.toStrictEqual(prevProof.proof.A)
        // proof.a_discloses
        expect(currProof.proof.a_disclosed).toStrictEqual(
          prevProof.proof.a_disclosed
        )
        // proof.a_responses
        checkValues = Object.values(prevProof.proof.a_responses)
        Object.values(currProof.proof.a_responses).map(val =>
          expect(checkValues).not.toContain(val)
        )
        // proof.c
        expect(currProof.proof.c).not.toStrictEqual(prevProof.proof.c)
        // proof.e_response
        expect(currProof.proof.e_response).not.toStrictEqual(
          prevProof.proof.e_response
        )
        // proof.nonrev_proof
        expect(currProof.proof.nonrev_proof.C_r).not.toStrictEqual(
          prevProof.proof.nonrev_proof.C_r
        )
        expect(currProof.proof.nonrev_proof.C_u).not.toStrictEqual(
          prevProof.proof.nonrev_proof.C_u
        )
        // proof.nonrev_proof.responses
        checkValues = Object.values(prevProof.proof.nonrev_proof.responses)
        Object.values(currProof.proof.nonrev_proof.responses).map(val =>
          expect(checkValues).not.toContain(val)
        )
        // sacc = signed accumulator, i.e. this should equal
        expect(currProof.proof.nonrev_proof.sacc).toStrictEqual(
          prevProof.proof.nonrev_proof.sacc
        )
        // proof.nonrev_response
        expect(currProof.proof.nonrev_response).not.toStrictEqual(
          prevProof.proof.nonrev_response
        )
        // proof.v_response
        expect(currProof.proof.v_response).not.toStrictEqual(
          prevProof.proof.v_response
        )
        return currProof
      }, proofArr[proofArr.length - 1])
    })
    it('Should not increase accumulator index after updating credential (no pre-revocation)', async () => {
      const revCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        update,
      })
      expect(revCred).toBeDefined()
      expect(revCred.valueOf()).not.toBe(credential.valueOf())
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        revCred,
        disclosedAttributes,
        2
      )
    })
    it("Should increase attester's accumulator index (post-revocation)", async () => {
      // index === 1 due to test 'Verifies current accumulator index is 1 for imported gabiAttester'
      // attester attests new credential
      const { credential: cred2, witness: witness2 } = await attestationSetup({
        claimer: gabiClaimer,
        attester: gabiAttester,
        update,
      })
      // attester revokes credential to increase accumulator index
      const revUpdate = new Accumulator(
        await gabiAttester.revokeAttestation({
          update,
          witness: witness2,
        })
      )
      expect(cred2).toBeDefined()
      expect(revUpdate).toBeDefined()
      expect(revUpdate).not.toBeNull()

      const revCred = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        update: revUpdate,
      })
      expect(revCred).toBeDefined()
      expect(revCred.valueOf()).not.toBe(credential.valueOf())
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        revCred,
        disclosedAttributes,
        2
      )
    })
    it('Should verify even after revocation when minIndex is too old (i.e. small)', async () => {
      await gabiAttester.revokeAttestation({
        update,
        witness,
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        1
      )
      // expect fail for current index
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2
      )
    })
  })
  describe('Checks invalid/tampered data', () => {
    it('Should throw on empty requested/disclosed attributes array', async () => {
      await expect(
        presentationSetup({
          claimer: gabiClaimer,
          attester: gabiAttester,
          credential,
          requestedAttributes: [],
          minIndex: 0,
        })
      ).rejects.toThrow('requested attributes should not be empty')
    })
    it('Should not verify after tampering with attributes data (post-attestation)', async () => {
      const tamperedCredential: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      // change first attribute to base64 encoding of 'I have been changed'
      tamperedCredential.credential.attributes[0] =
        'SSBoYXZlIGJlZW4gY2hhbmdlZA=='

      const uCred = await gabiClaimer.updateCredential({
        credential: new Credential(JSON.stringify(tamperedCredential)),
        attesterPubKey: gabiAttester.getPubKey(),
        update,
      })
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        uCred,
        disclosedAttributes,
        1
      )
    })
    it('Should not verify after re-arrenging attributes of credential', async () => {
      const tamperedCredential: ICredential<typeof claim> = JSON.parse(
          credential.valueOf()
        )
        // swap first two elements
      ;[
        tamperedCredential.credential.attributes[0],
        tamperedCredential.credential.attributes[1],
      ] = [
        tamperedCredential.credential.attributes[1],
        tamperedCredential.credential.attributes[0],
      ]

      const uCred = await gabiClaimer.updateCredential({
        credential: new Credential(JSON.stringify(tamperedCredential)),
        attesterPubKey: gabiAttester.getPubKey(),
        update,
      })
      await expect(
        expectVerificationFailed(
          gabiClaimer,
          gabiAttester,
          uCred,
          disclosedAttributes,
          1
        )
      ).rejects.toThrow('missing magic byte')
    })
    it('Should not verify with mixed requestPresentation sessions', async () => {
      // create 2nd session
      const {
        message: presentationReq2,
        session: verifierSession2,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        requestNonRevocationProof: true,
        minIndex: 1,
      })
      const proof2 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq2, // from 2nd session
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expect(proof2).toBeDefined()
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: proof2, // from 2nd session
        verifierSession, // from 1st session
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expectFailure(verified2, verifiedClaim2)
      const {
        claim: verifiedClaim3,
        verified: verified3,
      } = await GabiVerifier.verifyPresentation({
        proof: presentation, // from 1st session
        verifierSession: verifierSession2, // from 2nd session
        attesterPubKey: gabiAttester.getPubKey(),
      })
      expectFailure(verified3, verifiedClaim3)
    })
    it('Should not verify when using incorrect attester key', async () => {
      // use gabiAttester2.getPubKey in buildPresentation + verifyPresentation
      await expect(
        presentationSetup({
          claimer: gabiClaimer,
          attester: gabiAttester2,
          credential,
          requestedAttributes: disclosedAttributes,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
      // use gabiAttester2.getPubKey in verifyPresentation
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: presentation,
        verifierSession,
        attesterPubKey: gabiAttester2.getPubKey(),
      })
      expectFailure(verified2, verifiedClaim2)
    })
    it('Should not verify when sending index out of accumulator range', async () => {
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2 // newest accumulator has index 1
      )
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        -1 // should be non negative
      )
    })
    it('Should throw when a requested attribute is missing', async () => {
      const addedAttribute = 'thisDoesNotExit'
      const requestedAttributes = [...disclosedAttributes, addedAttribute]
      await expect(
        presentationSetup({
          claimer: gabiClaimer,
          attester: gabiAttester,
          credential,
          requestedAttributes,
        })
      ).rejects.toThrow(
        `could not find attribute with name '${addedAttribute}'`
      )
    })
    it('Should not affect the credential when tampering data post-attestation pre-verification', async () => {
      const credObj: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      const credObj2: ICredential<typeof claim> = JSON.parse(
        credential.valueOf()
      )
      ;[
        credObj.claim.contents.picture.DATA,
        credObj.claim.contents.picture.URL,
      ] = [
        credObj.claim.contents.picture.URL,
        credObj.claim.contents.picture.DATA,
      ]
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        new Credential(JSON.stringify(credObj)),
        disclosedAttributes,
        1
      )
      credObj2.claim = {
        anythingButCtype: credObj.claim.contents,
        contents: {
          anythingButId: credObj.claim.contents.id,
          picture: {
            DATA: credObj.claim.contents.picture.URL,
            URL: credObj.claim.contents.picture.DATA,
          },
          anythingButEyeColor: credObj.claim.contents.eyeColor,
        },
      } as any
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        new Credential(JSON.stringify(credObj2)),
        disclosedAttributes,
        1
      )
    })
  })
})
