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
      x !== WasmHooks.startAttestationSession && // issues
      x !== WasmHooks.keyFromMnemonic // issues
  )
  beforeEach(() => {
    spy = {
      exit: jest.spyOn(process, 'exit').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
    }
  })
  afterEach(() => {
    spy.exit.mockClear()
    spy.error.mockClear()
    spy.log.mockClear()
  })
  it('Checks proper instantiation + closing of WASM', async () => {
    const GoInstance = await goWasm.GoWasm.init()
    const wasmExitSpy: jest.SpyInstance = jest
      .spyOn(GoInstance, 'exit')
      .mockImplementation()
    expect(spy.log).toHaveBeenCalledWith('Instantiating WASM...')
    GoInstance.close()
    expect(wasmExitSpy).toHaveBeenCalledWith(0)
    expect(spy.exit).not.toHaveBeenCalled()
  })
  it.each(hooksArr)(
    'Should throw calling %s without input',
    async wasmHook => {
      await goWasmExec(wasmHook as WasmHooks)
      expect(spy.error).toHaveBeenCalled()
      expect(spy.log).not.toBeCalledWith('Instantiating WASM...')
      expect(spy.exit).not.toHaveBeenCalled()
    },
    1000
  )
  it('Should not throw calling genKey without input', async () => {
    await goWasmExec(WasmHooks.genKey)
    expect(spy.log).not.toBeCalledWith('Instantiating WASM...')
    expect(spy.exit).not.toHaveBeenCalled()
    expect(spy.error).not.toHaveBeenCalled()
  })
  // For unknown reasons these tests dont terminate in any timeout
  //   it('Should throw on calling startVerificationSession without input', async () => {
  //     await goWasmExec(WasmHooks.startVerificationSession, [])
  //     expect(spy.log).not.toBeCalledWith('Instantiating WASM...')
  //     expect(spy.error).toHaveBeenCalled()
  //   }, 20000)
  // it('Should throw on calling keyFromMnemonic without input', async () => {
  //   await goWasmExec(WasmHooks.keyFromMnemonic)
  //   expect(spy.log).not.toBeCalledWith('Instantiating WASM...')
  //   expect(spy.error).toHaveBeenCalled()
  // })
})
