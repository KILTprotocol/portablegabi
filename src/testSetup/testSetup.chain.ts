/* eslint-disable import/prefer-default-export */
import { KeypairType } from '@polkadot/util-crypto/types'
import Accumulator from '../attestation/Accumulator'
import { pubKey, privKey, pubKey2, privKey2, chainCfg } from './testConfig'
import GabiAttesterChain from '../attestation/GabiAttester.chain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import { PgabiModName } from '../types/Chain'
import GabiClaimer from '../claim/GabiClaimer'

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
  claimers: GabiClaimer[]
  attesters: GabiAttesterChain[]
  accumulators: Accumulator[]
}> {
  const chain = await connect({ pgabiModName })
  const gabiClaimer1 = await GabiClaimer.create()
  const gabiClaimer2 = await GabiClaimer.create()
  const gabiAttester1 = await GabiAttesterChain.buildFromMnemonic(
    pubKey,
    privKey,
    mnemonics[0],
    keypairTypes[0]
  )
  const gabiAttester2 = await GabiAttesterChain.buildFromMnemonic(
    pubKey2,
    privKey2,
    mnemonics[1],
    keypairTypes[1]
  )

  // get accumulators or calculate new ones if non existent on chain
  let accumulator1
  let accumulator2
  try {
    accumulator1 = await chain.getLatestAccumulator(gabiAttester1.address)
  } catch (e) {
    accumulator1 = await gabiAttester1.createAccumulator()
    await Promise.resolve(gabiAttester1.updateAccumulator(accumulator1)).catch(
      err => err
    )
  }
  try {
    accumulator2 = await chain.getLatestAccumulator(gabiAttester2.address)
  } catch (e) {
    accumulator2 = await gabiAttester1.createAccumulator()
    await Promise.resolve(gabiAttester2.updateAccumulator(accumulator2)).catch(
      err => err
    )
  }
  return {
    claimers: [gabiClaimer1, gabiClaimer2],
    attesters: [gabiAttester1, gabiAttester2],
    accumulators: [accumulator1, accumulator2],
  }
}
