import GabiAttester from './GabiAttester'
import { actorSetup } from '../testSetup/testSetup'
import Accumulator from './Accumulator'

describe('Test accumulator', () => {
  let gabiAttester: GabiAttester
  let accumulator: Accumulator

  beforeAll(async () => {
    ;({
      attesters: [gabiAttester],
      accumulators: [accumulator],
    } = await actorSetup())
  })
  it('Checks non-deterministic accumulator creation', async () => {
    const updateNew = gabiAttester.createAccumulator()
    expect(accumulator.valueOf()).not.toStrictEqual(updateNew.valueOf())
  })
})
