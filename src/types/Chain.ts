import { Codec } from '@polkadot/types/types'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import Accumulator from '../attestation/Accumulator'
import { IPublicIdentity } from './Attestation'

export type PgabiModName = 'portablegabi' | 'portablegabiPallet' | string
export interface IPortablegabiApi<T extends PgabiModName> {
  query: {
    [K in T]: {
      accumulatorList: ([address, index]: [string, number]) => Promise<Codec>
      accumulatorCount: (address: string) => Promise<Codec>
    }
  }
  tx: {
    [K in T]: {
      updateAccumulator: (
        accumulatorValue: string
      ) => SubmittableExtrinsic<'promise'>
    }
  }
}

export interface IBlockchainApi {
  api: ApiPromise & IPortablegabiApi<PgabiModName>
  getAccumulatorCount: (address: string) => Promise<number>
  getAccumulator: (address: string, index: number) => Promise<Accumulator>
  getLatestAccumulator: (address: string) => Promise<Accumulator>
  getRevIndex: (publicIdentity: IPublicIdentity) => Promise<number>
  updateAccumulator: (
    address: KeyringPair,
    accumulator: Accumulator
  ) => Promise<void>
  waitForNextBlock: () => Promise<void>
  checkReqRevIndex: (
    reqIndex: number | 'latest',
    identity: IPublicIdentity
  ) => Promise<number>
}
