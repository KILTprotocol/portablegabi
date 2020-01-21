import { goWasmClose } from '../wasm/wasm_exec_wrapper'

afterAll(() => {
  goWasmClose()
})

describe('Test verifier', () => {
  it.todo('issue Attestation')
})
