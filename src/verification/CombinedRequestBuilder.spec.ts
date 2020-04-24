import {
  disclosedAttributes,
  disclosedAttributesCombined,
  //   claimCombined,
} from '../testSetup/testConfig'
import Claimer from '../claim/Claimer'
import Attester from '../attestation/Attester'
import Credential from '../claim/Credential'
import {
  actorSetup,
  combinedSetup,
  attestationSetup,
} from '../testSetup/testSetup'
import Verifier from './Verifier'
import CombinedRequestBuilder from './CombinedRequestBuilder'
import Accumulator from '../attestation/Accumulator'

// }: {
//   claimer: Claimer
//   attesters: Attester[]
//   accumulators: Array<Accumulator | undefined>
//   disclosedAttsArr: string[][]
//   reqUpdatesAfter: Array<Date | undefined>
//   inputCredentials?: any
// }

async function expectCombinedSetupToBe(
  outcome: boolean,
  ...[
    {
      claimer,
      attesters,
      accumulators,
      disclosedAttsArr,
      reqUpdatesAfter,
      inputCredentials,
    },
  ]: Parameters<typeof combinedSetup>
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
  if (outcome) {
    expect(claims).toEqual(expect.anything())
    expect(claims).toHaveLength(attesters.length)
  } else {
    expect(claims).toBeNull()
  }
}

describe('Test combined requests', () => {
  let claimer: Claimer
  let attesters: Attester[]
  let accumulators: Accumulator[]
  beforeAll(async () => {
    ;({
      attesters,
      accumulators,
      claimers: [claimer],
    } = await actorSetup())
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
    expect(message.getRequestedProperties()).toEqual([
      disclosedAttributes,
      disclosedAttributesCombined,
    ])
  })
  it('Should not verify if one of the attesters keys does not fit', async () => {
    const credentials = await Promise.all(
      attesters.map((attester, idx) =>
        attestationSetup({
          attester,
          claimer,
          accumulator: accumulators[idx],
        })
      )
    ).then((attestations) =>
      attestations.map((attestation) => attestation.credential)
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
      claimer.buildCombinedPresentation({
        credentials,
        combinedPresentationReq,
        attesterPubKeys: [attesters[1].publicKey, attesters[0].publicKey],
      })
    ).rejects.toThrow('ecdsa signature was invalid')

    // (2) test swapped attesters pubkey positions in verifyCombinedPresentation
    const combPresentation = await claimer.buildCombinedPresentation({
      credentials,
      combinedPresentationReq,
      attesterPubKeys: attesters.map((attester) => attester.publicKey),
    })
    const { verified, claims } = await Verifier.verifyCombinedPresentation({
      proof: combPresentation,
      attesterPubKeys: [attesters[1].publicKey, attesters[0].publicKey],
      verifierSession: combinedSession,
      latestAccumulators: accumulators,
    })
    expect(verified).toBe(false)
    expect(claims).not.toEqual(expect.anything())
  })
  it('Verifies valid combinedSetup', async () => {
    await expectCombinedSetupToBe(true, {
      claimer,
      attesters,
      accumulators,
      disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
      reqUpdatesAfter: [new Date(), new Date()],
    })
  })
  it('Should throw when using incorrect attester key', async () => {
    await expect(
      combinedSetup({
        claimer,
        attesters: [attesters[0], attesters[0]],
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],
      })
    ).rejects.toThrowError('ecdsa signature was invalid')
    await expect(
      combinedSetup({
        claimer,
        attesters: [attesters[1], attesters[1]],
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],
      })
    ).rejects.toThrowError('ecdsa signature was invalid')
  })
  it('Should throw for an empty disclosed attributes array', async () => {
    await expect(
      combinedSetup({
        claimer,
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
        claimer,
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
        claimer,
        attesters: [attesters[0]],
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date()],
      })
    ).rejects.toThrow("Array lengths don't match up in combined setup")
  })
  it('Should work for any number of combinations', async () => {
    // to keep the runtime small, we test only 5 combinations, but this can be set to any number
    const n = 5
    const dates = new Array(n).fill(0).map((d) => new Date(d))
    await expectCombinedSetupToBe(true, {
      claimer,
      attesters: dates.map((_, idx) => attesters[idx % 2]),
      accumulators: dates.map((_, idx) => accumulators[idx % 2]),
      disclosedAttsArr: new Array(n).fill(disclosedAttributes),
      reqUpdatesAfter: dates,
    })
  })
  describe('If one credential is revoked, it...', () => {
    let credentials: Credential[]
    let accAfterRev: Accumulator
    const revCredIdx = 1
    const dateBeforeRev = new Date()
    beforeAll(async () => {
      const attestations = await Promise.all(
        attesters.map((attester, idx) =>
          attestationSetup({
            attester,
            claimer,
            accumulator: accumulators[idx],
          })
        )
      )
      credentials = attestations.map((a) => a.credential)
      // revoke 2nd credential
      accAfterRev = await attesters[revCredIdx].revokeAttestation({
        accumulator: accumulators[revCredIdx],
        witnesses: [attestations[revCredIdx].witness],
      })
    })
    it('Should verify when outdated accumulators are used by verifier', async () => {
      await expectCombinedSetupToBe(true, {
        claimer,
        attesters,
        accumulators,
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],
        inputCredentials: credentials,
      })
    })
    it('Should not verify when latest accumulators are used by verifier', async () => {
      await expectCombinedSetupToBe(false, {
        claimer,
        attesters,
        accumulators: [accumulators[0], accAfterRev],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],
        inputCredentials: credentials,
      })
    })
    it('Should verify when timestamp of revoked credential is older than revocation', async () => {
      await expectCombinedSetupToBe(true, {
        claimer,
        attesters,
        accumulators: [accumulators[0], accAfterRev],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), dateBeforeRev],
        inputCredentials: credentials,
      })
    })
    it('Should not verify when timestamp of revoked credential is newer than revocation', async () => {
      await expectCombinedSetupToBe(false, {
        claimer,
        attesters,
        accumulators: [accumulators[0], accAfterRev],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), new Date()],
        inputCredentials: credentials,
      })
    })
    it('Should verify when no timestamp is required, i.e. is a non-revocation proof', async () => {
      await expectCombinedSetupToBe(true, {
        claimer,
        attesters,
        accumulators: [accumulators[0], accAfterRev],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date(), undefined],
        inputCredentials: credentials,
      })
    })
    it('Should verify when no accumulator is required, i.e. is a non-revocation proof', async () => {
      await expectCombinedSetupToBe(true, {
        claimer,
        attesters,
        accumulators: [accumulators[0]],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        reqUpdatesAfter: [new Date()],
        inputCredentials: credentials,
      })
    })
  })
})
