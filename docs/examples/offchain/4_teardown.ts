import { goWasmClose } from '../../../src/wasm/wasm_exec_wrapper'
import { disconnect } from '../../../src/blockchainApiConnection/BlockchainApiConnection'

// checks whether outcome is true for all entries and throws error if not
function teardownCheck(outcomes: boolean[]): void {
  if (!outcomes.every(Boolean)) {
    // get indices for unmet expectation
    const indices = outcomes.reduce(
      (acc: number[], outcome, i) => (outcome ? acc : [...acc, i]),
      []
    )
    throw new Error(`Expectations not met for indices ${indices.toString()}`)
  }
}

// does teardown check, disconnects from chain and closes wasm
function teardown(
  type: 'onchain' | 'offchain',
  outcomes: boolean[]
): Promise<void> {
  teardownCheck(outcomes)
  if (type === 'offchain') {
    return goWasmClose()
  }
  return disconnect().finally(() => goWasmClose())
}

export default teardown
