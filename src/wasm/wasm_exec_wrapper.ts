/**
 * @ignore
 * @packageDocumentation
 */
import WasmHooks from './WasmHooks'
import WasmData, { IGoWasm } from '../types/Wasm'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const GoInstance: Promise<IGoWasm> = goWasm.GoWasm.init()

let isClosed = false

/**
 * Loads the Go wasm instance.
 *
 * @returns A promise of the Go wasm instance.
 * @internal
 */
export const goWasmInit = (): Promise<IGoWasm> => Promise.resolve(GoInstance)

/**
 * Calls a function from the Go wasm.
 *
 * @param goHook The name of the function which should be called.
 * @param args The arguments for the function call put into an array.
 * @returns A promise of the Go wasms function call.
 * @internal
 */
const goWasmExec = <T>(
  goHook: WasmHooks,
  args?: Array<string | number | boolean>
): Promise<T> =>
  Promise.resolve(GoInstance)
    .then((wasm) => wasm.execWasmFn(goHook, args))
    .catch((e) => {
      // catches unresolved wasm calls despite calling goWasmClose
      if (isClosed) {
        process.exit(0)
      }
      throw e
    })

// eslint-disable-next-line jsdoc/require-returns
/**
 * Closes the Go wasm channel.
 *
 * @internal
 */
export const goWasmClose = async (): Promise<void> => {
  isClosed = true
  const wasm = await GoInstance
  wasm.close()
  // closes Go channel
  return goWasmExec<void>(WasmHooks.closeWasm)
}

/**
 * A wrapper function to stringify an instance of [[WasmData]] or a dictionary.
 *
 * Reason: When shallow cloning OR deserializing a serialized instance of [[WasmData]],
 * the `[[WasmData.toString]]` method does not exist anymore or it might be overwritten by [[Object.toString]].
 *
 * @param arg The argument which should be stringified.
 * @returns A stringified version of the argument.
 */
export const wasmStringify = (
  arg: Record<string, unknown> | WasmData | string
): string => {
  // already stringified
  if (typeof arg === 'string') {
    return arg
  }
  // the instance we actually want
  if (arg instanceof WasmData) {
    return arg.toString()
  }
  return 'wasmData' in arg && typeof arg.wasmData === 'string'
    ? // due to deserialization of a serialized instance of WasmData is lost s.t. `toString()` does not exist
      arg.wasmData
    : // input was never an instance of WasmData
      JSON.stringify(arg)
}

export default goWasmExec
