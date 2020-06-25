import { AttesterPublicKey } from '../types/Attestation'
import goWasmExec, { wasmStringify } from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import WasmData from '../types/Wasm'

/**
 * The Accumulator is necessary to issue and revoke [[Attestation]]s of [[Credential]]s.
 */
export default class Accumulator extends WasmData {
  /**
   * Get the timestamp when the [[Accumulator]] was created.
   *
   * @param attesterPublicKey The public key of the [[Attester]] who created the [[Accumulator]].
   * @returns A date.
   */
  public async getDate(attesterPublicKey: AttesterPublicKey): Promise<Date> {
    const timestamp = await goWasmExec<string>(
      WasmHooks.getAccumulatorTimestamp,
      [wasmStringify(attesterPublicKey), this.toString()]
    )
    return new Date(JSON.parse(timestamp))
  }
}
