/* eslint-disable no-console */
import Blockchain from '../../../src/blockchain/Blockchain'
import AttesterChain from '../../../src/attestation/Attester.chain'
import {
  AttesterPrivateKey,
  AttesterPublicKey,
} from '../../../src/types/Attestation'
import { testEnv1, mnemonic } from '../exampleConfig'
import Accumulator from '../../../src/attestation/Accumulator'
import Claimer from '../../../src/claim/Claimer'

export async function actorProcessChain({
  blockchain,
  claimerMnemonic,
  claimerMnemonicPw,
  attesterPubKey = testEnv1.pubKey,
  attesterPrivKey = testEnv1.privKey,
  attesterURI = '//Alice',
}: {
  blockchain: Blockchain
  claimerMnemonic?: string
  claimerMnemonicPw?: string
  attesterPubKey?: string | AttesterPublicKey
  attesterPrivKey?: string | AttesterPrivateKey
  attesterURI?: string
}): Promise<{
  claimer: Claimer
  attester: AttesterChain
  accumulator: Accumulator
}> {
  // create claimer either from scratch or from mnemonic input
  const claimer = claimerMnemonic
    ? await Claimer.create()
    : await Claimer.buildFromMnemonic(mnemonic, { password: claimerMnemonicPw })

  // create attester
  const attester = await AttesterChain.buildFromURI(
    new AttesterPublicKey(attesterPubKey),
    new AttesterPrivateKey(attesterPrivKey),
    attesterURI,
    'ed25519'
  )

  // get accumulator from chain
  let accumulator: Accumulator
  try {
    accumulator = await blockchain.getLatestAccumulator(attester.address)
  } catch (e) {
    console.log(
      `Missing accumulator for address ${attester.address}... putting new one on chain.`
    )
    accumulator = await attester.createAccumulator()

    // check for missing balance before updating accumulator
    const balance = await blockchain.api.query.balances.freeBalance(
      attester.address
    )
    if (balance.isEmpty) {
      throw new Error(
        `Missing balance for address "${attester.address}" with URI/mnemonic ${attesterURI}`
      )
    }
    await attester.updateAccumulator(accumulator)
  }

  return { claimer, attester, accumulator }
}
export default actorProcessChain
