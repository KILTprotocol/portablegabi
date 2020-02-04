import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { Codec } from '@polkadot/types/types'
import { uint8ArrToString } from './Blockchain.utility'
import Accumulator from '../attestation/Accumulator'

export type Stats = {
  chain: Codec
  nodeName: Codec
  nodeVersion: Codec
}

export interface IBlockchainApi {
  api: ApiPromise
  errorHandler: {
    checkIndex: (address: string, index: number, maxIndex: number) => void
  }
  getStats: () => Promise<Stats>
  listenToBlocks: (limit?: {
    date?: Date
    events?: number
    timeout?: number
  }) => Promise<void>
  getAccumulatorCount: (address: string) => Promise<number>
  getAccumulator: (address: string, index: number) => Promise<Accumulator>
  getLatestAccumulator: (address: string) => Promise<Accumulator>
  getLatestRevocationIndex: (address: string) => Promise<number>
  updateAccumulator: (
    address: KeyringPair,
    accumulator: Accumulator
  ) => Promise<void>
  waitForNextBlock: () => Promise<void>
  checkReqRevoIndex: (
    reqIndex: number | 'latest',
    address: string
  ) => Promise<number>
}

export default class Blockchain implements IBlockchainApi {
  public api: ApiPromise

  public errorHandler = {
    checkIndex: (address: string, index: number, maxIndex: number) => {
      if (index > maxIndex) {
        throw new Error(
          `Requested accumulator index "${index}" for address "${address}" out of range [0, ${maxIndex}]`
        )
      }
      if (maxIndex === 0) {
        throw new Error(`Missing accumulator for address "${address}"`)
      }
    },
  }

  public constructor(api: ApiPromise) {
    this.api = api
  }

  public async getStats(): Promise<Stats> {
    const [chain, nodeName, nodeVersion] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version(),
    ])
    return { chain, nodeName, nodeVersion }
  }

  public async listenToBlocks(limit?: {
    date?: Date
    events?: number
    timeout?: number
  }): Promise<void> {
    let count = 0
    return new Promise(resolve => {
      return this.api.rpc.chain
        .subscribeNewHeads(header => {
          console.log(`Chain is at block: #${header.number}`)
        })
        .then(unsubscribe => {
          if (limit) {
            if (limit.timeout) {
              setTimeout(() => {
                resolve(unsubscribe())
              }, limit.timeout)
            }
            if (
              // eslint-disable-next-line no-plusplus
              (limit.events && ++count === limit.events) ||
              (limit.date && limit.date.getTime() >= new Date().getTime())
            ) {
              resolve(unsubscribe())
            }
          }
        })
    })
  }

  public async waitForNextBlock(): Promise<void> {
    const currBlock = (await this.api.rpc.chain.getHeader()).number.toNumber()
    let nextBlock = currBlock
    return new Promise(resolve =>
      this.api.rpc.chain.subscribeNewHeads(header => {
        nextBlock = header.number.toNumber()
        if (nextBlock > currBlock) resolve()
      })
    )
  }

  public async getAccumulatorCount(address: string): Promise<number> {
    const count = await this.api.query.portablegabiPallet.accumulatorCount(
      address
    )
    return parseInt(count.toString(), 10)
  }

  public async getAccumulator(
    address: string,
    index: number
  ): Promise<Accumulator> {
    // Omit registry key to read values
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      registry: _,
      ...accumulator
    } = await this.api.query.portablegabiPallet.accumulatorList([
      address,
      index,
    ])
    const accUint8Arr: number[] = Object.values(accumulator)
    // check for index out of bounds
    if (accUint8Arr.length === 1 && accUint8Arr[0] === 0) {
      const maxIndex = (await this.getAccumulatorCount(address)) - 1
      this.errorHandler.checkIndex(address, index, maxIndex)
    }
    // convert Uint8Array back to string
    return new Accumulator(uint8ArrToString(accUint8Arr))
  }

  public async getLatestAccumulator(address: string): Promise<Accumulator> {
    const maxIndex = (await this.getAccumulatorCount(address)) - 1
    if (maxIndex < 0) {
      throw new Error(`Missing any accumulator for ${address}.`)
    }
    return this.getAccumulator(address, maxIndex)
  }

  public async getLatestRevocationIndex(address: string): Promise<number> {
    return this.getAccumulatorCount(address)
  }

  public async updateAccumulator(
    address: KeyringPair,
    _accumulator: Accumulator
  ): Promise<void> {
    const accumulator = await this.api.tx.portablegabiPallet.updateAccumulator(
      _accumulator.valueOf()
    )
    const hash = await accumulator.signAndSend(address)
    console.log('Updated accumulator with hex', hash.toHex())
  }

  public async checkReqRevoIndex(
    reqIndex: number | 'latest',
    address: string
  ): Promise<number> {
    const maxIndex = await this.getLatestRevocationIndex(address)
    if (typeof reqIndex === 'number') {
      this.errorHandler.checkIndex(address, reqIndex, maxIndex)
      return reqIndex
    }
    return maxIndex
  }
}
