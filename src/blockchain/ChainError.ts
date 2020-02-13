export class BlockchainError extends Error {
  public static missingModule = (modName: string): BlockchainError =>
    new BlockchainError(
      `Cannot find module "${modName}" on chain. Did you mean to use one of the defaults? "portablegabi" or "portablegabiPallet"`
    )

  public static maxIndexZero = (address: string): BlockchainError =>
    new BlockchainError(`Missing accumulator for address "${address}"`)

  public static missingRevIndex = (address: string): BlockchainError =>
    new BlockchainError(`Missing revocation index for address "${address}"`)

  public static indexOutOfRange = (
    type: 'accumulator' | 'revocation',
    address: string,
    index: number,
    maxIndex: number
  ): BlockchainError =>
    new BlockchainError(
      `Requested ${type} index "${index}" for address "${address}" out of range [0, ${maxIndex}]`
    )
}

const chainErrHandler = {
  checkAccIndex: (address: string, index: number, maxIndex: number): void => {
    if (maxIndex < 0) {
      throw BlockchainError.maxIndexZero(address)
    }
    if (index > maxIndex || index < 0) {
      throw BlockchainError.indexOutOfRange(
        'accumulator',
        address,
        index,
        maxIndex
      )
    }
  },
  checkRevIndex: (address: string, index: number, maxIndex: number): void => {
    if (maxIndex < 0) {
      throw BlockchainError.missingRevIndex(address)
    }
    if (index > maxIndex || index < 0) {
      throw BlockchainError.indexOutOfRange(
        'revocation',
        address,
        index,
        maxIndex
      )
    }
  },
}
export default chainErrHandler
