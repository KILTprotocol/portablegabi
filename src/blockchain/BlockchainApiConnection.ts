/**
 * Blockchain Api Connection enables the building and accessing of the KILT [[Blockchain]] connection. In which it keeps one connection open and allows to reuse the connection for all [[Blockchain]] related tasks.
 * ***
 * Other modules can access the [[Blockchain]] as such: `const blockchain = await connect()`.
 * @module BlockchainApiConnection
 * @preferred
 */

/**
 * Dummy comment needed for correct doc display, do not remove.
 */
import { ApiPromise, WsProvider } from '@polkadot/api'
import Blockchain, { IBlockchainApi } from './Blockchain'

export const DEFAULT_WS_ADDRESS = 'ws://127.0.0.1:9944'

let instance: Promise<IBlockchainApi> | null

export async function buildConnection(
  host: string = DEFAULT_WS_ADDRESS
): Promise<IBlockchainApi> {
  const provider = new WsProvider(host)
  const api: ApiPromise = await ApiPromise.create({
    provider,
  })
  return new Blockchain(api)
}

export async function getCached(host: string): Promise<IBlockchainApi> {
  if (!instance) {
    instance = buildConnection(host)
  }
  return instance
}

export async function connect(
  host: string = DEFAULT_WS_ADDRESS
): Promise<IBlockchainApi> {
  return getCached(host)
}

export function clearCache(): null {
  instance = null
  return instance
}

export async function disconnect(
  host: string = DEFAULT_WS_ADDRESS
): Promise<void> {
  await (await getCached(host)).api.disconnect()
  clearCache()
}

export default connect
