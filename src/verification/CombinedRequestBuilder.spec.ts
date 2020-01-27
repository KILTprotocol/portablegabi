import {
  disclosedAttributes,
  disclosedAttributesCombined,
  //   claimCombined,
} from '../testSetup/testConfig'
import CombinedRequestBuilder from './CombinedRequestBuilder'
import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { Accumulator } from '../types/Attestation'
import {
  actorSetup,
  combinedSetup,
  attestationSetup,
} from '../testSetup/testSetup'

async function expectCombinedSetupToBe(
  outcome: boolean,
  {
    claimer,
    attesters,
    updates,
    disclosedAttsArr,
    minIndices,
    reqNonRevocationProof,
    inputCredentials,
  }: {
    claimer: GabiClaimer
    attesters: GabiAttester[]
    updates: Accumulator[]
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
    updates,
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
  it('Check valid combinedSetups', async () => {
    await expectCombinedSetupToBe(true, {
      claimer: claimers[0],
      attesters,
      updates: accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      minIndices: [1, 1],
      reqNonRevocationProof: [true, true],
    })
  })
  it('Should not verify if one credential is revoked', async () => {
    // build credentials
    const attestations = await Promise.all(
      attesters.map((attester, idx) =>
        attestationSetup({
          attester,
          claimer: claimers[0],
          update: accumulators[idx],
        })
      )
    )
    // revoke 1st credential
    attesters[0].revokeAttestation({
      update: accumulators[0],
      witness: attestations[0].witness,
    })
    // revoke 2nd credential
    attesters[1].revokeAttestation({
      update: accumulators[1],
      witness: attestations[1].witness,
    })
    // FIXME: Currently verifies despite one or both attestations being revoked
    await expectCombinedSetupToBe(false, {
      claimer: claimers[0],
      attesters,
      updates: accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      minIndices: [1000, 1000],
      reqNonRevocationProof: [true, true],
      inputCredentials: attestations.map(attestation => attestation.credential),
    })
  })
  it('Should throw for an empty disclosed attributes array', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        updates: accumulators,
        disclosedAttsArr: [disclosedAttributes, []],
        minIndices: [1, 1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow(
      'requested attributes should not be empty for the 2. credential'
    )
  })
  it('Should throw for different input array lengths', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        updates: accumulators,
        disclosedAttsArr: [disclosedAttributes, []],
        minIndices: [1],
        reqNonRevocationProof: [true, true],
      })
    ).rejects.toThrow('Array lengths dont match up in combined setup')
  })
  it.only('Should not verify with incorrect indices', async () => {
    // FIXME: Currently verifies for any indices
    await expectCombinedSetupToBe(false, {
      claimer: claimers[0],
      attesters,
      updates: accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      minIndices: [1000, 1000],
      reqNonRevocationProof: [true, true],
    })
  })
})
