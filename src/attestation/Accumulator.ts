import BlockchainError from '../blockchain/ChainError'
import { AttesterPublicKey } from '../types/Attestation'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'

export default class Accumulator extends String {
  // get revocation index
  public async getRevIndex(
    publicKey: AttesterPublicKey,
    chainAddress?: string
  ): Promise<number> {
    const index = await goWasmExec<string>(WasmHooks.getAccumulatorIndex, [
      publicKey.valueOf(),
      this.valueOf(),
    ]).catch(e => {
      if (chainAddress) {
        throw BlockchainError.missingRevIndex(chainAddress)
      }
      if (e.message.includes('ecdsa signature')) {
        throw e
      }
      throw Error(`Missing revocation index in accumulator "${this.valueOf()}"`)
    })
    return Number.parseInt(index, 10)
  }
}
