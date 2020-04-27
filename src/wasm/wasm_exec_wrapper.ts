import WasmHooks from './WasmHooks'
import IGoWasm from '../types/Wasm'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const GoInstance: Promise<IGoWasm> = goWasm.GoWasm.init()
let isClosed = false

/**
 * Loads the Go wasm instance.
 *
 * @returns A promise of the Go wasm instance.
 */
export const goWasmInit = (): Promise<IGoWasm> => Promise.resolve(GoInstance)

/**
 * Calls a function from the Go wasm.
 *
 * @param goHook The name of the function which should be called.
 * @param args The arguments for the function call put into an array.
 * @returns A promise of the Go wasms function call.
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
 */
export const goWasmClose = async (): Promise<void> => {
  isClosed = true
  const wasm = await GoInstance
  wasm.close()
  // closes Go channel
  return goWasmExec<void>(WasmHooks.closeWasm)
}

export default goWasmExec
