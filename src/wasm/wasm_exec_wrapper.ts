import WasmHooks from './WasmHooks'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const GoInstance = goWasm.GoWasm.init()

const goWasmExec = <T>(
  goHook: WasmHooks,
  args?: Array<string | number | boolean | string[]>
): Promise<T> =>
  Promise.resolve(GoInstance).then(wasm => wasm.execWasmFn(goHook, args))

export const goWasmClose = (): Promise<void> =>
  Promise.resolve(GoInstance).then(wasm => {
    return wasm.close()
  })

export default goWasmExec
