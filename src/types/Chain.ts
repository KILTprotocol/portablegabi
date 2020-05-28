import { Codec, AnyFunction } from '@polkadot/types/types'
import {
  SubmittableExtrinsic,
  MethodResult,
  StorageEntryBase,
  ApiTypes,
} from '@polkadot/api/types'
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

/** @internal */
export type AugmentedQuery<
  ApiType extends ApiTypes,
  F extends AnyFunction
> = MethodResult<ApiType, F> & StorageEntryBase<ApiType, F>

/** @internal */
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
      buildUpdateAccumulatorTX: (
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
  buildUpdateAccumulatorTX: (
    accumulator: Accumulator
  ) => SubmittableExtrinsic<'promise'>

  signAndSend(
    tx: SubmittableExtrinsic<'promise'>,
    keypair: KeyringPair
  ): Promise<void>
}
