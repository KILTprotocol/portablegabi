import goWasmExec, { goWasmClose, wasmStringify } from './wasm_exec_wrapper'
import WasmHooks from './WasmHooks'
import { Spy } from '../testSetup/testTypes'
import { WasmError } from './wasm_exec'
import WasmData from '../types/Wasm'

describe('Test WASM wrapper', () => {
  let spy: Spy<''>
  const hooksArr: string[] = Object.keys(WasmHooks).filter(
    (x) =>
      x !== WasmHooks.genKeypair && // # 1 takes too much time
      x !== WasmHooks.genKey && // #2 works w/o input
      x !== WasmHooks.closeWasm // #3 needs custom handling
  )
  beforeEach(() => {
    spy = {
      exit: jest.spyOn(process, 'exit').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
    }
  })
  afterEach(() => {
    expect(spy.error).not.toHaveBeenCalled()
    expect(spy.log).not.toHaveBeenCalled()
    expect(spy.exit).not.toHaveBeenCalled()
    spy.exit.mockClear()
    spy.error.mockClear()
    spy.log.mockClear()
  })
  it.each(hooksArr)(
    'Should throw calling %s without input',
    async (wasmHook) =>
      expect(goWasmExec(wasmHook as WasmHooks)).rejects.toThrow(WasmError),
    5000
  )
  it('Should not throw calling genKey without input', async () => {
    return expect(goWasmExec(WasmHooks.genKey)).resolves.toBeDefined()
  }, 5000)
})
it('Should exit on process when closing WASM with non empty event queue', async (done) => {
  jest.spyOn(process, 'exit').mockImplementation()
  const spy = {
    exit: jest.spyOn(process, 'exit').mockImplementation(),
  }
  setTimeout(async () => {
    try {
      await goWasmExec(WasmHooks.genKey)
    } catch (e) {
      expect(e.message).toContain('Go program has already exited')
      done()
    }
    return done
  }, 9000)
  await expect(goWasmClose()).resolves.toBe(1)
  expect(spy.exit).toHaveBeenCalledWith(0)
}, 10_000)
it('Should stringify any argument for wasm usage', () => {
  const obj = { x: '1' }
  const str = JSON.stringify(obj)
  const wasmData = new WasmData(str)
  // the case we want
  expect(wasmStringify(wasmData)).toBe(str)
  // should return the the serialized object
  expect(wasmStringify(str)).toBe(str)
  // should return the serialized object
  expect(wasmStringify(obj)).toBe(str)
  // this happens when deserializing a serialized instance of WasmData
  expect(wasmStringify({ wasmData: str })).toBe(str)
  // edge case of above
  expect(wasmStringify({ wasmData: obj })).toBe(
    JSON.stringify({ wasmData: obj })
  )
})
