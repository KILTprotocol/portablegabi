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

let chain: Blockchain
let alice: Attester
let bob: Attester

beforeAll(async () => {
  alice = await Attester.buildFromURI(pubKey, privKey, '//Alice', 'ed25519')
  bob = await Attester.buildFromURI(pubKey2, privKey2, '//Bob', 'ed25519')
})

describe('When I have a fresh chain with a Portablegabi pallet...', () => {
  it('it connects', async () => {
    chain = await getCached({ pgabiModName: 'portablegabi' })
    expect(chain.api.isReady).toBeTruthy()
  })

  describe('positive tests', () => {
    it('is possible to store an accumulator', async () => {
      const baseline = await chain.getAccumulatorCount(alice.address)
      const accumulator = await alice.createAccumulator()
      const tx = await alice.buildUpdateAccumulatorTX(accumulator)
      await chain.signAndSend(tx, alice.keyringPair)

      const [count, accChain] = await Promise.all([
        chain.getAccumulatorCount(alice.address),
        chain.getLatestAccumulator(alice.address),
      ])
      expect(count).toEqual<number>(baseline + 1)
      expect(accChain).toEqual<Accumulator>(accumulator)
    }, 15_000)

    it('is possible for someone else to store an accumulator at the same time', async () => {
      const baseline = await chain.getAccumulatorCount(bob.address)
      const accumulator = await bob.createAccumulator()
      const tx = await bob.buildUpdateAccumulatorTX(accumulator)
      await chain.signAndSend(tx, bob.keyringPair)
      await Promise.all([
        expect(chain.getAccumulatorCount(bob.address)).resolves.toBe(
          baseline + 1
        ),
        expect(chain.getLatestAccumulator(bob.address)).resolves.toEqual(
          accumulator
        ),
      ])
    }, 20_000)

    it('accumulates if you put a lot of stuff in', async () => {
      const baseline = await chain.getAccumulatorCount(alice.address)
      let accumulator = await chain.getLatestAccumulator(alice.address)

      for (let i = 1; i < 4; i += 1) {
        // we're cheating a bit here; just putting in new accumulators built from scratch
        accumulator = await alice.createAccumulator()
        const tx = await alice.buildUpdateAccumulatorTX(accumulator)
        await chain.signAndSend(tx, alice.keyringPair)
        await Promise.all([
          expect(chain.getAccumulatorCount(alice.address)).resolves.toEqual(
            baseline + i
          ),
          expect(
            chain.getAccumulator(alice.address, baseline + i - 1)
          ).resolves.toEqual(accumulator),
        ])
      }
      await expect(chain.getLatestAccumulator(alice.address)).resolves.toEqual(
        accumulator
      )
    }, 60_000)

    it('is possible to retrieve accumulators you put in earlier', async () => {
      const baseline = await chain.getAccumulatorCount(alice.address)

      const accumulators = await Promise.all([
        alice.createAccumulator(),
        alice.createAccumulator(),
        alice.createAccumulator(),
      ])

      for (const accumulator of accumulators) {
        const tx = await alice.buildUpdateAccumulatorTX(accumulator)
        await chain.signAndSend(tx, alice.keyringPair)
      }

      await expect(
        Promise.all([
          chain.getAccumulator(alice.address, baseline + 0),
          chain.getAccumulator(alice.address, baseline + 1),
          chain.getAccumulator(alice.address, baseline + 2),
        ])
      ).resolves.toEqual(accumulators)

      await expect(
        chain.getAccumulatorArray(alice.address, baseline)
      ).resolves.toEqual(accumulators)
    }, 60_000)
  })

  describe('negative tests', () => {
    it('should throw when querying an unknown address', async () => {
      const att = await Attester.buildFromMnemonic(
        pubKey,
        privKey,
        Attester.generateMnemonic()
      )

      await Promise.all([
        expect(chain.getLatestAccumulator(att.address)).rejects.toThrowError(),
        expect(chain.getAccumulator(att.address, 10)).rejects.toThrowError(),
        expect(
          chain.getAccumulatorArray(att.address, 10)
        ).rejects.toThrowError(),
        expect(chain.getAccumulatorCount(att.address)).resolves.toEqual<number>(
          0
        ),
      ])
    })

    it('throws when querying accumulator index out of range', async () => {
      const numOfAccs = await chain.getAccumulatorCount(alice.address)

      await Promise.all([
        expect(
          chain.getAccumulator(alice.address, 9999)
        ).rejects.toThrowError(),
        expect(
          chain.getAccumulator(alice.address, numOfAccs)
        ).rejects.toThrowError(),
        expect(chain.getAccumulator(alice.address, -1)).rejects.toThrowError(),
      ])
    })
  })

  it('it disconnects', async () => {
    chain = await getCached({ pgabiModName: 'portablegabi' })
    await chain.api.disconnect()
    expect(chain.api.isReady).resolves.toStrictEqual({})
  })
})
