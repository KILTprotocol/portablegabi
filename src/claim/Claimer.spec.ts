import { mnemonicGenerate } from '@polkadot/util-crypto'
import {
  attestationSetup,
  mixedAttestationsSetup,
  presentationSetup,
  actorSetup,
} from '../testSetup/testSetup'
import Claimer from './Claimer'
import Attester from '../attestation/Attester'
import { claim } from '../testSetup/testConfig'
import { Spy } from '../testSetup/testTypes'
import {
  Attestation,
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Witness,
  IIssueAttestation,
} from '../types/Attestation'
import {
  ClaimerAttestationSession,
  AttestationRequest,
  Presentation,
  ClaimError,
  ICredential,
  IProof,
} from '../types/Claim'
import Accumulator from '../attestation/Accumulator'
import Credential from './Credential'

async function buildCredentialError(
  claimer: Claimer,
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

describe('Test claimer creation', () => {
  let claimer: Claimer
  beforeEach(async () => {
    claimer = await Claimer.create()
  })
  it('Builds claimer from scratch', async () => {
    const claimerWithoutPass = await Claimer.create()
    expect(claimerWithoutPass).toHaveProperty('secret')
    expect(claimer).toHaveProperty('secret')
    expect(claimerWithoutPass).not.toStrictEqual(claimer)
    const claimerWithPass = await Claimer.buildFromMnemonic(
      mnemonicGenerate(),
      {
        password: 'password',
      }
    )
    expect(claimerWithPass).toHaveProperty('secret')
    expect(claimer).toHaveProperty('secret')
    expect(claimerWithPass).not.toStrictEqual(claimer)
    expect(claimerWithPass).not.toStrictEqual(claimerWithoutPass)
  })
  it('Builds claimer from empty mnemonic seed', async () => {
    await expect(Claimer.buildFromMnemonic('')).rejects.toThrow(
      'Invalid mnemonic'
    )
  })
  it('Builds claimer from non-empty mnemonic seed', async () => {
    const claimerWithoutPass = await Claimer.buildFromMnemonic(
      'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken'
    )
    expect(claimerWithoutPass).toHaveProperty(
      'secret',
      '{"MasterSecret":"9o2iTwz6wx0FtPJ7BqQCVrF/vvVxX0GFr5kPBQ6R9XM="}'
    )
    expect(claimerWithoutPass).not.toStrictEqual(claimer)
    const claimerWithPass = await Claimer.buildFromMnemonic(
      'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken',
      { password: 'password' }
    )
    expect(claimerWithPass).toHaveProperty(
      'secret',
      '{"MasterSecret":"2VhYuA7pIoHpPFzzerBUULPDRjT2vqthdNIhlByFcgg="}'
    )
    expect(claimerWithPass).not.toStrictEqual(claimer)
    expect(claimerWithPass).not.toStrictEqual(claimerWithoutPass)
  })
})

describe('Test claimer functionality', () => {
  let spy: Spy<'log'>
  let claimer: Claimer
  let attester: Attester
  let accumulator: Accumulator
  let initiateAttestationReq: InitiateAttestationRequest
  let attesterSession: AttesterAttestationSession
  let claimerSession: ClaimerAttestationSession
  let attestationRequest: AttestationRequest
  let attestation: Attestation
  let credential: Credential
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
  let presentation: Presentation

  // get data from testSetup
  beforeAll(async () => {
    ;({
      claimers: [claimer],
      attesters: [attester],
      accumulators: [accumulator],
    } = await actorSetup())
    ;({
      initiateAttestationReq,
      attesterSession,
      claimerSession,
      attestationRequest,
      attestation,
      credential,
    } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    }))
    credential = await claimer.buildCredential({
      claimerSession,
      attestation,
    })
    ;({ presentation } = await presentationSetup({
      claimer,
      attester,
      credential,
      accumulator,
    }))
    ;({
      attestation2,
      claimerSession2,
      mixedAttestationsValid,
      claimerSessionE12,
      claimerSessionE21,
    } = await mixedAttestationsSetup({
      claimer,
      attester,
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
      const request = await claimer.requestAttestation({
        startAttestationMsg: initiateAttestationReq,
        claim,
        attesterPubKey: attester.publicKey,
      })
      expect(request).toBeDefined()
      expect(typeof request).toBe('object')
      expect(Object.keys(request)).toContain('session')
      expect(Object.keys(request)).toContain('message')
    })
    it('Checks for correct data in requestAttestation', async () => {
      expect(initiateAttestationReq).toBeDefined()
      expect(attesterSession).toBeDefined()
      expect(attestationRequest).toBeDefined()
      expect(claimerSession).toBeDefined()
    })
    it('Should throw when requesting attestation with empty object as claim', async () => {
      await expect(
        claimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: {},
          attesterPubKey: attester.publicKey,
        })
      ).rejects.toThrowError(ClaimError.claimMissing)
    })
    it('Should throw when requesting attestation with non-object as claim', async () => {
      await expect(
        claimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: ('string' as unknown) as object,
          attesterPubKey: attester.publicKey,
        })
      ).rejects.toThrowError(ClaimError.notAnObject('string'))
    })
    it('Should throw when requesting attestation with array as claim', async () => {
      await expect(
        claimer.requestAttestation({
          startAttestationMsg: initiateAttestationReq,
          claim: [1],
          attesterPubKey: attester.publicKey,
        })
      ).rejects.toThrowError(ClaimError.duringParsing)
    })
    it('Should build credential for attester', async () => {
      await expect(
        claimer.buildCredential({
          attestation,
          claimerSession,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should build credential for attester2', async () => {
      await expect(
        claimer.buildCredential({
          attestation: attestation2,
          claimerSession: claimerSession2,
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Checks for correct data in buildCredential', async () => {
      const cred = await claimer.buildCredential({
        claimerSession,
        attestation,
      })
      expect(cred).toBeDefined()
      const credObj: ICredential<typeof claim> = cred.parse()
      expect(credObj).toHaveProperty('claim', claim)
      // compare signatures
      const aSigObj: IIssueAttestation = attestation.parse()
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
      const proofObj: IProof = presentation.parse()
      const sigObj: IIssueAttestation = attestation.parse()
      expect(proofObj.proof.A).not.toEqual(sigObj.signature.A)
      expect(proofObj.proof.e_response).not.toEqual(sigObj.proof.e_response)
      expect(proofObj.proof.c).not.toEqual(sigObj.proof.c)
    })
    it('Should not throw when two claimers interchange credential', async () => {
      // reason: credential is a secret one should not share
      const claimer2 = await Claimer.create()
      const sameCredFromOtherClaimer = await claimer2.buildCredential({
        claimerSession,
        attestation,
      })
      expect(sameCredFromOtherClaimer).toEqual(expect.anything())
      const { credential: diffCredFromOtherClaimer } = await attestationSetup({
        claimer: claimer2,
        attester,
        accumulator,
      })
      expect(diffCredFromOtherClaimer).toEqual(expect.anything())
      await expect(
        diffCredFromOtherClaimer.update({
          attesterPubKey: attester.publicKey,
          accumulators: [accumulator],
        })
      ).resolves.toEqual(expect.anything())
    })
    // run tests on invalid data
    describe('Negative tests', () => {
      it('Should throw in buildCredential for incorrect combination of session and signature', async () => {
        await buildCredentialError(
          claimer,
          attestation, // attester 1
          claimerSession2 // attester 2
        )
        return buildCredentialError(
          claimer,
          attestation2, // attester 2
          claimerSession // attester 1
        )
      })
      it('Should throw for 3 of all 4 possibilties to build a credential from valid mixed attestation', async () => {
        expect(mixedAttestationsValid).toEqual(expect.anything())
        await expect(
          claimer.buildCredential({
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
          throwingSessions.map((session) =>
            buildCredentialError(
              claimer,
              mixedAttestationsValid.issuance.attestation,
              session
            )
          )
        )
      })
    })
  })
})
