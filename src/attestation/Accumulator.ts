import { AttesterPublicKey } from '../types/Attestation'
import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'

/**
 * This module contains the Accumulator class which is used to create, update and revoke [[Attestation]]s.
 */

/**
 * The Accumulator is necessary to issue and revoke [[Attestation]]s of [[Credential]]s.
 */
export default class Accumulator extends String {
  /**
   * Get the timestamp when the [[Accumulator]] was created.
   *
   * @param attesterPublicKey The public key of the [[Attester]] who created the [[Accumulator]].
   * @returns A date.
   */
  public async getDate(attesterPublicKey: AttesterPublicKey): Promise<Date> {
    const timestamp = await goWasmExec<string>(
      WasmHooks.getAccumulatorTimestamp,
      [attesterPublicKey.valueOf(), this.valueOf()]
    )
    return new Date(JSON.parse(timestamp))
  }
}
