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
    const credUpdate = new Credential(this.valueOf())
    if (accumulators.length === 1) {
      return credUpdate.updateSingle({
        attesterPubKey,
        accumulator: accumulators[0],
      })
    }
    return credUpdate.updateRange({
      attesterPubKey,
      accumulators,
    })
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
