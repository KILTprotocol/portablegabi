import { Codec } from '@polkadot/types/types'
import { SubmittableExtrinsic, AugmentedQuery } from '@polkadot/api/types'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import Accumulator from '../attestation/Accumulator'

/**
 * The module name which exposes the portablegabi API.
 */
export type PgabiModName = 'portablegabi' | 'portablegabiPallet' | string

export interface IPortablegabiApi<T extends PgabiModName> {
  query: {
    [K in T]: {
      accumulatorList: AugmentedQuery<
        'promise',
        ([address, index]: [string, number]) => Promise<Codec>
      >
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
  getAccumulatorArray: (
    address: string,
    startIndex: number,
    _endIndex?: number
  ) => Promise<Accumulator[]>
  getLatestAccumulator: (address: string) => Promise<Accumulator>
  updateAccumulator: (
    address: KeyringPair,
    accumulator: Accumulator
  ) => Promise<void>
  waitForNextBlock: () => Promise<void>
}
