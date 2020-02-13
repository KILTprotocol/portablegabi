/**
 * @module BlockchainApiConnection
 */

/**
 * Dummy comment needed for correct doc display, do not remove
 */
import BlockchainMock from '../../blockchain/__mocks__/Blockchain'
import Blockchain from '../../blockchain/Blockchain'

export async function connect(): Promise<Blockchain> {
  return Promise.resolve(BlockchainMock)
}

export default connect
