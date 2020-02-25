import Claimer from '../../../src/claim/Claimer'
import { mnemonic, testEnv1, testEnv2 } from '../exampleConfig'
import Attester from '../../../src/attestation/Attester'

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
  claimer: Claimer
  attester: Attester
  accumulator: Accumulator
}> {
  // create claimer either from scratch or from mnemonic input
  const claimer = claimerMnemonic
    ? await Claimer.create()
    : await Claimer.buildFromMnemonic(mnemonic, claimerMnemonicPw)

  // create attester from (pk, sk) pair
  const attester = new Attester(
    new AttesterPublicKey(attesterPubKey),
    new AttesterPrivateKey(attesterPrivKey)
  )

  // create fresh accumulator
  const accumulator = await attester.createAccumulator()
  return { claimer, attester, accumulator }
}

export default actorProcess
