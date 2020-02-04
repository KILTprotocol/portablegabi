import GabiClaimer from './GabiClaimer'

import { Credential, IUpdateCredential } from '../types/Claim'
import connect from '../blockchain/BlockchainApiConnection'
import Accumulator from '../attestation/Accumulator'

export default class GabiClaimerChain extends GabiClaimer {
  public async updateCredentialChain({
    credential,
    attesterPubKey,
    attesterChainAddress,
    _accumulator,
  }: Omit<IUpdateCredential, 'accumulator'> & {
    attesterChainAddress?: string
    _accumulator?: Accumulator
  }): Promise<Credential> {
    const chain = await connect()
    if (!_accumulator && !attesterChainAddress) {
      throw new Error(
        "Missing either accumulator or attester's chain address to run updateCredentialClaim"
      )
    }
    const accumulator =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _accumulator || (await chain.getLatestAccumulator(attesterChainAddress!))
    console.log('Accumulator Update Cred:', accumulator)
    return super.updateCredential({
      credential,
      attesterPubKey,
      accumulator,
    })
  }
}
