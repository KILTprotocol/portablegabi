import WasmHooks from './WasmHooks'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

const goWasmExec = <T>(
  goHook: WasmHooks,
  args?: string[] | number[]
): Promise<T> => goWasm.exec(goHook, args)
export default goWasmExec
