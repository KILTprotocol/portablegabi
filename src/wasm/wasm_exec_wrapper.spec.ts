import goWasmExec, { goWasmInit, goWasmClose } from './wasm_exec_wrapper'
import WasmHooks from './WasmHooks'
import { Spy } from '../testSetup/testTypes'
import { WasmError } from './wasm_exec'

describe('Test WASM wrapper', () => {
  let spy: Spy<''>
  const hooksArr: string[] = Object.keys(WasmHooks).filter(
    (x) => x !== WasmHooks.genKeypair && x !== WasmHooks.genKey // # 1 takes too much time, #2 works w/o input
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
    await goWasmExec(WasmHooks.genKey)
  })
  it('Checks proper instantiation + closing of WASM', async () => {
    const GoInstance = await goWasmInit()
    const wasmExitSpy: jest.SpyInstance = jest.spyOn(GoInstance, 'exit')
    expect(GoInstance).toBeDefined()
    await goWasmClose()
    expect(wasmExitSpy).toHaveBeenCalledWith(0)
  })
})
