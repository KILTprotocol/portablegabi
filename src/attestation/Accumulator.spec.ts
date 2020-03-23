import Attester from './Attester'
import { actorSetup } from '../testSetup/testSetup'
import Accumulator from './Accumulator'

describe('Test accumulator', () => {
  let attester: Attester
  let accumulator: Accumulator

  beforeAll(async () => {
    ;({
      attesters: [attester],
      accumulators: [accumulator],
    } = await actorSetup())
  })
  it('Checks non-deterministic accumulator creation', async () => {
    const accumulator2 = await attester.createAccumulator()
    expect(accumulator2).toEqual(expect.anything())
    expect(accumulator2.valueOf()).toBeDefined()
    expect(accumulator.valueOf()).not.toStrictEqual(accumulator2.valueOf())
  })
  it('Should return the accumulators timestamp', async () => {
    const compTimestamp = new Date().getTime()
    const accumulator2 = await attester.createAccumulator()
    const accTimestamp = (
      await accumulator2.getDate(attester.publicKey)
    ).getTime()
    expect(Math.abs(accTimestamp - compTimestamp)).toBeLessThanOrEqual(1000)
  })
})
