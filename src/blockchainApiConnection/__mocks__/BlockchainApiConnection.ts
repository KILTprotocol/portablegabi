/**
 * @module BlockchainApiConnection
 */

/**
 * Dummy comment needed for correct doc display, do not remove
 */
import BlockchainMock from '../../blockchain/__mocks__/Blockchain'

export async function connect() {
  return Promise.resolve(BlockchainMock)
}

export default connect
