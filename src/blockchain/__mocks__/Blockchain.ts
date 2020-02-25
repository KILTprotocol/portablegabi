import api from './BlockchainApi'
import Blockchain from '../Blockchain'
import { ApiPromise } from '@polkadot/api'
import { IPortablegabiApi } from '../../types/Chain'

const BlockchainMock: Blockchain = new Blockchain(
  'portablegabi',
  (api as unknown) as ApiPromise & IPortablegabiApi<'portablegabi'>
)
export default BlockchainMock
