/**
 * @ignore
 * @packageDocumentation
 */
/* eslint-disable import/prefer-default-export */
import { KeypairType } from '@polkadot/util-crypto/types'
import Accumulator from '../attestation/Accumulator'
import { pubKey, privKey, pubKey2, privKey2, chainCfg } from './testConfig'
import AttesterChain from '../attestation/Attester.chain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import { PgabiModName } from '../types/Chain'
import Claimer from '../claim/Claimer'

// creates instances for two claimers, attesters and corresponding accumulators each
export async function actorSetupChain({
  pgabiModName = 'portablegabiPallet',
  mnemonics = chainCfg.URIs,
  keypairTypes = ['sr25519', 'sr25519'],
}: {
  pgabiModName?: PgabiModName
  mnemonics?: [string, string]
  keypairTypes?: [KeypairType, KeypairType]
}): Promise<{
  claimers: Claimer[]
  attesters: AttesterChain[]
  accumulators: Accumulator[]
}> {
  const chain = await connect({ pgabiModName })
  const claimer1 = await Claimer.create()
  const claimer2 = await Claimer.create()
  const attester1 = await AttesterChain.buildFromMnemonic(
    pubKey,
    privKey,
    mnemonics[0],
    keypairTypes[0]
  )
  const attester2 = await AttesterChain.buildFromMnemonic(
    pubKey2,
    privKey2,
    mnemonics[1],
    keypairTypes[1]
  )

  // get accumulators or calculate new ones if non existent on chain
  let accumulator1
  let accumulator2
  try {
    accumulator1 = await chain.getLatestAccumulator(attester1.address)
  } catch (e) {
    accumulator1 = await attester1.createAccumulator()
    await Promise.resolve(
      attester1.buildUpdateAccumulatorTX(accumulator1)
    ).catch((err) => err)
  }
  try {
    accumulator2 = await chain.getLatestAccumulator(attester2.address)
  } catch (e) {
    accumulator2 = await attester1.createAccumulator()
    await Promise.resolve(
      attester2.buildUpdateAccumulatorTX(accumulator2)
    ).catch((err) => err)
  }
  return {
    claimers: [claimer1, claimer2],
    attesters: [attester1, attester2],
    accumulators: [accumulator1, accumulator2],
  }
}
