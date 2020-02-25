import { hexToString } from '@polkadot/util'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { Codec } from '@polkadot/types/types'
import BlockchainError from './BlockchainError'
import { IBlockchainApi, IPortablegabiApi, PgabiModName } from '../types/Chain'
import Accumulator from '../attestation/Accumulator'

/**
 * The Blockchain class provides an interface to the for querying and creating transactions on chain.
 */
export default class Blockchain implements IBlockchainApi {
  public api: ApiPromise & IPortablegabiApi<PgabiModName>
  private chainmod: PgabiModName

  /**
   * Create a new Blockchain API instance.
   *
   * @param chainmod The name of the chain module that provides the portablegabi API.
   * @param api The api connection to the chain.
   */
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

  /**
   * Wait until a block was finalized.
   */
  public async waitForNextBlock(): Promise<void> {
    const currBlock = (await this.api.rpc.chain.getHeader()).number.toNumber()
    return new Promise(resolve =>
      this.api.rpc.chain.subscribeNewHeads(header => {
        if (header.number.toNumber() > currBlock) resolve()
      })
    )
  }

  /**
   * Get the number of stored [[Accumulator]]s for a specific [[Attester]].
   *
   * @param address The address of the [[Attester]].
   * @returns The number of the [[Attester]]'s [[Accumulator]]s.
   */
  public async getAccumulatorCount(address: string): Promise<number> {
    const count = await this.api.query[this.chainmod].accumulatorCount(address)
    return parseInt(count.toString(), 10)
  }

  /**
   * Check for existing [[Accumulator]] count and return max index for query.
   *
   * @param address The chain address of the [[Attester]].
   * @throws {BlockchainError.maxIndexZero} If the address does not have an [[Accumulator]] stored yet.
   * @returns The accumulator count minus one.
   */
  private async getMaxIndex(address: string): Promise<number> {
    const maxIndex = (await this.getAccumulatorCount(address)) - 1
    if (maxIndex < 0) {
      throw BlockchainError.maxIndexZero(address)
    }
    return maxIndex
  }

  /**
   * Check for existing [[Accumulator]] count and whether given index exceeds maxIndex.
   *
   * @param address The chain address of the [[Attester]].
   * @param index The index of the [[Accumulator]].
   * @throws {BlockchainError.indexOutOfRange} If the requested index is less than zero or greater than the maximum index.
   */
  private async checkIndex(address: string, index: number): Promise<void> {
    const maxIndex = await this.getMaxIndex(address)
    if (index > maxIndex || index < 0) {
      throw BlockchainError.indexOutOfRange(address, index, maxIndex)
    }
  }

  /**
   * Check whether codec is empty and convert codec->string->hex->accumulator.
   *
   * @param address The chain address of the [[Attester]].
   * @param codec The raw [[Accumulator]].
   * @param index The index of the [[Accumulator]].
   * @throws {BlockchainError.missingAccIndex} If there is no [[Accumulator]] at the specified index.
   * @returns An [[Accumulator]].
   */
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

  /**
   * Fetches a single [[Accumulator]] from the chain.
   *
   * @param address The on chain address of the [[Attester]].
   * @param index The index of the [[Accumulator]] to fetch.
   * @returns The [[Accumulator]] at the specified index.
   */
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

  /**
   * Fetches multiple [[Accumulators]] at once.
   *
   * @param address The chain address of the [[Attester]].
   * @param startIndex The index of the first [[Accumulator]] to fetch.
   * @param _endIndex The index of the last [[Accumulator]] to fetch.
   * @returns An array of [[Accumulator]]s from startIndex to endIndex or the latest one.
   */
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

  /**
   * Fetches the last published [[Accumulator]] for the specified [[Attester]].
   *
   * @param address The chain address of the [[Attester]].
   * @returns The last published [[Accumulator]].
   */
  public async getLatestAccumulator(address: string): Promise<Accumulator> {
    const maxIndex = await this.getMaxIndex(address)
    return this.getAccumulator(address, maxIndex)
  }

  /**
   * Pushes a new [[Accumulator]] on chain.
   *
   * @param address The chain address of the [[Attester]].
   * @param accumulator The new [[Accumulator]].
   */
  public async updateAccumulator(
    address: KeyringPair,
    accumulator: Accumulator
  ): Promise<void> {
    const update = await this.api.tx[this.chainmod].updateAccumulator(
      accumulator.valueOf()
    )
    await update.signAndSend(address)
  }
}
