// eslint-disable-next-line @typescript-eslint/no-var-requires
const { goWasmClose } = require('../wasm/wasm_exec_wrapper')

module.exports = async function teardown() {
  return goWasmClose()
}
