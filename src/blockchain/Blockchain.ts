import { hexToString } from '@polkadot/util'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import BlockchainError, { checkAccIndex, checkRevIndex } from './ChainError'
import { IPublicIdentity } from '../types/Attestation'
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
    let nextBlock = currBlock
    return new Promise(resolve =>
      this.api.rpc.chain.subscribeNewHeads(header => {
        nextBlock = header.number.toNumber()
        if (nextBlock > currBlock) resolve()
      })
    )
  }

  public async getAccumulatorCount(address: string): Promise<number> {
    const count = await this.api.query[this.chainmod].accumulatorCount(address)
    return parseInt(count.toString(), 10)
  }

  public async getAccumulator(
    address: string,
    index: number
  ): Promise<Accumulator> {
    const codec = await this.api.query[this.chainmod].accumulatorList([
      address,
      index,
    ])
    if (codec.isEmpty || (!codec.isEmpty && codec.toString().length < 2)) {
      const maxIndex = (await this.getAccumulatorCount(address)) - 1
      checkAccIndex(address, index, maxIndex)
    }
    return new Accumulator(hexToString(codec.toString()))
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

  public async checkReqRevIndex(
    reqIndex: number | 'latest',
    identity: IPublicIdentity
  ): Promise<number> {
    const maxIndex = await this.getRevIndex(identity)
    if (typeof reqIndex === 'number') {
      checkRevIndex(identity.address, reqIndex, maxIndex)
      return reqIndex
    }
    return maxIndex
  }
}
