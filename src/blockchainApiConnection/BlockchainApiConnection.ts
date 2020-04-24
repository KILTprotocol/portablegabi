/**
 * Blockchain Api Connection enables the building and accessing of your Substrate [[Blockchain]] connection.
 * In which it keeps one connection open and allows to reuse the connection for all [[Blockchain]] related tasks.
 *
 * Other modules can access the [[Blockchain]] as such: `const blockchain = await connect()`.
 *
 * @module BlockchainApiConnection
 */
import { ApiPromise, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
import { RegistryTypes } from '@polkadot/types/types'
import Blockchain from '../blockchain/Blockchain'
import { PgabiModName, IPortablegabiApi } from '../types/Chain'

export interface IPortableGabiApiOptions extends ApiOptions {
  host?: string
  pgabiModName?: PgabiModName
}

const DEFAULT_WS_ADDRESS = 'ws://127.0.0.1:9944'
const DEFAULT_MOD_NAME: PgabiModName = 'portablegabi'
const DEFAULT_TYPES: RegistryTypes = {}
const DEFAULT_PARAMS: IPortableGabiApiOptions = {
  host: DEFAULT_WS_ADDRESS,
  types: DEFAULT_TYPES,
  pgabiModName: DEFAULT_MOD_NAME,
}

let connectionCache: Promise<Blockchain> | null = null

/**
 * Connects to the specified node.
 *
 * @param p The parameter object.
 * @param p.host The host to connect with.
 * @param p.types Type mappings.
 * @param p.pgabiModName The module name which exposes the portablegabi API.
 */
export async function buildConnection({
  host = DEFAULT_WS_ADDRESS,
  types = DEFAULT_TYPES,
  pgabiModName = DEFAULT_MOD_NAME,
}: IPortableGabiApiOptions = DEFAULT_PARAMS): Promise<Blockchain> {
  const provider = new WsProvider(host)
  const api: ApiPromise = await ApiPromise.create({
    provider,
    types,
  })
  return new Blockchain(
    pgabiModName,
    api as ApiPromise & IPortablegabiApi<typeof pgabiModName>
  )
}

/**
 * Connect to a node or return an already established connection.
 *
 * @param p The parameter object.
 * @param p.host The host to connect with.
 * @param p.types Type mappings.
 * @param p.pgabiModName The module name which exposes the portablegabi API.
 */
export async function getCached({
  host = DEFAULT_WS_ADDRESS,
  types = DEFAULT_TYPES,
  pgabiModName = DEFAULT_MOD_NAME,
}: IPortableGabiApiOptions = DEFAULT_PARAMS): Promise<Blockchain> {
  if (!connectionCache) {
    connectionCache = buildConnection({ host, types, pgabiModName })
  }
  return connectionCache
}

/**
 * Connect to a node or return an already established connection.
 *
 * @param p The parameter object.
 * @param p.host The host to connect with.
 * @param p.types Type mappings.
 * @param p.pgabiModName The module name which exposes the portablegabi API.
 */
export async function connect({
  host = DEFAULT_WS_ADDRESS,
  types = DEFAULT_TYPES,
  pgabiModName = DEFAULT_MOD_NAME,
}: IPortableGabiApiOptions = DEFAULT_PARAMS): Promise<Blockchain> {
  return getCached({ host, types, pgabiModName })
}

/**
 * Remove the cached connection.
 */
export function clearCache(): void {
  connectionCache = null
}

/**
 * Disconnect from the specified host.
 *
 * @param host The host to disconnect from.
 */
export async function disconnect(
  host: string = DEFAULT_WS_ADDRESS
): Promise<void> {
  const bc = await getCached({ host })
  bc.api.disconnect()
  clearCache()
}

export default connect
