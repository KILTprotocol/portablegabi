import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from '../attestation/Accumulator'
import { AttesterPublicKey } from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

export default class Credential extends String {
  private parseCache: object | undefined

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
    let credUpdate = new Credential(this.valueOf())
    if (accumulators.length === 1) {
      return credUpdate.updateSingle({
        attesterPubKey,
        accumulator: accumulators[0],
      })
    }
    try {
      credUpdate = await credUpdate.updateRange({
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
      return credUpdate.updateRange({
        attesterPubKey,
        accumulators: sortedAccs,
      })
    }
  }

  public async updateFromChain({
    attesterPubKey,
    attesterChainAddress,
    index,
  }: {
    attesterPubKey: AttesterPublicKey
    attesterChainAddress: string
    index?: number
  }): Promise<Credential> {
    const chain = await connect()
    const accumulator = index
      ? await chain.getAccumulator(attesterChainAddress, index)
      : await chain.getLatestAccumulator(attesterChainAddress)
    return this.updateSingle({
      attesterPubKey,
      accumulator,
    })
  }

  public getUpdateCounter(): number {
    const parsed = this.parseCache || JSON.parse(this.valueOf())
    const counter = parsed.updateCounter
    if (typeof counter !== 'number') {
      throw new Error('Invalid credential')
    }
    this.parseCache = parsed
    return counter
  }
}
