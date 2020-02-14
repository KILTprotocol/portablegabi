import BlockchainError, { checkAccIndex, checkRevIndex } from './ChainError'
import Blockchain from './Blockchain'
import api from './__mocks__/BlockchainApi'

function expectError(
  fn: typeof checkAccIndex | typeof checkRevIndex,
  // fn: typeof chainErrHandler[keyof typeof chainErrHandler],
  fnArgs: Parameters<typeof checkAccIndex | typeof checkRevIndex>,
  expectedError: BlockchainError
): void {
  let errorMessage = ''
  try {
    fn(...fnArgs)
  } catch (e) {
    errorMessage = e.message
  }
  expect(errorMessage).toBe(expectedError.message)
}

describe('Test chainErrHandler', () => {
  const address = 'dummyAddress'
  let maxIndex = 0
  let index = 0
  it('Should throw missingModule error', () => {
    // Note: This only throws because the mocked api is solely defined for 'portablegabi'
    try {
      const chain = new Blockchain('portablegabiPallet', api as any)
      expect(chain).toThrow()
    } catch (e) {
      expect(e.message).toBe(
        BlockchainError.missingModule('portablegabiPallet').message
      )
    }
  })
  describe('Test accumulator index error handling', () => {
    it('Should throw "Missing accumulator..."', () => {
      maxIndex = -1
      expectError(
        checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.maxIndexZero(address)
      )
    })
    it('Should throw accumulator indexOutOfRange Error', () => {
      index = 2
      maxIndex = 1
      expectError(
        checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('accumulator', address, index, maxIndex)
      )
    })
    it('Should throw accumulator indexOutOfRange Error for negative index', () => {
      index = -1
      maxIndex = 2
      expectError(
        checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('accumulator', address, index, maxIndex)
      )
    })
    it('Should not throw for valid input in checkAccIndex', () => {
      index = 1
      maxIndex = 2
      let errorMessage
      try {
        checkAccIndex(address, index, maxIndex)
      } catch (e) {
        errorMessage = e.message
      }
      expect(errorMessage).toBeUndefined()
    })
  })
  describe('Test revocation index error handling', () => {
    it('Should throw "Missing revocation index..."', () => {
      index = 0
      maxIndex = -1
      expectError(
        checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.missingRevIndex(address)
      )
    })
    it('Should throw revocation indexOutOfRange Error', () => {
      index = 2
      maxIndex = 1
      expectError(
        checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('revocation', address, index, maxIndex)
      )
    })
    it('Should throw revocation indexOutOfRange Error for negative index', () => {
      index = -1
      maxIndex = 2
      expectError(
        checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('revocation', address, index, maxIndex)
      )
    })
    it('Should not throw for valid input in checkRevIndex', () => {
      index = 1
      maxIndex = 2
      let errorMessage
      try {
        checkRevIndex(address, index, maxIndex)
      } catch (e) {
        errorMessage = e.message
      }
      expect(errorMessage).toBeUndefined()
    })
  })
})
