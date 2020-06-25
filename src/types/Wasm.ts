/* eslint-disable @typescript-eslint/no-explicit-any */
import WasmHooks from '../wasm/WasmHooks'

/** @internal */
export interface IGoWasm {
  execWasmFn: (
    fn: WasmHooks,
    fnArgs?: Array<string | number | boolean>
  ) => Promise<any>
  close: () => void
  // from wasm_exec.js
  env: Record<string, any>
  argv: ['js']
  exit: (code: number) => void
  _exitPromise: (resolve: any) => void
  _pendingEvent: null | number
  _scheduledTimeouts: Map<any, any>
  _nextCallbackTimeoutID: number
  importObject: {
    go: {
      'runtime.wasmExit': () => void
      'runtime.wasmWrite': () => void
      'runtime.walltime': () => void
      'runtime.scheduleTimeoutEvent': () => void
      'runtime.clearTimeoutEvent': () => void
      'runtime.getRandomData': () => void
      'syscall/js.stringVal': () => void
      'syscall/js.valueGet': () => void
      'syscall/js.valueSet': () => void
      'syscall/js.valueIndex': () => void
      'syscall/js.valueSetIndex': () => void
      'syscall/js.valueCall': () => void
      'syscall/js.valueInvoke': () => void
      'syscall/js.valueNew': () => void
      'syscall/js.valueLength': () => void
      'syscall/js.valuePrepareString': () => void
      'syscall/js.valueLoadString': () => void
      'syscall/js.valueInstanceOf': () => void
      'syscall/js.copyBytesToGo': () => void
      'syscall/js.copyBytesToJS': () => void
      debug: (value: any) => void
    }
  }
  run: () => void
  _resume: () => void
  _makeFuncWrapper: () => void
}

/**
 * A wrapper for data received from WASM callbacks.
 */
export default class WasmData {
  private wasmData: string

  public constructor(wasmData: string) {
    this.wasmData = wasmData
  }

  /**
   * Serializes the WASM data into JSON.
   *
   * @returns An object of the serialized data string.
   */
  public parse(): { [key: string]: any } {
    return JSON.parse(this.wasmData)
  }

  /**
   * Getter for string of WASM data.
   *
   * @returns A string of the WASM data which can be serialized.
   */
  public toString(): string {
    return this.wasmData
  }
}
