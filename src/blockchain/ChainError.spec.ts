import chainErrHandler, { BlockchainError } from './ChainError'

function expectError(
  fn: typeof chainErrHandler[keyof typeof chainErrHandler],
  fnArgs: Parameters<typeof chainErrHandler[keyof typeof chainErrHandler]>,
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
  describe('Test accumulator index error handling', () => {
    it('Should throw "Missing accumulator..."', () => {
      maxIndex = -1
      expectError(
        chainErrHandler.checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.maxIndexZero(address)
      )
    })
    it('Should throw accumulator indexOutOfRange Error', () => {
      index = 2
      maxIndex = 1
      expectError(
        chainErrHandler.checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('accumulator', address, index, maxIndex)
      )
    })
    it('Should throw accumulator indexOutOfRange Error for negative index', () => {
      index = -1
      maxIndex = 2
      expectError(
        chainErrHandler.checkAccIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('accumulator', address, index, maxIndex)
      )
    })
    it('Should not throw for valid input in checkAccIndex', () => {
      index = 1
      maxIndex = 2
      let errorMessage
      try {
        chainErrHandler.checkAccIndex(address, index, maxIndex)
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
        chainErrHandler.checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.missingRevIndex(address)
      )
    })
    it('Should throw revocation indexOutOfRange Error', () => {
      index = 2
      maxIndex = 1
      expectError(
        chainErrHandler.checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('revocation', address, index, maxIndex)
      )
    })
    it('Should throw revocation indexOutOfRange Error for negative index', () => {
      index = -1
      maxIndex = 2
      expectError(
        chainErrHandler.checkRevIndex,
        [address, index, maxIndex],
        BlockchainError.indexOutOfRange('revocation', address, index, maxIndex)
      )
    })
    it('Should not throw for valid input in checkRevIndex', () => {
      index = 1
      maxIndex = 2
      let errorMessage
      try {
        chainErrHandler.checkRevIndex(address, index, maxIndex)
      } catch (e) {
        errorMessage = e.message
      }
      expect(errorMessage).toBeUndefined()
    })
  })
})
