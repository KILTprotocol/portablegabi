/* eslint-disable no-console */
import Blockchain from '../../../src/blockchain/Blockchain'
import GabiAttesterChain from '../../../src/attestation/GabiAttester.chain'
import Accumulator from '../../../src/attestation/Accumulator'
import GabiClaimerChain from '../../../src/claim/GabiClaimer.chain'
import issuanceProcess from '../offchain/2_issuanceProcess'
import { testEnv1 } from '../exampleConfig'
import { Witness } from '../../../src/types/Attestation'

export async function printAttesterChainStats(
  blockchain: Blockchain,
  address: string,
  logBefore?: string
): Promise<void> {
  if (logBefore) {
    console.log(logBefore)
  }
  console.table({
    'Number of accumulators': await blockchain.getAccumulatorCount(address),
    'Latest accumulator': await (
      await blockchain.getLatestAccumulator(address)
    ).valueOf(),
  })
}

async function revocationProcess(
  blockchain: Blockchain,
  claimer: GabiClaimerChain,
  attester: GabiAttesterChain,
  accumulator: Accumulator,
  _witnesses?: Witness[]
): Promise<Accumulator> {
  console.group()
  // call issuance process if no input witness is found (everything is off-chain)
  const witnesses = _witnesses || [
    (
      await issuanceProcess({
        claimer,
        attester,
        accumulator,
        claim: testEnv1.claim,
      })
    ).witness,
  ]

  // show accumulator and count before revocation
  await printAttesterChainStats(
    blockchain,
    attester.address,
    `Before revocation of ${witnesses.length} credential(s)`
  )

  // revoke credential tied to witness
  const accumulatorAfterRevo = await attester.revokeAttestation({
    witnesses,
    accumulator,
  })

  // need to wait for next block to see a change
  await blockchain.waitForNextBlock()

  // show accumulator and count after revocation
  await printAttesterChainStats(
    blockchain,
    attester.address,
    'After revocation'
  )
  console.groupEnd()
  return accumulatorAfterRevo
}
export default revocationProcess
