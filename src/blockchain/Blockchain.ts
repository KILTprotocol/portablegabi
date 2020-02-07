import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { uint8ArrToString } from './Blockchain.utility'
import Accumulator from '../attestation/Accumulator'
import { IPublicIdentity } from '../attestation/GabiAttester.chain'
import chainErrHandler, { BlockchainError } from './ChainError'

export interface IBlockchainApi {
  api: ApiPromise
  chainErrHandler: typeof chainErrHandler
  getAccumulatorCount: (address: string) => Promise<number>
  getAccumulator: (address: string, index: number) => Promise<Accumulator>
  getLatestAccumulator: (address: string) => Promise<Accumulator>
  getRevIndex: (publicIdentity: IPublicIdentity) => Promise<number>
  updateAccumulator: (
    address: KeyringPair,
    accumulator: Accumulator
  ) => Promise<void>
  waitForNextBlock: () => Promise<void>
  checkReqRevIndex: (
    reqIndex: number | 'latest',
    identity: IPublicIdentity
  ) => Promise<number>
}

export default class Blockchain implements IBlockchainApi {
  public api: ApiPromise

  public chainErrHandler = chainErrHandler

  public constructor(api: ApiPromise) {
    this.api = api
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
      this.chainErrHandler.checkAccIndex(address, index, maxIndex)
    }
    // convert Uint8Array back to string
    return new Accumulator(uint8ArrToString(accUint8Arr))
  }

  public async getLatestAccumulator(address: string): Promise<Accumulator> {
    const maxIndex = (await this.getAccumulatorCount(address)) - 1
    if (maxIndex < 0) {
      throw BlockchainError.maxIndexZero(address)
    }
    return this.getAccumulator(address, maxIndex)
  }

  public async getRevIndex(identity: IPublicIdentity): Promise<number> {
    const accumulator = await this.getLatestAccumulator(identity.address)
    return accumulator.getRevIndex(identity.publicKey, identity.address)

    // try {
    //   const index = await accumulator.getRevIndex(
    //     identity.publicKey,
    //     identity.address
    //   )
    //   return index
    // } catch (e) {
    //   console.log('GETREVINDEX', e)
    //   return 0
    // }
    // return accumulator
    //   .getRevIndex(identity.publicKey, identity.address)
    //   .catch(e => {
    //     console.log('GETREVINDEX', e)
    //     return 0
    //   })
    // return accumulator.getRevIndex(identity.publicKey, identity.address)
    // return new Promise(resolve => {
    //   return accumulator
    //     .getRevIndex(identity.publicKey, identity.address)
    //     .then(x => resolve(x))
    // })
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

  public async checkReqRevIndex(
    reqIndex: number | 'latest',
    identity: IPublicIdentity
  ): Promise<number> {
    const maxIndex = await this.getRevIndex(identity)
    if (typeof reqIndex === 'number') {
      this.chainErrHandler.checkRevIndex(identity.address, reqIndex, maxIndex)
      return reqIndex
    }
    return maxIndex
  }
}
