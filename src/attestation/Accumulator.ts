import { AttesterPublicKey } from '../types/Attestation'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'

export default class Accumulator extends String {
  // get revocation index
  public async getRevIndex(publicKey: AttesterPublicKey): Promise<number> {
    return Number.parseInt(
      await goWasmExec<string>(WasmHooks.getAccumulatorIndex, [
        publicKey.valueOf(),
        this.valueOf(),
      ]),
      10
    )
  }
}
