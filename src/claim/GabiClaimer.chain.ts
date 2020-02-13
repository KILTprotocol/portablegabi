import GabiClaimer from './GabiClaimer'

import {
  Credential,
  IUpdateCredential,
  IGabiClaimerChain,
} from '../types/Claim'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import Accumulator from '../attestation/Accumulator'

export default class GabiClaimerChain extends GabiClaimer
  implements IGabiClaimerChain {
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
    return super.updateCredential({
      credential,
      attesterPubKey,
      accumulator,
    })
  }
}
