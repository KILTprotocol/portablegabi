import BlockchainError from './BlockchainError'
import Blockchain from './Blockchain'
import api from './__mocks__/BlockchainApi'

jest.setTimeout(5000)

describe('Test chainErrHandler', () => {
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
})
