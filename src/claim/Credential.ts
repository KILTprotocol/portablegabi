import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import Accumulator from '../attestation/Accumulator'
import { AttesterPublicKey } from '../types/Attestation'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import { ICredential } from '../types/Claim'

/**
 * The credential contains information which are used to create presentations.
 * It must be kept secret.
 */
export default class Credential extends String {
  private counterParseCache: { updateCounter: number } | undefined
  private dateParseCache: ICredential<any> | undefined

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
        this.valueOf(),
        accumulator.valueOf(),
        attesterPubKey.valueOf(),
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
   * Compares the [[Credential]]'s date with another date.
   *
   * @param reqUpdatedAfter The comparison date.
   * @throws If the requested date is greater than the [[Credential]]'s one.
   * @returns Whether the [[Credential]] has been created or updated after the required one.
   */
  public checkDate(reqUpdatedAfter: Date): boolean {
    const credDate = this.getDate()
    if (reqUpdatedAfter.getTime() > credDate.getTime()) {
      throw new Error(
        `Credential is outdated, you need to update it with a newer accumulator!\n\t The current date of accumulator used to build/update the credential is "${credDate.toISOString()}" vs. the required one "${reqUpdatedAfter.toISOString()}".`
      )
    }
    return true
  }

  /**
   * Returns the date when this [[Credential]] has been updated the last time.
   *
   * @throws `Invalid credential` If the credential does not have an Updated field.
   * @returns The date of the [[Credential]]'s last update as ISO string.
   */
  public getDate(): Date {
    let parsed = this.dateParseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const date = parsed?.credential?.nonrevWitness?.Updated
      if (date && typeof date === 'string') {
        this.dateParseCache = parsed
        return new Date(date)
      }
      throw new Error()
    } catch (e) {
      throw new Error('Invalid credential, missing updated date')
    }
  }

  /**
   * Returns the number of updates done. Combining this method with [[getLatestAccumulator]] in [[updateFromChain]],
   * it shows how many updates of this [[Credential]] would be required to be up to date.
   *
   * @throws `Invalid credential` If the credential does not have an update counter.
   * @returns The number of [[Accumulator]] updates done with this [[Credential]].
   */
  public getUpdateCounter(): number {
    let parsed = this.counterParseCache
    try {
      parsed = JSON.parse(this.valueOf())
      const counter = parsed?.updateCounter
      if (typeof counter === 'number') {
        this.counterParseCache = parsed
        return counter
      }
      throw new Error()
    } catch (e) {
      throw new Error('Invalid credential, missing updateCounter')
    }
  }
}
