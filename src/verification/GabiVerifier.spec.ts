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

// close WASM instance after tests ran
afterAll(() => goWasmClose())

function expectFailure(verified: boolean, presentationClaim: any): void {
  expect(presentationClaim).toBeNull()
  expect(verified).toBe(false)
}
function expectSuccess(verified: boolean, presentationClaim: any): void {
  expect(presentationClaim).toEqual(expect.anything())
  expect(verified).toBe(true)
}

// run presentationSetup and expect the outcome to be verified: false, claim: null
async function expectVerificationFailed(
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: Credential,
  requestedAttributes: string[],
  index: number,
  reqNonRevocationProof = true
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    reqMinIndex: index,
    reqNonRevocationProof,
  })
  expectFailure(verified, presentationClaim)
  return { verified, presentationClaim }
}

// run presentationSetup and expect the outcome to be verified: true, claim is defined
async function expectVerificationSucceeded(
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: Credential,
  requestedAttributes: string[],
  index: number,
  reqNonRevocationProof = true
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    reqMinIndex: index,
    reqNonRevocationProof,
  })
  expectSuccess(verified, presentationClaim)
  return { verified, presentationClaim }
}

describe('Test verifier functionality', () => {
  let gabiClaimer: GabiClaimer
  let gabiAttester: GabiAttester
  let gabiAttester2: GabiAttester
  let accumulator: Accumulator
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
      accumulators: [accumulator],
    } = await actorSetup())
    ;({ credential, witness } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      accumulator,
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
  describe('Positive tests', () => {
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
      expect(verObj.reqreqMinIndex).toEqual(
        presObj.partialPresentationRequest.reqreqMinIndex
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
        accumulator,
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
        reqNonRevocationProof: true,
        reqMinIndex: 1,
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
        reqNonRevocationProof: true,
        reqMinIndex: 1,
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
        accumulator,
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
      const {
        credential: credToBeRevoked,
        witness: witnessToBeRevoked,
      } = await attestationSetup({
        claimer: gabiClaimer,
        attester: gabiAttester,
        accumulator,
      })
      // attester revokes credential to increase accumulator index
      const updateAfterRev = await gabiAttester.revokeAttestation({
        accumulator,
        witness: witnessToBeRevoked,
      })

      expect(credToBeRevoked).toBeDefined()
      expect(updateAfterRev).toBeDefined()
      expect(updateAfterRev).not.toBeNull()

      const credAfterIndexIncrease = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        accumulator: updateAfterRev,
      })
      expect(credAfterIndexIncrease).toBeDefined()
      expect(credAfterIndexIncrease.valueOf()).not.toBe(credential.valueOf())
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credAfterIndexIncrease,
        disclosedAttributes,
        2
      )
    })
    it("Should not increase attester's accumulator index when revoking the same credential again", async () => {
      const {
        credential: credToBeRevoked,
        witness: witnessToBeRevoked,
      } = await attestationSetup({
        claimer: gabiClaimer,
        attester: gabiAttester,
        accumulator,
      })
      expect(credToBeRevoked).toEqual(expect.anything())
      await gabiAttester.revokeAttestation({
        accumulator,
        witness: witnessToBeRevoked,
      })
      const updateAfterRev = await gabiAttester.revokeAttestation({
        accumulator,
        witness: witnessToBeRevoked,
      })

      const credAfterIndexIncrease = await gabiClaimer.updateCredential({
        credential,
        attesterPubKey: gabiAttester.getPubKey(),
        accumulator: updateAfterRev,
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credAfterIndexIncrease,
        disclosedAttributes,
        2
      )
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credAfterIndexIncrease,
        disclosedAttributes,
        3
      )
    })
    it('Should verify even after revocation when reqMinIndex is too old (i.e. small)', async () => {
      // revoke variable credential
      await gabiAttester.revokeAttestation({
        accumulator,
        witness,
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        1
      )
      // expect failure for current index
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2
      )
    })
    it('Should not verify when sending credential created with too old index', async () => {
      const {
        credential: credToBeRevoked,
        attestation: attestationRev,
        claimerSession: claimerSessionRev,
        witness: witnessRev,
      } = await attestationSetup({
        claimer: gabiClaimer,
        attester: gabiAttester,
        accumulator,
      })
      await gabiAttester.revokeAttestation({ accumulator, witness: witnessRev })
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credToBeRevoked,
        disclosedAttributes,
        2
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevoked,
        disclosedAttributes,
        1
      )
      // test for build
      const credToBeRevokedBuilt = await gabiClaimer.buildCredential({
        claimerSession: claimerSessionRev,
        attestation: attestationRev,
      })

      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedBuilt,
        disclosedAttributes,
        2
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedBuilt,
        disclosedAttributes,
        1
      )
      // test for update
      const credToBeRevokedUpdated = await gabiClaimer.updateCredential({
        credential: credToBeRevokedBuilt,
        attesterPubKey: gabiAttester.getPubKey(),
        accumulator,
      })
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedUpdated,
        disclosedAttributes,
        2
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedUpdated,
        disclosedAttributes,
        1
      )
    })
    it('Should verify even after revocation when reqNonRevocationProof === false', async () => {
      await gabiAttester.revokeAttestation({
        accumulator,
        witness,
      })
      // expect success with reqNonRevocationProof === true
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2,
        false
      )
      // expect failure with reqNonRevocationProof === true
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        2,
        true
      )
    })
  })
  describe('Negative tests', () => {
    it('Should throw on empty requested/disclosed attributes array', async () => {
      await expect(
        presentationSetup({
          claimer: gabiClaimer,
          attester: gabiAttester,
          credential,
          requestedAttributes: [],
          reqMinIndex: 0,
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
        accumulator,
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
        accumulator,
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
        reqNonRevocationProof: true,
        reqMinIndex: 1,
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
      // use gabiAttester2's pk instead of gabiAttester's one in buildPresentation + verifyPresentation
      await expect(
        presentationSetup({
          claimer: gabiClaimer,
          attester: gabiAttester2,
          credential,
          requestedAttributes: disclosedAttributes,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
      // use use gabiAttester2's pk instead of gabiAttester's one
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
  it.todo('requestCombinedPresentation')
})
