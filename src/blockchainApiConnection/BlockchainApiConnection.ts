/**
 * * Blockchain Api Connection enables the building and accessing of the KILT [[Blockchain]] connection. In which it keeps one connection open and allows to reuse the connection for all [[Blockchain]] related tasks.
 * ***
 * Other modules can access the [[Blockchain]] as such: `const blockchain = await connect()`.
 * @module BlockchainApiConnection
 * @preferred
 */

/**
 * Dummy comment needed for correct doc display, do not remove.
 */
import { ApiPromise, WsProvider } from '@polkadot/api'
import Blockchain from '../blockchain/Blockchain'
import { PgabiModName, IBlockchainApi, IPortablegabiApi } from '../types/Chain'

type Params = {
  host?: string
  types?: Record<string, any>
  pgabiModName?: PgabiModName
}
const DEFAULT_WS_ADDRESS = 'ws://127.0.0.1:9944'
const DEFAULT_MOD_NAME: PgabiModName = 'portablegabi'
const DEFAULT_PARAMS: Params = {
  host: DEFAULT_WS_ADDRESS,
  types: {},
  pgabiModName: DEFAULT_MOD_NAME,
}

let instance: Promise<IBlockchainApi> | null

export async function buildConnection({
  host = DEFAULT_WS_ADDRESS,
  types = {},
  pgabiModName = DEFAULT_MOD_NAME,
}: Params = DEFAULT_PARAMS): Promise<IBlockchainApi> {
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

export async function getCached({
  host = DEFAULT_WS_ADDRESS,
  types = {},
  pgabiModName = DEFAULT_MOD_NAME,
}: Params = DEFAULT_PARAMS): Promise<IBlockchainApi> {
  if (!instance) {
    instance = buildConnection({ host, types, pgabiModName }) as Promise<
      IBlockchainApi
    >
  }
  return instance as Promise<IBlockchainApi>
}

export async function connect({
  host = DEFAULT_WS_ADDRESS,
  types = {},
  pgabiModName = DEFAULT_MOD_NAME,
}: Params = DEFAULT_PARAMS): Promise<IBlockchainApi> {
  return getCached({ host, types, pgabiModName })
}

export function clearCache(): void {
  instance = null
}

export async function disconnect(
  host: string = DEFAULT_WS_ADDRESS
): Promise<void> {
  await (await getCached({ host })).api.disconnect()
  clearCache()
}

export default connect
