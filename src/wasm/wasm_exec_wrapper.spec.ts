import goWasmExec from './wasm_exec_wrapper'
import WasmHooks from './WasmHooks'
import { Spy } from '../testSetup/testTypes'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec')

describe('Test WASM wrapper', () => {
  let spy: Spy<''>
  const hooksArr: string[] = Object.keys(WasmHooks).filter(
    x =>
      x !== WasmHooks.genKeypair && // takes too much time
      x !== WasmHooks.genKey && // works
      x !== WasmHooks.keyFromMnemonic // FIXME: Uncaught Go Error panic: runtime error: index out of range [1] with length 1
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
  it('Checks proper instantiation + closing of WASM', async () => {
    const GoInstance = await goWasm.GoWasm.init()
    const wasmExitSpy: jest.SpyInstance = jest
      .spyOn(GoInstance, 'exit')
      .mockImplementation()
    expect(GoInstance).toBeDefined()
    GoInstance.close()
    expect(wasmExitSpy).toHaveBeenCalledWith(0)
  })
  it.each(hooksArr)(
    'Should throw calling %s without input',
    async wasmHook => {
      await expect(goWasmExec(wasmHook as WasmHooks)).rejects.toThrow(
        goWasm.WasmError
      )
    },
    1000
  )
  it('Should not throw calling genKey without input', async () => {
    await goWasmExec(WasmHooks.genKey)
  })
})
