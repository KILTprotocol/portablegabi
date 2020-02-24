import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from '../attestation/Accumulator'
import { AttesterPublicKey } from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

export default class Credential extends String {
  private parseCache: { updateCounter: number } | undefined

  private async updateSingle({
    attesterPubKey,
    accumulator,
  }: {
    attesterPubKey: AttesterPublicKey
    accumulator: Accumulator
  }): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.updateCredential, [
        this.valueOf(),
        accumulator.valueOf(),
        attesterPubKey.valueOf(),
      ])
    )
  }

  private async updateRange({
    attesterPubKey,
    accumulators,
  }: {
    attesterPubKey: AttesterPublicKey
    accumulators: Accumulator[]
  }): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.updateAllCredential, [
        this.valueOf(),
        `[${accumulators.join(',')}]`,
        attesterPubKey.valueOf(),
      ])
    )
  }

  public async update({
    attesterPubKey,
    accumulators,
  }: {
    attesterPubKey: AttesterPublicKey
    accumulators: Accumulator[]
  }): Promise<Credential> {
    if (accumulators.length === 1) {
      return this.updateSingle({
        attesterPubKey,
        accumulator: accumulators[0],
      })
    }
    try {
      const credUpdate = await this.updateRange({
        attesterPubKey,
        accumulators,
      })
      return credUpdate
    } catch (e) {
      // get revocation indices
      const indices = await Promise.all(
        accumulators.map(a => a.getRevIndex(attesterPubKey))
      )
      // sort indices
      const sorted = [...indices].sort((a, b) => a - b)
      // sort accumulators
      const sortedAccs = sorted.map(
        sortedIndex => accumulators[indices.indexOf(sortedIndex)]
      )
      return this.updateRange({
        attesterPubKey,
        accumulators: sortedAccs,
      })
    }
  }

  public async updateFromChain({
    attesterPubKey,
    attesterChainAddress,
    endIndex,
  }: {
    attesterPubKey: AttesterPublicKey
    attesterChainAddress: string
    endIndex?: number
  }): Promise<Credential> {
    const currIdx = this.getUpdateCounter()
    const chain = await connect()
    const accumulators = await chain.getAccumulatorArray(
      attesterChainAddress,
      currIdx,
      endIndex
    )
    return this.update({
      attesterPubKey,
      accumulators,
    })
  }

  public getUpdateCounter(): number {
    let parsed = this.parseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const counter =
        parsed && 'updateCounter' in parsed ? parsed.updateCounter : undefined
      if (typeof counter !== 'number') {
        throw new Error()
      }
      this.parseCache = parsed
      return counter
    } catch (e) {
      throw new Error('Invalid credential')
    }
  }
}
