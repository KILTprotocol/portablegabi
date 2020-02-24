import { hexToString } from '@polkadot/util'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { Codec } from '@polkadot/types/types'
import BlockchainError from './BlockchainError'
import { IBlockchainApi, IPortablegabiApi, PgabiModName } from '../types/Chain'
import Accumulator from '../attestation/Accumulator'

export default class Blockchain implements IBlockchainApi {
  public api: ApiPromise & IPortablegabiApi<PgabiModName>
  private chainmod: PgabiModName

  public constructor(
    chainmod: PgabiModName,
    api: ApiPromise & IPortablegabiApi<typeof chainmod>
  ) {
    this.api = api as ApiPromise & IPortablegabiApi<typeof chainmod>
    if (!(chainmod in api.query)) {
      throw BlockchainError.missingModule(chainmod)
    }
    this.chainmod = chainmod as typeof chainmod
  }

  public async waitForNextBlock(): Promise<void> {
    const currBlock = (await this.api.rpc.chain.getHeader()).number.toNumber()
    return new Promise(resolve =>
      this.api.rpc.chain.subscribeNewHeads(header => {
        if (header.number.toNumber() > currBlock) resolve()
      })
    )
  }

  public async getAccumulatorCount(address: string): Promise<number> {
    const count = await this.api.query[this.chainmod].accumulatorCount(address)
    return parseInt(count.toString(), 10)
  }

  // check for existing accumulator count and return max index for query
  private async getMaxIndex(address: string): Promise<number> {
    const maxIndex = (await this.getAccumulatorCount(address)) - 1
    if (maxIndex < 0) {
      throw BlockchainError.maxIndexZero(address)
    }
    return maxIndex
  }

  // check for existing accumulator count and whether given index exceeds maxIndex
  private async checkIndex(address: string, index: number): Promise<void> {
    const maxIndex = await this.getMaxIndex(address)
    if (index > maxIndex || index < 0) {
      throw BlockchainError.indexOutOfRange(address, index, maxIndex)
    }
  }

  // check whether codec is empty and convert codec->string->hex->accumulator
  private static async codecToAccumulator(
    address: string,
    codec: Codec,
    index: number
  ): Promise<Accumulator> {
    if (codec.isEmpty || (!codec.isEmpty && codec.toString().length < 2)) {
      throw BlockchainError.missingAccAtIndex(address, index)
    }
    return new Accumulator(hexToString(codec.toString()))
  }

  public async getAccumulator(
    address: string,
    index: number
  ): Promise<Accumulator> {
    // check whether endIndex > accumulatorCount
    await this.checkIndex(address, index)

    // query accumulator at index
    const codec: Codec = await this.api.query[this.chainmod].accumulatorList([
      address,
      index,
    ])

    // convert codec to accumulator
    return Blockchain.codecToAccumulator(address, codec, index)
  }

  public async getAccumulatorArray(
    address: string,
    startIndex: number,
    _endIndex?: number
  ): Promise<Accumulator[]> {
    if (_endIndex) {
      // check whether endIndex > accumulatorCount
      await this.checkIndex(address, _endIndex)
    }
    const endIndex = _endIndex || (await this.getMaxIndex(address))
    // create [[address, startIndex], ..., [address, endIndex]] for multi query
    const multiQuery = new Array(endIndex - startIndex)
      .fill(startIndex)
      .map((x, i) => [address, x + i])

    // do multi query
    const codecArr: Codec[] = await this.api.query[
      this.chainmod
    ].accumulatorList.multi(multiQuery)

    // convert codecs to accumulators
    return Promise.all(
      codecArr.map((codec, i) =>
        Blockchain.codecToAccumulator(address, codec, i + startIndex)
      )
    )
  }

  public async getLatestAccumulator(address: string): Promise<Accumulator> {
    const maxIndex = await this.getMaxIndex(address)
    return this.getAccumulator(address, maxIndex)
  }

  public async updateAccumulator(
    address: KeyringPair,
    _accumulator: Accumulator
  ): Promise<void> {
    const update = await this.api.tx[this.chainmod].updateAccumulator(
      _accumulator.valueOf()
    )
    await update.signAndSend(address)
  }
}
