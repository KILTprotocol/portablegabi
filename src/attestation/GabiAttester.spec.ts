import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import GabiAttester from './GabiAttester'
import { privKey, pubKey, claim } from '../testSetup/testConfig'
import {
  attestationSetup,
  mixedAttestationsSetup,
  actorSetup,
} from '../testSetup/testSetup'
import {
  InitiateAttestationRequest,
  AttesterAttestationSession,
  Attestation,
  Witness,
} from '../types/Attestation'
import GabiClaimer from '../claim/GabiClaimer'
import { AttestationRequest, ClaimError } from '../types/Claim'
import Accumulator from './Accumulator'

// close WASM instance after tests ran
afterAll(() => goWasmClose())

describe('Test attester', () => {
  let gabiAttester: GabiAttester
  let gabiClaimer: GabiClaimer
  let accumulator: Accumulator
  let accumulator2: Accumulator
  let initiateAttestationReq: InitiateAttestationRequest
  let attesterSession: AttesterAttestationSession
  let attestationRequest: AttestationRequest
  let attestation: Attestation
  let witness: Witness
  let witness2: Witness
  let mixedAttestationsInvalid: {
    [key: number]: {
      attestationSession: AttesterAttestationSession
      attestationRequest: AttestationRequest
      accumulator: Accumulator
    }
  }
  beforeAll(async () => {
    ;({
      claimers: [gabiClaimer],
      attesters: [gabiAttester],
      accumulators: [accumulator],
    } = await actorSetup())
    ;({
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
      attestation,
      witness,
    } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      accumulator,
    }))
    ;({
      accumulator2,
      witness2,
      mixedAttestationsInvalid,
    } = await mixedAttestationsSetup({
      gabiClaimer,
      gabiAttester,
      accumulator,
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
    }))
  })
  describe('Confirm valid data from testSetup', () => {
    it('Checks valid buildFromKeyPair for existing keys', async () => {
      const attester = new GabiAttester(pubKey, privKey)
      expect(attester).toBeDefined()
      expect(attester).toStrictEqual(gabiAttester)
    })
    it('Checks valid startAttestation', () => {
      expect(initiateAttestationReq).toBeDefined()
      expect(attesterSession).toBeDefined()
    })
    it('Checks valid issueAttestation', async () => {
      expect(attestation).toBeDefined()
      expect(witness).toBeDefined()
    })
    it('Should return the exact claim when using getClaim', async () => {
      const checkClaim = attestationRequest.getClaim()
      expect(checkClaim).toStrictEqual(claim)
    })

    it('Should throw parse error when building invalid claim from request', async () => {
      expect(() => new AttestationRequest('undefined').getClaim()).toThrowError(
        ClaimError.duringParsing
      )
      expect(() => new AttestationRequest(undefined).getClaim()).toThrowError(
        ClaimError.duringParsing
      )
    })
    it('Should throw missing error when building invalid claim from request', async () => {
      expect(() => new AttestationRequest('{}').getClaim()).toThrowError(
        ClaimError.claimMissing
      )
    })
  })
  // since the attester acts as a middleman, most of the functionality is tested in GabiClaimer and GabiVerifier
  describe('Test attester functionality', () => {
    it('Should throw when issuing unsigned attestations', async () => {
      return Promise.all(
        Object.values(mixedAttestationsInvalid).map(
          ({
            attestationSession: attestationSessionMixed,
            attestationRequest: attestationRequestMixed,
            accumulator: updateMixed,
          }) =>
            expect(
              gabiAttester.issueAttestation({
                attestationSession: attestationSessionMixed,
                attestationRequest: attestationRequestMixed,
                accumulator: updateMixed,
              })
            ).rejects.toThrow('commit message could not be verified')
        )
      ).then(response =>
        response.map(item => expect(item).not.toEqual(expect.anything()))
      )
    })
    it('Should not throw when revoking with another accumulator of same attester', async () => {
      const updateNew = await gabiAttester.createAccumulator()
      await expect(
        gabiAttester.revokeAttestation({
          accumulator: updateNew,
          witnesses: [witness],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with witness from another attester', async () => {
      await expect(
        gabiAttester.revokeAttestation({
          accumulator,
          witnesses: [witness2],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should throw when revoking with accumulator from another attester', async () => {
      await expect(
        gabiAttester.revokeAttestation({
          accumulator: accumulator2,
          witnesses: [witness],
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw when tampering context of initiateAttestationReq', async () => {
      const {
        session: attesterSession2,
        message: initiateAttestationReq2,
      } = await gabiAttester.startAttestation()
      const tamperObj: { nonce: string; context: string } = {
        ...JSON.parse(initiateAttestationReq2.valueOf()),
        context: 'El1fs5GK2sko8JkfEhWiCITaD38uA2CZN29opxU6TKM=',
      }
      const {
        message: attestationRequest2,
      } = await gabiClaimer.requestAttestation({
        startAttestationMsg: new InitiateAttestationRequest(
          JSON.stringify(tamperObj)
        ),
        claim,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      await expect(
        gabiAttester.issueAttestation({
          attestationSession: attesterSession2,
          attestationRequest: attestationRequest2,
          accumulator,
        })
      ).rejects.toThrow('commit message could not be verified')
    })
    it('Should throw when tampering nonce of initiateAttestationReq', async () => {
      const {
        session: attesterSession2,
        message: initiateAttestationReq2,
      } = await gabiAttester.startAttestation()
      const tamperObj: { nonce: string; context: string } = {
        ...JSON.parse(initiateAttestationReq2.valueOf()),
        nonce: 'w4eSUP9HnptKog==',
      }
      const {
        message: attestationRequest2,
      } = await gabiClaimer.requestAttestation({
        startAttestationMsg: new InitiateAttestationRequest(
          JSON.stringify(tamperObj)
        ),
        claim,
        attesterPubKey: gabiAttester.getPubKey(),
      })
      await expect(
        gabiAttester.issueAttestation({
          attestationSession: attesterSession2,
          attestationRequest: attestationRequest2,
          accumulator,
        })
      ).rejects.toThrow('commit message could not be verified')
    })
  })
})
