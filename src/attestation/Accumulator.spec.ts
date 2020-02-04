import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import GabiAttester from './GabiAttester'
import { attestationSetup, actorSetup } from '../testSetup/testSetup'
import { Witness } from '../types/Attestation'
import GabiClaimer from '../claim/GabiClaimer'
import Accumulator from './Accumulator'

// close WASM instance after tests ran
afterAll(() => goWasmClose())

describe('Test accumulator', () => {
  let gabiAttester: GabiAttester
  let gabiAttester2: GabiAttester
  let gabiClaimer: GabiClaimer
  let accumulator: Accumulator
  let witness: Witness
  let witness2: Witness
  beforeAll(async () => {
    ;({
      claimers: [gabiClaimer],
      attesters: [gabiAttester, gabiAttester2],
      accumulators: [accumulator],
    } = await actorSetup())
    ;({ witness } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      accumulator,
    }))
    ;({ witness: witness2 } = await attestationSetup({
      claimer: gabiClaimer,
      attester: gabiAttester,
      accumulator,
    }))
  })
  it('Checks non-deterministic accumulator creation', async () => {
    const updateNew = gabiAttester.createAccumulator()
    expect(accumulator.valueOf()).not.toStrictEqual(updateNew.valueOf())
  })
  it('Checks revocation index is 0 before revocation', async () => {
    const freshAccumulator = await gabiAttester.createAccumulator()
    await expect(
      freshAccumulator.getRevIndex(gabiAttester.getPubKey())
    ).resolves.toBe(0)
  })
  it('Increases revocation index by one for each revocation', async () => {
    const acc1Rev = await gabiAttester.revokeAttestation({
      accumulator,
      witnesses: [witness],
    })
    await expect(acc1Rev.getRevIndex(gabiAttester.getPubKey())).resolves.toBe(1)
    const acc2Revs = await gabiAttester.revokeAttestation({
      accumulator: acc1Rev,
      witnesses: [witness2],
    })
    await expect(acc2Revs.getRevIndex(gabiAttester.getPubKey())).resolves.toBe(
      2
    )
  })
  it('Increases revocation index by 2 when revoking 2 witnesses at once', async () => {
    const acc2RevsAtOnce = await gabiAttester.revokeAttestation({
      accumulator,
      witnesses: [witness, witness2],
    })
    await expect(
      acc2RevsAtOnce.getRevIndex(gabiAttester.getPubKey())
    ).resolves.toBe(2)
  })
  it('Should not increase revocation index when revoking the same credential twice', async () => {
    const accFirstRev = await gabiAttester.revokeAttestation({
      accumulator,
      witnesses: [witness],
    })
    const index1 = await accFirstRev.getRevIndex(gabiAttester.getPubKey())
    const accSecondRev = await gabiAttester.revokeAttestation({
      accumulator,
      witnesses: [witness],
    })
    const index2 = await accSecondRev.getRevIndex(gabiAttester.getPubKey())
    expect(index1).toBe(index2)
  })
  describe('Negative tests', () => {
    it('Should throw when calling getRevIndex for incorrect attester', async () => {
      await expect(
        accumulator.getRevIndex(gabiAttester2.getPubKey())
      ).rejects.toThrowError('ecdsa signature was invalid')
    })
  })
})
