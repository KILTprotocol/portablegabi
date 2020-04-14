import WasmHooks from './WasmHooks'
import IGoWasm from '../types/Wasm'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const GoInstance: Promise<IGoWasm> = goWasm.GoWasm.init()

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
  Promise.resolve(GoInstance).then((wasm) => wasm.execWasmFn(goHook, args))

// eslint-disable-next-line jsdoc/require-returns
/**
 * Closes the wasm instance.
 */
export const goWasmClose = (): Promise<void> =>
  Promise.resolve(GoInstance).then((wasm) => {
    return wasm.close()
  })

export default goWasmExec
