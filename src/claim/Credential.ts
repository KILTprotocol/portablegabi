import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from '../attestation/Accumulator'
import { AttesterPublicKey } from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import WasmData from '../types/Wasm'
import { ICredential } from '../types/Claim'

/**
 * The credential contains information which are used to create presentations.
 * It must be kept secret.
 */
export default class Credential extends WasmData {
  /**
   * This methods updates a [[Credential]] using a new [[Accumulator]].
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
        this.toString(),
        accumulator.toString(),
        attesterPubKey.toString(),
      ])
    )
  }

  /**
   * This methods updates a [[Credential]] using a list of new [[Accumulator]]s.
   * After an [[Attester]] revoked an [[Attestation]] all [[Credential]]s need to be updated.
   *
   * @param p The parameter object.
   * @param p.attesterPubKey The [[PublicKey]] of the [[Attester]] who attested the claim.
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
        this.toString(),
        `[${accumulators.join(',')}]`,
        attesterPubKey.toString(),
      ])
    )
  }

  /**
   * This methods updates a credential.
   * For that it pulls all [[Accumulator]]s up to [[endIndex]] from the chain.
   *
   * @param p The parameter object.
   * @param p.attesterPubKey The [[PublicKey]] of the [[Attester]] who attested the claim.
   * @param p.attesterChainAddress The on-chain address of the [[Attester]].
   * @param p.endIndex The index of the accumulator up to which the credential should get updated.
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
   * Returns the number of updates done. Combining this method with [[getLatestAccumulator]] in [[updateFromChain]],
   * it shows how many updates of this [[Credential]] would be required to be up to date.
   *
   * @throws `Invalid credential` If the credential does not have an `updateCounter` field.
   * @returns The number of accumulator updates done with this credential.
   */
  public getUpdateCounter(): number {
    try {
      const parsed = this.parse()
      const counter =
        parsed && 'updateCounter' in parsed ? parsed.updateCounter : undefined
      if (typeof counter !== 'number') {
        throw new Error()
      }
      return counter
    } catch (e) {
      throw new Error('Invalid credential')
    }
  }

  /**
   * Returns the date when this [[Credential]] has been updated the last time.
   *
   * @throws `Invalid credential` If the credential does not have an `Updated` field.
   * @returns The date of the [[Credential]]'s last update as ISO string.
   */
  public getDate(): Date {
    try {
      const parsed = this.parse()
      const date = parsed.credential.nonrevWitness.Updated
      if (typeof date === 'undefined') {
        throw new Error()
      }
      return new Date(date)
    } catch (e) {
      throw new Error('Invalid credential, missing updated date')
    }
  }

  public parse<T>(): ICredential<T> {
    return JSON.parse(this.toString())
  }
}
