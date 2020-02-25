import Attester, { daysToNanoSecs } from './Attester'
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
  AttesterPrivateKey,
  AttesterPublicKey,
} from '../types/Attestation'
import Claimer from '../claim/Claimer'
import { AttestationRequest, ClaimError } from '../types/Claim'
import Accumulator from './Accumulator'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import AttesterChain from './Attester.chain'

describe('Test attester', () => {
  let attester: Attester
  let claimer: Claimer
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
      claimers: [claimer],
      attesters: [attester],
      accumulators: [accumulator],
    } = await actorSetup())
    ;({
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
      attestation,
      witness,
    } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    }))
    ;({
      accumulator2,
      witness2,
      mixedAttestationsInvalid,
    } = await mixedAttestationsSetup({
      claimer,
      attester,
      accumulator,
      initiateAttestationReq,
      attesterSession,
      attestationRequest,
    }))
  })
  describe('Mock key generation', () => {
    const goWasmExecOrig = goWasmExec
    const keypair = {
      privateKey: new AttesterPrivateKey('sk'),
      publicKey: new AttesterPublicKey('pk'),
    }
    afterAll(() => {
      ;(goWasmExec as any) = goWasmExecOrig
    })
    it('Should generate dummy key pair', async () => {
      ;(goWasmExec as any) = jest.fn(async () => keypair)
      await expect(Attester.genKeyPair(1, 10)).resolves.toEqual(keypair)
      await expect(Attester.genKeyPair()).resolves.toEqual(keypair)
    })
    it('Should create attester', async () => {
      await expect(Attester.create(1, 10)).resolves.toHaveProperty(
        'privateKey',
        keypair.privateKey
      )
      await expect(Attester.create()).resolves.toHaveProperty(
        'publicKey',
        keypair.publicKey
      )
      await expect(
        AttesterChain.create(1, 10, 'ed25519')
      ).resolves.toHaveProperty('privateKey', keypair.privateKey)
      await expect(AttesterChain.create()).resolves.toHaveProperty(
        'publicKey',
        keypair.publicKey
      )
    })
  })
  describe('Confirm valid data from testSetup', () => {
    it('Checks valid buildFromKeyPair for existing keys', async () => {
      const attester2 = new Attester(pubKey, privKey)
      expect(attester2).toBeDefined()
      expect(attester2).toStrictEqual(attester)
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
  // since the attester acts as a middleman, most of the functionality is tested in Claimer and Verifier
  describe('Test attester functionality', () => {
    it('Tests daysToNanoSecs', () => {
      expect(daysToNanoSecs(1)).toEqual(8.64 * 10 ** 13)
      expect(daysToNanoSecs(2)).toEqual(2 * 8.64 * 10 ** 13)
    })
    it('Should throw when issuing unsigned attestations', async () => {
      return Promise.all(
        Object.values(mixedAttestationsInvalid).map(
          ({
            attestationSession: attestationSessionMixed,
            attestationRequest: attestationRequestMixed,
            accumulator: updateMixed,
          }) =>
            expect(
              attester.issueAttestation({
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
    it('Should not throw when revoking with missing witnesses array', async () => {
      const updateNew = await attester.createAccumulator()
      await expect(
        attester.revokeAttestation({
          accumulator: updateNew,
          witnesses: (undefined as unknown) as Witness[],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with empty witnesses array', async () => {
      const updateNew = await attester.createAccumulator()
      await expect(
        attester.revokeAttestation({
          accumulator: updateNew,
          witnesses: [],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with another accumulator of same attester', async () => {
      const updateNew = await attester.createAccumulator()
      await expect(
        attester.revokeAttestation({
          accumulator: updateNew,
          witnesses: [witness],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should not throw when revoking with witness from another attester', async () => {
      await expect(
        attester.revokeAttestation({
          accumulator,
          witnesses: [witness2],
        })
      ).resolves.toEqual(expect.anything())
    })
    it('Should throw when revoking with accumulator from another attester', async () => {
      await expect(
        attester.revokeAttestation({
          accumulator: accumulator2,
          witnesses: [witness],
        })
      ).rejects.toThrow('ecdsa signature was invalid')
    })
    it('Should throw when tampering context of initiateAttestationReq', async () => {
      const {
        session: attesterSession2,
        message: initiateAttestationReq2,
      } = await attester.startAttestation()
      const tamperObj: { nonce: string; context: string } = {
        ...JSON.parse(initiateAttestationReq2.valueOf()),
        context: 'El1fs5GK2sko8JkfEhWiCITaD38uA2CZN29opxU6TKM=',
      }
      const { message: attestationRequest2 } = await claimer.requestAttestation(
        {
          startAttestationMsg: new InitiateAttestationRequest(
            JSON.stringify(tamperObj)
          ),
          claim,
          attesterPubKey: attester.publicKey,
        }
      )
      await expect(
        attester.issueAttestation({
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
      } = await attester.startAttestation()
      const tamperObj: { nonce: string; context: string } = {
        ...JSON.parse(initiateAttestationReq2.valueOf()),
        nonce: 'w4eSUP9HnptKog==',
      }
      const { message: attestationRequest2 } = await claimer.requestAttestation(
        {
          startAttestationMsg: new InitiateAttestationRequest(
            JSON.stringify(tamperObj)
          ),
          claim,
          attesterPubKey: attester.publicKey,
        }
      )
      await expect(
        attester.issueAttestation({
          attestationSession: attesterSession2,
          attestationRequest: attestationRequest2,
          accumulator,
        })
      ).rejects.toThrow('commit message could not be verified')
    })
  })
})
