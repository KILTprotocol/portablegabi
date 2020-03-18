/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable jsdoc/check-tag-names */

/**
 * @group integration
 */

import { getCached } from '../blockchainApiConnection/BlockchainApiConnection'
import { pubKey, privKey, pubKey2, privKey2 } from '../testSetup/testConfig'
import Attester from '../attestation/Attester.chain'
import Accumulator from '../attestation/Accumulator'
import Blockchain from './Blockchain'

let bc: Blockchain
let alice: Attester
let bob: Attester

beforeAll(async () => {
  alice = await Attester.buildFromURI(pubKey, privKey, '//Alice')
  bob = await Attester.buildFromURI(pubKey2, privKey2, '//Bob')
})

describe('when I have a brand new Portable Gabi', () => {
  test('it connects', async () => {
    bc = await getCached({ pgabiModName: 'portablegabiPallet' })
    expect(bc.api.isReady).toBeTruthy()
  })

  describe('positive tests', () => {
    test('I can put stuff in it', async () => {
      const att1 = alice

      const acc = await att1.createAccumulator()
      await att1.updateAccumulator(acc)
      await bc.waitForNextBlock()
      const [count, accChain] = await Promise.all([
        bc.getAccumulatorCount(att1.address),
        bc.getLatestAccumulator(att1.address),
      ])
      expect(count).toEqual<number>(1)
      expect(accChain).toEqual<Accumulator>(acc)
    }, 10_000)

    test('another can put their stuff in it at the same time', async () => {
      const att2 = bob

      const acc = await att2.createAccumulator()
      await att2.updateAccumulator(acc)
      await bc.waitForNextBlock()
      await Promise.all([
        expect(bc.getAccumulatorCount(att2.address)).resolves.toBe(1),
        expect(bc.getLatestAccumulator(att2.address)).resolves.toEqual(acc),
      ])
    }, 10_000)

    test('if you put a lot of stuff in, it accumulates', async () => {
      const att1 = alice

      const baseline = await bc.getAccumulatorCount(att1.address)
      let acc = await bc.getLatestAccumulator(att1.address)

      for (let i = 1; i < 4; i += 1) {
        // we're cheating a bit here; just putting in new accumulators build from scratch
        acc = await att1.createAccumulator()
        await att1.updateAccumulator(acc)
        await bc.waitForNextBlock()
        await Promise.all([
          expect(bc.getAccumulatorCount(att1.address)).resolves.toEqual(
            baseline + i
          ),
          expect(
            bc.getAccumulator(att1.address, baseline + i - 1)
          ).resolves.toEqual(acc),
        ])
      }
      await expect(bc.getLatestAccumulator(att1.address)).resolves.toEqual(acc)
    }, 30_000)

    test('you can even find the stuff you put in earlier', async () => {
      const att1 = alice

      const baseline = await bc.getAccumulatorCount(att1.address)

      const accumulators = await Promise.all([
        att1.createAccumulator(),
        att1.createAccumulator(),
        att1.createAccumulator(),
      ])

      for (const acc of accumulators) {
        await att1.updateAccumulator(acc)
        await bc.waitForNextBlock()
      }

      await expect(
        Promise.all([
          bc.getAccumulator(att1.address, baseline + 0),
          bc.getAccumulator(att1.address, baseline + 1),
          bc.getAccumulator(att1.address, baseline + 2),
        ])
      ).resolves.toEqual(accumulators)

      await expect(
        bc.getAccumulatorArray(att1.address, baseline)
      ).resolves.toEqual(accumulators)
    }, 30_000)
  })

  describe('negative tests', () => {
    test('query from unknown attester', async () => {
      const att = await Attester.buildFromMnemonic(
        pubKey,
        privKey,
        Attester.generateMnemonic()
      )

      await Promise.all([
        expect(bc.getLatestAccumulator(att.address)).rejects.toThrowError(),
        expect(bc.getAccumulator(att.address, 10)).rejects.toThrowError(),
        expect(bc.getAccumulatorArray(att.address, 10)).rejects.toThrowError(),
        expect(bc.getAccumulatorCount(att.address)).resolves.toEqual<number>(0),
      ])
    })

    test('throws when querying index out of range', async () => {
      const AccNum = await bc.getAccumulatorCount(alice.address)

      await Promise.all([
        expect(bc.getAccumulator(alice.address, 9999)).rejects.toThrowError(),
        expect(bc.getAccumulator(alice.address, AccNum)).rejects.toThrowError(),
        expect(bc.getAccumulator(alice.address, -1)).rejects.toThrowError(),
      ])
    })
  })

  test('it disconnects', async () => {
    await getCached().then(bch => bch.api.disconnect())
  })
})
