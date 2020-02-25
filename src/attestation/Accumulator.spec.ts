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
    const updateNew = attester.createAccumulator()
    expect(accumulator.valueOf()).not.toStrictEqual(updateNew.valueOf())
  })
})
