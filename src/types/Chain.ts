import { Codec } from '@polkadot/types/types'
import { SubmittableExtrinsic, AugmentedQuery } from '@polkadot/api/types'
import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import Accumulator from '../attestation/Accumulator'

/**
 * The module name which exposes the portablegabi API.
 */
export type PgabiModName = 'portablegabi' | 'portablegabiPallet' | string

/**
 * The default key type for the attester identities.
 */
export const DEFAULT_KEY_TYPE = 'sr25519'

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
}
