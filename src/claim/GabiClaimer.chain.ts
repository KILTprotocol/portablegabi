import GabiClaimer from './GabiClaimer'

import {
  Credential,
  IUpdateCredential,
  IGabiClaimerChain,
} from '../types/Claim'
import connect from '../blockchainApiConnection/BlockchainApiConnection'

export default class GabiClaimerChain extends GabiClaimer
  implements IGabiClaimerChain {
  public async updateCredentialChain({
    credential,
    attesterPubKey,
    attesterChainAddress,
    index,
  }: Omit<IUpdateCredential, 'accumulator'> & {
    attesterChainAddress: string
    index?: number
  }): Promise<Credential> {
    const chain = await connect()
    const accumulator = index
      ? await chain.getAccumulator(attesterChainAddress, index)
      : await chain.getLatestAccumulator(attesterChainAddress)
    return super.updateCredential({
      credential,
      attesterPubKey,
      accumulator,
    })
  }
}
