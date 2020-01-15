import WasmHooks from './WasmHooks'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./new_wasm_exec')
// const goWasm = require('./test')

const GoInstance = goWasm.GoWasm.init()

const goWasmExec = <T>(
  goHook: WasmHooks,
  args?: string[] | number[]
): Promise<T> =>
  Promise.resolve(GoInstance).then(wasm => wasm.execWasmFn(goHook, args))

export const goWasmExecCustom = <T>(
  goHook: WasmHooks,
  customGoInstance: any,
  args?: string[] | number[]
): Promise<T> => customGoInstance.execWasmFn(goHook, args)

export const goWasmClose = (): Promise<void> =>
  Promise.resolve(GoInstance).then(wasm => wasm.close())

export default goWasmExec
