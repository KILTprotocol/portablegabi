import WasmHooks from './WasmHooks'
import IGoWasm from '../types/Wasm'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const GoInstance: Promise<IGoWasm> = goWasm.GoWasm.init()

export const goWasmInit = (): Promise<IGoWasm> => Promise.resolve(GoInstance)

const goWasmExec = <T>(
  goHook: WasmHooks,
  args?: Array<string | number | boolean>
): Promise<T> =>
  Promise.resolve(GoInstance).then(wasm => wasm.execWasmFn(goHook, args))

export const goWasmClose = (): Promise<void> =>
  Promise.resolve(GoInstance).then(wasm => {
    return wasm.close()
  })

export default goWasmExec
