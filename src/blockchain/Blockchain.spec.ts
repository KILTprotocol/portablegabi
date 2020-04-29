import { stringToHex } from '@polkadot/util'
import { Codec } from '@polkadot/types/types'
import Accumulator from '../attestation/Accumulator'
import BlockchainError from './BlockchainError'
import api from './__mocks__/BlockchainApi'
import BlockchainMock from './__mocks__/Blockchain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('chain mocks', () => {
  const dummyAddress = 'dummyAddress'
  const emptyValue = 0x00
  describe('Positive tests', () => {
    it('Should connect', async () => {
      await expect(connect()).resolves.toStrictEqual(BlockchainMock)
    })
    it('Should getAccumulatorCount', async () => {
      const count = await BlockchainMock.getAccumulatorCount(dummyAddress)
      expect(count).toBe(dummyAddress.length)
    })
    it('Should getAccumulator', async () => {
      const accu: Accumulator = await BlockchainMock.getAccumulator(
        dummyAddress,
        1
      )
      expect(accu.toString()).toBe(dummyAddress)
    })
    it('Should getLatestAccumulator', async () => {
      api.query.portablegabi.accumulatorCount.mockResolvedValue(
        Promise.resolve(100)
      )
      api.query.portablegabi.accumulatorList.mockResolvedValueOnce(
        (stringToHex('dummyAccumulator') as unknown) as Promise<Codec>
      )
      const accumulator: Accumulator = await BlockchainMock.getLatestAccumulator(
        dummyAddress
      )
      expect(accumulator.toString()).toBe('dummyAccumulator')
    })
    it('Should updateAccumulator', async () => {
      const newAccumulator = new Accumulator('newAccumulator')
      // set current accumulator
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex('currAccumulator') as unknown) as Promise<Codec>
      )
      const currAccumulator = await BlockchainMock.getLatestAccumulator(
        dummyAddress
      )
      expect(currAccumulator.toString()).toBe('currAccumulator')
      // update to new accumulator
      await expect(
        BlockchainMock.updateAccumulator('s' as any, newAccumulator)
      ).resolves.toBeUndefined()
      const latestAccumulator = await BlockchainMock.getLatestAccumulator(
        dummyAddress
      )
      expect(latestAccumulator.toString()).toBe(newAccumulator.toString())
    })
    it('Should getAccumulatorArray', async () => {
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex('currAccumulator') as unknown) as Promise<Codec>
      )
      const currAccumulators = await BlockchainMock.getAccumulatorArray(
        dummyAddress,
        1,
        4
      )
      expect(Array.isArray(currAccumulators)).toBeTruthy()
      expect(currAccumulators.length).toEqual(4)
    })
  })
  describe('Negative tests', () => {
    it('Should throw error for swapped indices when requesting accumulator array', async () => {
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex('currAccumulator') as unknown) as Promise<Codec>
      )
      expect(
        BlockchainMock.getAccumulatorArray(dummyAddress, 4, 1)
      ).rejects.toThrowError()
    })
    it('Should throw error when accumulator array index out is of range', async () => {
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex('currAccumulator') as unknown) as Promise<Codec>
      )
      expect(
        BlockchainMock.getAccumulatorArray(dummyAddress, 999999999)
      ).rejects.toThrowError()
    })
    it('Should throw for empty accumulatorList (maxIndex === -1)', async () => {
      const accCount = 0
      const requestedIndex = 1
      api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(
        Promise.resolve(accCount)
      )
      api.query.portablegabi.accumulatorList.mockReturnValue(
        (emptyValue as unknown) as Promise<Codec>
      )
      await expect(
        BlockchainMock.getAccumulator(dummyAddress, requestedIndex)
      ).rejects.toThrowError(BlockchainError.maxIndexZero(dummyAddress))
    })
    it('Should throw when requesting accumulator index > maxIndex', async () => {
      const accCount = 1
      const requestedIndex = 2
      api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(
        Promise.resolve(accCount)
      )
      api.query.portablegabi.accumulatorList.mockReturnValue(
        (emptyValue as unknown) as Promise<Codec>
      )
      await expect(
        BlockchainMock.getAccumulator(dummyAddress, requestedIndex)
      ).rejects.toThrowError(
        BlockchainError.indexOutOfRange(
          dummyAddress,
          requestedIndex,
          accCount - 1
        )
      )
    })
    it('Should throw when requesting accumulator for index < 0', async () => {
      const accCount = 1
      const requestedIndex = -1
      api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(
        Promise.resolve(accCount)
      )
      api.query.portablegabi.accumulatorList.mockReturnValue(
        (emptyValue as unknown) as Promise<Codec>
      )
      await expect(
        BlockchainMock.getAccumulator(dummyAddress, requestedIndex)
      ).rejects.toThrowError(
        BlockchainError.indexOutOfRange(
          dummyAddress,
          requestedIndex,
          accCount - 1
        )
      )
    })
    it('Should throw when requesting latest accumulator for empty list', async () => {
      const accCount = 0
      api.query.portablegabi.accumulatorCount.mockResolvedValueOnce(
        Promise.resolve(accCount)
      )
      api.query.portablegabi.accumulatorList.mockReturnValue(
        (emptyValue as unknown) as Promise<Codec>
      )
      await expect(
        BlockchainMock.getLatestAccumulator(dummyAddress)
      ).rejects.toThrowError(BlockchainError.maxIndexZero(dummyAddress))
    })
  })
})
