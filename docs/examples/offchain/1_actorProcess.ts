import GabiClaimer from '../../../src/claim/GabiClaimer'
import { mnemonic, testEnv1, testEnv2 } from '../exampleConfig'
import GabiAttester from '../../../src/attestation/GabiAttester'

import {
  AttesterPublicKey,
  AttesterPrivateKey,
} from '../../../src/types/Attestation'
import Accumulator from '../../../src/attestation/Accumulator'

export async function actorProcess({
  claimerMnemonic,
  claimerMnemonicPw,
  attesterPubKey = testEnv1.pubKey,
  attesterPrivKey = testEnv2.privKey,
}: {
  claimerMnemonic?: string
  claimerMnemonicPw?: string
  attesterPubKey?: string | AttesterPublicKey
  attesterPrivKey?: string | AttesterPrivateKey
}): Promise<{
  claimer: GabiClaimer
  attester: GabiAttester
  accumulator: Accumulator
}> {
  // create claimer either from scratch or from mnemonic input
  const claimer = claimerMnemonic
    ? await GabiClaimer.create()
    : await GabiClaimer.buildFromMnemonic(mnemonic, claimerMnemonicPw)

  // create attester from (pk, sk) pair
  const attester = new GabiAttester(
    new AttesterPublicKey(attesterPubKey),
    new AttesterPrivateKey(attesterPrivKey)
  )

  // create fresh accumulator
  const accumulator = await attester.createAccumulator()
  return { claimer, attester, accumulator }
}

export default actorProcess
