import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from '../attestation/Accumulator'
import { AttesterPublicKey } from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

/**
 * The credential contains information which are used to create presentations.
 * It must be kept secret.
 */
export default class Credential extends String {
  private parseCache: { updateCounter: number } | undefined

  /**
   * This methods updates a credential using a new [[Accumulator]].
   * After an attester revoked an attestation all credentials need to be updated.
   *
   * @param p The parameter object.
   * @param p.attesterPubKey The [[PublicKey]] of the attester who attest the claim.
   * @param p.accumulator The new [[Accumulator]].
   * @returns An updated [[Credential]].
   */
  public async updateSingle({
    attesterPubKey,
    accumulator,
  }: {
    attesterPubKey: AttesterPublicKey
    accumulator: Accumulator
  }): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.updateCredential, [
        this.valueOf(),
        accumulator.valueOf(),
        attesterPubKey.valueOf(),
      ])
    )
  }

  /**
   * This methods updates a credential using a list of new [[Accumulator]]s.
   * After an attester revoked an attestation all credentials need to be updated.
   *
   * @param p The parameter object.
   * @param p.attesterPubKey The [[PublicKey]] of the attester who attest the claim.
   * @param p.accumulators The list of new [[Accumulator]]s.
   * @returns An updated [[Credential]].
   */
  public async update({
    attesterPubKey,
    accumulators,
  }: {
    attesterPubKey: AttesterPublicKey
    accumulators: Accumulator[]
  }): Promise<Credential> {
    return new Credential(
      await goWasmExec<string>(WasmHooks.updateAllCredential, [
        this.valueOf(),
        `[${accumulators.join(',')}]`,
        attesterPubKey.valueOf(),
      ])
    )
  }

  /**
   * This methods updates a credential.
   * For that it pulls all [[Accumulator]]s up to [[endIndex]] from the chain.
   *
   * @param p The parameter object.
   * @param p.attesterPubKey The [[PublicKey]] of the attester who attest the claim.
   * @param p.attesterChainAddress The chain address of the attester.
   * @param p.endIndex The index of the last accumulator. If not present all new [[Accumulators]] are pulled.
   * @returns An updated [[Credential]].
   */
  public async updateFromChain({
    attesterPubKey,
    attesterChainAddress,
    endIndex,
  }: {
    attesterPubKey: AttesterPublicKey
    attesterChainAddress: string
    endIndex?: number
  }): Promise<Credential> {
    const currIdx = this.getUpdateCounter()
    const chain = await connect()
    const accumulators = await chain.getAccumulatorArray(
      attesterChainAddress,
      currIdx,
      endIndex
    )
    return this.update({
      attesterPubKey,
      accumulators,
    })
  }

  /**
   * Returns the number of updates done.
   *
   * @returns The number of accumulator updates done with this credential.
   */
  public getUpdateCounter(): number {
    let parsed = this.parseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const counter =
        parsed && 'updateCounter' in parsed ? parsed.updateCounter : undefined
      if (typeof counter !== 'number') {
        throw new Error()
      }
      this.parseCache = parsed
      return counter
    } catch (e) {
      throw new Error('Invalid credential')
    }
  }
}
