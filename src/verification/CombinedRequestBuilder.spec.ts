import {
  disclosedAttributes,
  disclosedAttributesCombined,
  //   claimCombined,
} from '../testSetup/testConfig'
import CombinedRequestBuilder from './CombinedRequestBuilder'
import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { Accumulator } from '../types/Attestation'
import { Credential } from '../types/Claim'
import {
  actorSetup,
  combinedSetup,
  attestationSetup,
} from '../testSetup/testSetup'
import GabiVerifier from './GabiVerifier'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'

// close WASM instance after tests ran
afterAll(() => goWasmClose())

async function expectCombinedSetupToBe(
  outcome: boolean,
  {
    claimer,
    attesters,
    accumulators,
    disclosedAttsArr,
    minIndices,
    reqNonRevocationProof,
    inputCredentials,
  }: {
    claimer: GabiClaimer
    attesters: GabiAttester[]
    accumulators: Accumulator[]
    disclosedAttsArr: string[][]
    minIndices: number[]
    reqNonRevocationProof: boolean[]
    inputCredentials?: any
  }
): Promise<void> {
  const {
    combinedBuilder,
    combinedReq,
    combinedSession,
    verified: verifiedCombined,
    claims,
  } = await combinedSetup({
    claimer,
    attesters,
    accumulators,
    disclosedAttsArr,
    minIndices,
    reqNonRevocationProof,
    inputCredentials,
  })
  expect(combinedBuilder).toEqual(expect.anything())
  expect(combinedReq).toEqual(expect.anything())
  expect(combinedSession).toEqual(expect.anything())
  expect(verifiedCombined).toBe(outcome)
  expect(claims).toEqual(expect.anything())
  expect(claims).toHaveLength(attesters.length)
}

describe('Test combined requests', () => {
  let claimers: GabiClaimer[]
  let attesters: GabiAttester[]
  let accumulators: Accumulator[]
  beforeAll(async () => {
    ;({ attesters, accumulators, claimers } = await actorSetup())
  })
  it('Checks valid CombinedRequestBuilder', async () => {
    const { message, session } = await new CombinedRequestBuilder()
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqNonRevocationProof: true,
        reqMinIndex: 1,
      })
      .requestPresentation({
        requestedAttributes: disclosedAttributesCombined,
        reqNonRevocationProof: true,
        reqMinIndex: 1,
      })
      .finalise()
    expect(message).toEqual(expect.anything())
    expect(session).toEqual(expect.anything())
  })
  it('Should not verify if one of the attesters keys does not fit', async () => {
    const credentials = await Promise.all(
      attesters.map((attester, idx) =>
        attestationSetup({
          attester,
          claimer: claimers[0],
          accumulator: accumulators[idx],
        })
      )
    ).then(attestations =>
      attestations.map(attestation => attestation.credential)
    )
    const {
      message: combinedReq,
      session: combinedSession,
    } = await new CombinedRequestBuilder()
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqNonRevocationProof: true,
        reqMinIndex: 1,
      })
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqNonRevocationProof: true,
        reqMinIndex: 1,
      })
      .finalise()
    // (1) test swapped attesters pubkey positions in buildCombinedPresentation
    await expect(
      claimers[0].buildCombinedPresentation({
        credentials,
        combinedPresentationReq: combinedReq,
        attesterPubKeys: [attesters[1].getPubKey(), attesters[0].getPubKey()],
      })
    ).rejects.toThrow('ecdsa signature was invalid')

    // (2) test swapped attesters pubkey positions in verifyCombinedPresentation
    const combPresentation = await claimers[0].buildCombinedPresentation({
      credentials,
      combinedPresentationReq: combinedReq,
      attesterPubKeys: attesters.map(attester => attester.getPubKey()),
    })
    const { verified, claims } = await GabiVerifier.verifyCombinedPresentation({
      proof: combPresentation,
      attesterPubKeys: [attesters[1].getPubKey(), attesters[0].getPubKey()],
      verifierSession: combinedSession,
    })
    expect(verified).toBe(false)
    expect(claims).not.toEqual(expect.anything())
  })
  it('Check valid combinedSetups', async () => {
    await expectCombinedSetupToBe(true, {
      claimer: claimers[0],
      attesters,
      accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      minIndices: [1, 1],
      reqNonRevocationProof: [true, true],
    })
  })
  it('Should throw for an empty disclosed attributes array', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, []],
        minIndices: [1, 1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow(
      'requested attributes should not be empty for the 2. credential'
    )
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [[], disclosedAttributes],
        minIndices: [1, 1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow(
      'requested attributes should not be empty for the 1. credential'
    )
  })
  it('Should throw for different input array lengths', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, []],
        minIndices: [1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow('Array lengths dont match up in combined setup')
  })
  it('Should throw for negative index input', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        minIndices: [1, -1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow(
      'cannot unmarshal number -1 into Go struct field PartialPresentationRequest.reqMinIndex of type uint64'
    )
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        minIndices: [-1, -1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow(
      'cannot unmarshal number -1 into Go struct field PartialPresentationRequest.reqMinIndex of type uint64'
    )
  })
  it('Should not verify with incorrect indices', async () => {
    await expectCombinedSetupToBe(false, {
      claimer: claimers[0],
      attesters,
      accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      minIndices: [1000, 1000],
      reqNonRevocationProof: [true, true],
    })
  })
  it('Should work for any number of combinations', async () => {
    // to keep the runtime small, we test only 5 combinations, but this can be set to any number
    const n = 5
    const range = new Array(n).fill(1)
    await expectCombinedSetupToBe(true, {
      claimer: claimers[0],
      attesters: range.map((_, idx) => attesters[idx % 2]),
      accumulators: range.map((_, idx) => accumulators[idx % 2]),
      disclosedAttsArr: new Array(n).fill(disclosedAttributes),
      minIndices: range,
      reqNonRevocationProof: new Array(n).fill(true),
    })
  })
  describe('If one credential is revoked, it...', () => {
    let credentials: Credential[]
    beforeAll(async () => {
      const attestations = await Promise.all(
        attesters.map((attester, idx) =>
          attestationSetup({
            attester,
            claimer: claimers[0],
            accumulator: accumulators[idx],
          })
        )
      )
      // revoke 2nd credential
      attesters[1].revokeAttestation({
        accumulator: accumulators[1],
        witness: attestations[1].witness,
      })
      credentials = attestations.map(attestation => attestation.credential)
    })
    it('Should not verify if current index is requested', async () => {
      await expectCombinedSetupToBe(false, {
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        minIndices: [1, 2],
        reqNonRevocationProof: [true, true],
        inputCredentials: credentials,
      })
    })
    it('Should verify if outdated index is requested', async () => {
      await expectCombinedSetupToBe(true, {
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        minIndices: [1, 1],
        reqNonRevocationProof: [true, true],
        inputCredentials: credentials,
      })
    })
    it('Should verify if its a nonRevocationProof', async () => {
      await expectCombinedSetupToBe(true, {
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        minIndices: [1, 2],
        reqNonRevocationProof: [true, false],
        inputCredentials: credentials,
      })
    })
  })
  it.todo('? Combine two single presentations into combined proof')
})
