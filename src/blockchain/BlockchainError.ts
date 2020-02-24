// eslint-disable-next-line jsdoc/require-returns
/**
 * A BlockchainError is thrown when we encounter an error on portablegabi chain actions.
 */
export default class BlockchainError extends Error {
  /**
   * If the portablegabi module declared in [[connect]] cannot be found.
   *
   * @param modName The portablegabi module name declared in [[connect]].
   * @returns An error.
   */
  public static missingModule = (modName: string): BlockchainError =>
    new BlockchainError(
      `Cannot find module "${modName}" on chain. Did you mean to use one of the defaults? "portablegabi" or "portablegabiPallet"`
    )

  /**
   * If no [[Accumulator]] can be found.
   *
   * @param address The substrate address of the keyring pair.
   * @returns An error.
   */
  public static maxIndexZero = (address: string): BlockchainError =>
    new BlockchainError(`Missing accumulator for address "${address}"`)

  public static missingRevIndex = (address: string): BlockchainError =>
    new BlockchainError(`Missing revocation index for address "${address}"`)

  /**
   * If no [[Accumulator]] at the specified index can be found.
   *
   * @param address The substrate address of the keyring pair.
   * @param index The index which was used in [[getAccumulator]].
   * @returns An error.
   */
  public static missingAccAtIndex = (
    address: string,
    index: number
  ): BlockchainError =>
    new BlockchainError(
      `Missing accumulator for address "${address}" at index ${index}`
    )

  /**
   * If the index for [[getAccumulator]] exceeds the accumulator count.
   *
   * @param address The substrate address of the keyring pair.
   * @param index The index which was in [[getAccumulator]].
   * @param maxIndex The accumulator count minus one.
   * @returns An error.
   */
  public static indexOutOfRange = (
    address: string,
    index: number,
    maxIndex: number
  ): BlockchainError =>
    new BlockchainError(
      `Requested accumulator index "${index}" for address "${address}" out of range [0, ${maxIndex}]`
    )
}
