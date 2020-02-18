import {
  disclosedAttributes,
  disclosedAttributesCombined,
  //   claimCombined,
} from '../testSetup/testConfig'
import GabiClaimer from '../claim/GabiClaimer'
import GabiAttester from '../attestation/GabiAttester'
import { Credential } from '../types/Claim'
import {
  actorSetup,
  combinedSetup,
  attestationSetup,
} from '../testSetup/testSetup'
import GabiVerifier from './GabiVerifier'
import CombinedRequestBuilder from './CombinedRequestBuilder'
import Accumulator from '../attestation/Accumulator'

async function expectCombinedSetupToBe(
  outcome: boolean,
  {
    claimer,
    attesters,
    accumulators,
    disclosedAttsArr,
    reqUpdatesAfter,
    inputCredentials,
  }: {
    claimer: GabiClaimer
    attesters: GabiAttester[]
    accumulators: Accumulator[]
    disclosedAttsArr: string[][]
    reqUpdatesAfter: Array<Date | undefined>
    inputCredentials?: any
  }
): Promise<void> {
  const {
    combinedPresentationReq,
    combinedSession,
    combinedPresentation,
    verified: verifiedCombined,
    claims,
  } = await combinedSetup({
    claimer,
    attesters,
    accumulators,
    disclosedAttsArr,
    reqUpdatesAfter,
    inputCredentials,
  })
  expect(combinedPresentationReq).toEqual(expect.anything())
  expect(combinedSession).toEqual(expect.anything())
  expect(combinedPresentation).toEqual(expect.anything())
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
        reqUpdatedAfter: new Date(),
      })
      .requestPresentation({
        requestedAttributes: disclosedAttributesCombined,
        reqUpdatedAfter: new Date(),
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
      message: combinedPresentationReq,
      session: combinedSession,
    } = await new CombinedRequestBuilder()
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqUpdatedAfter: new Date(),
      })
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqUpdatedAfter: new Date(),
      })
      .finalise()
    // (1) test swapped attesters pubkey positions in buildCombinedPresentation
    await expect(
      claimers[0].buildCombinedPresentation({
        credentials,
        combinedPresentationReq,
        attesterPubKeys: [attesters[1].publicKey, attesters[0].publicKey],
      })
    ).rejects.toThrow('ecdsa signature was invalid')

    // (2) test swapped attesters pubkey positions in verifyCombinedPresentation
    const combPresentation = await claimers[0].buildCombinedPresentation({
      credentials,
      combinedPresentationReq,
      attesterPubKeys: attesters.map(attester => attester.publicKey),
    })
    const { verified, claims } = await GabiVerifier.verifyCombinedPresentation({
      proof: combPresentation,
      attesterPubKeys: [attesters[1].publicKey, attesters[0].publicKey],
      verifierSession: combinedSession,
      latestAccumulators: accumulators,
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
      reqUpdatesAfter: [new Date(), new Date()],
    })
  })
  it('Should throw for an empty disclosed attributes array', async () => {
    await expect(
      combinedSetup({
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, []],
        reqUpdatesAfter: [new Date(), new Date()],
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
        reqUpdatesAfter: [new Date(), new Date()],
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
        reqUpdatesAfter: [new Date()],
      })
    ).rejects.toThrow("Array lengths don't match up in combined setup")
  })
  it('Should work for any number of combinations', async () => {
    // to keep the runtime small, we test only 5 combinations, but this can be set to any number
    const n = 5
    const range = new Array(n).fill(0)
    await expectCombinedSetupToBe(true, {
      claimer: claimers[0],
      attesters: range.map((_, idx) => attesters[idx % 2]),
      accumulators: range.map((_, idx) => accumulators[idx % 2]),
      disclosedAttsArr: new Array(n).fill(disclosedAttributes),
      reqUpdatesAfter: range,
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
        witnesses: [attestations[1].witness],
      })
      credentials = attestations.map(attestation => attestation.credential)
    })
    it('Should verify if outdated index is requested', async () => {
      await expectCombinedSetupToBe(true, {
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],

        inputCredentials: credentials,
      })
    })
    it('Should verify if its a nonRevocationProof', async () => {
      await expectCombinedSetupToBe(true, {
        claimer: claimers[0],
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), undefined],
        inputCredentials: credentials,
      })
    })
  })
})
