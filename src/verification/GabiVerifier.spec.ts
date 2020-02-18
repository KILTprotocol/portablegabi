import {
  attestationSetup,
  presentationSetup,
  actorSetup,
} from '../testSetup/testSetup'
import { disclosedAttributes, claim } from '../testSetup/testConfig'
import { VerificationSession, PresentationRequest } from '../types/Verification'
import { ICredential, IProof } from '../testSetup/testTypes'
import GabiVerifier from './GabiVerifier'
import GabiClaimer from '../claim/GabiClaimer'
import { Witness } from '../types/Attestation'
import { Credential, Presentation } from '../types/Claim'
import GabiAttester from '../attestation/GabiAttester'
import Accumulator from '../attestation/Accumulator'

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
  reqUpdatedAfter: Date,
  accumulator: Accumulator,
  reqNonRevocationProof = true
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    reqUpdatedAfter,
    reqNonRevocationProof,
    accumulator,
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
  reqUpdatedAfter: Date,
  accumulator: Accumulator,
  reqNonRevocationProof = true
): Promise<{ verified: boolean; presentationClaim: any }> {
  const { verified, claim: presentationClaim } = await presentationSetup({
    claimer,
    attester,
    credential,
    requestedAttributes,
    reqUpdatedAfter,
    reqNonRevocationProof,
    accumulator,
  })
  expectSuccess(verified, presentationClaim)
  return { verified, presentationClaim }
}

function expectProofsNotToRevealData(proofA: IProof, proofB: IProof): boolean {
  let checkValues: any[]
  // proof.A
  expect(proofA.proof.A).not.toStrictEqual(proofB.proof.A)
  // proof.a_discloses
  expect(proofA.proof.a_disclosed).toStrictEqual(proofB.proof.a_disclosed)
  // proof.a_responses
  checkValues = Object.values(proofB.proof.a_responses)
  Object.values(proofA.proof.a_responses).map(val =>
    expect(checkValues).not.toContain(val)
  )
  // proof.c
  expect(proofA.proof.c).not.toStrictEqual(proofB.proof.c)
  // proof.e_response
  expect(proofA.proof.e_response).not.toStrictEqual(proofB.proof.e_response)
  // proof.nonrev_proof
  expect(proofA.proof.nonrev_proof.C_r).not.toStrictEqual(
    proofB.proof.nonrev_proof.C_r
  )
  expect(proofA.proof.nonrev_proof.C_u).not.toStrictEqual(
    proofB.proof.nonrev_proof.C_u
  )
  // proof.nonrev_proof.responses
  checkValues = Object.values(proofB.proof.nonrev_proof.responses)
  Object.values(proofA.proof.nonrev_proof.responses).map(val =>
    expect(checkValues).not.toContain(val)
  )
  // sacc = signed accumulator, i.e. this should equal
  expect(proofA.proof.nonrev_proof.sacc).toStrictEqual(
    proofB.proof.nonrev_proof.sacc
  )
  // proof.nonrev_response
  expect(proofA.proof.nonrev_response).not.toStrictEqual(
    proofB.proof.nonrev_response
  )
  // proof.v_response
  expect(proofA.proof.v_response).not.toStrictEqual(proofB.proof.v_response)
  return true
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
  let revocationIndex: number
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
      accumulator,
    }))
    revocationIndex = await accumulator.getRevIndex(gabiAttester.publicKey)
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
        new Date(),
        accumulator
      )
    })
    it('Verifies current accumulator index is 0 for imported gabiAttester', async () => {
      expect(revocationIndex).toBe(0)
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
        attesterPubKey: gabiAttester.publicKey,
        accumulator,
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        uCred,
        disclosedAttributes,
        new Date(),
        accumulator
      )
    })
    it('Should reveal claimers information when multiple verifiers send same challenge', async () => {
      // verifier #2 sends same challenge (i.e. presentationRequest) as verifier #1
      const {
        session: vSessionFakedReq,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqUpdatedAfter: new Date(),
      })
      const presFakedReq = await gabiClaimer.buildPresentation({
        credential,
        attesterPubKey: gabiAttester.publicKey,
        presentationReq,
      })
      expect(presentation).not.toStrictEqual(presFakedReq)
      expect(
        expectProofsNotToRevealData(
          JSON.parse(presentation.valueOf()),
          JSON.parse(presFakedReq.valueOf())
        )
      ).toBe(true)
      const {
        verified: verifiedFakedReq,
        claim: claimFakedReq,
      } = await GabiVerifier.verifyPresentation({
        proof: presFakedReq,
        verifierSession: vSessionFakedReq,
        attesterPubKey: gabiAttester.publicKey,
        latestAccumulator: accumulator,
      })
      expectFailure(verifiedFakedReq, claimFakedReq)
    })
    it('Should not reveal any personal information when contacting multiple verifiers', async () => {
      // create 2nd session
      const {
        message: presentationReq2,
        session: verifierSession2,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqUpdatedAfter: new Date(),
      })
      const proof2 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq2,
        attesterPubKey: gabiAttester.publicKey,
      })
      expect(proof2).toBeDefined()
      // create 3rd session
      const {
        message: presentationReq3,
        session: verifierSession3,
      } = await GabiVerifier.requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqUpdatedAfter: new Date(),
      })
      const proof3 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq3,
        attesterPubKey: gabiAttester.publicKey,
      })
      expect(proof3).toBeDefined()
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: proof2,
        verifierSession: verifierSession2,
        attesterPubKey: gabiAttester.publicKey,
        latestAccumulator: accumulator,
      })
      expectSuccess(verified2, verifiedClaim2)
      const {
        claim: verifiedClaim3,
        verified: verified3,
      } = await GabiVerifier.verifyPresentation({
        proof: proof3,
        verifierSession: verifierSession3,
        attesterPubKey: gabiAttester.publicKey,
        latestAccumulator: accumulator,
      })
      expectSuccess(verified3, verifiedClaim3)

      // pairwise comparison
      const proofArr: IProof[] = [presentation, proof2, proof3].map(proof =>
        JSON.parse(proof.valueOf())
      )
      // start to compare prev = proofArr[2] with curr = proofArr[0], then set prev[i+1] to curr[i] and curr[i+1] to proofArr[i+1]
      proofArr.reduce((prevProof, currProof) => {
        expect(expectProofsNotToRevealData(prevProof, currProof)).toBe(true)
        return currProof
      }, proofArr[proofArr.length - 1])
    })
    it('Should verify even after revocation when reqMinIndex is too old (i.e. small)', async () => {
      // revoke variable credential
      await gabiAttester.revokeAttestation({
        accumulator,
        witnesses: [witness],
      })
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        new Date(),
        accumulator
      )
      // expect failure for current index
      // TODO: new test?
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
      const accAfterRev = await gabiAttester.revokeAttestation({
        accumulator,
        witnesses: [witnessRev],
      })
      const newIndex = await accAfterRev.getRevIndex(gabiAttester.publicKey)
      expect(newIndex).toBe(revocationIndex + 1)
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credToBeRevoked,
        disclosedAttributes,
        new Date(),
        accAfterRev
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevoked,
        disclosedAttributes,
        new Date(),
        accumulator
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
        new Date(),
        accAfterRev
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedBuilt,
        disclosedAttributes,
        new Date(),
        accumulator
      )
      // test for update
      const credToBeRevokedUpdated = await gabiClaimer.updateCredential({
        credential: credToBeRevokedBuilt,
        attesterPubKey: gabiAttester.publicKey,
        accumulator,
      })
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedUpdated,
        disclosedAttributes,
        new Date(),
        accAfterRev
      )
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credToBeRevokedUpdated,
        disclosedAttributes,
        new Date(),
        accumulator
      )
    })
    it('Should verify even after revocation when reqNonRevocationProof === false', async () => {
      const newAcc = await gabiAttester.revokeAttestation({
        accumulator,
        witnesses: [witness],
      })
      // expect success with reqNonRevocationProof === true
      await expectVerificationSucceeded(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        new Date(),
        accumulator,
        false
      )
      // expect failure with reqNonRevocationProof === true
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        credential,
        disclosedAttributes,
        new Date(),
        newAcc,
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
          accumulator,
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
        attesterPubKey: gabiAttester.publicKey,
        accumulator,
      })
      await expectVerificationFailed(
        gabiClaimer,
        gabiAttester,
        uCred,
        disclosedAttributes,
        new Date(),
        accumulator
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
        attesterPubKey: gabiAttester.publicKey,
        accumulator,
      })
      await expect(
        expectVerificationFailed(
          gabiClaimer,
          gabiAttester,
          uCred,
          disclosedAttributes,
          new Date(),
          accumulator
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
        reqUpdatedAfter: new Date(),
      })
      const proof2 = await gabiClaimer.buildPresentation({
        credential,
        presentationReq: presentationReq2, // from 2nd session
        attesterPubKey: gabiAttester.publicKey,
      })
      expect(proof2).toBeDefined()
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: proof2, // from 2nd session
        verifierSession, // from 1st session
        attesterPubKey: gabiAttester.publicKey,
        latestAccumulator: accumulator,
      })
      expectFailure(verified2, verifiedClaim2)
      const {
        claim: verifiedClaim3,
        verified: verified3,
      } = await GabiVerifier.verifyPresentation({
        proof: presentation, // from 1st session
        verifierSession: verifierSession2, // from 2nd session
        attesterPubKey: gabiAttester.publicKey,
        latestAccumulator: accumulator,
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
          accumulator,
        })
      ).rejects.toThrow('ecdsa signature was invalid')
      // use use gabiAttester2's pk instead of gabiAttester's one
      const {
        claim: verifiedClaim2,
        verified: verified2,
      } = await GabiVerifier.verifyPresentation({
        proof: presentation,
        verifierSession,
        attesterPubKey: gabiAttester2.publicKey,
        latestAccumulator: accumulator,
      })
      expectFailure(verified2, verifiedClaim2)
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
          accumulator,
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
        new Date(),
        accumulator
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
        new Date(),
        accumulator
      )
    })
  })
})
