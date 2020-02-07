import api from './BlockchainApi'
import Blockchain from '../Blockchain'
import { ApiPromise } from '@polkadot/api'

const BlockchainMock: Blockchain = new Blockchain(
  (api as unknown) as ApiPromise
)
export default BlockchainMock
