import api from './BlockchainApi'
import Blockchain, { IPortablegabiApi } from '../Blockchain'
import { ApiPromise } from '@polkadot/api'

const BlockchainMock: Blockchain = new Blockchain(
  'portablegabi',
  (api as unknown) as ApiPromise & IPortablegabiApi<'portablegabi'>
)
export default BlockchainMock
