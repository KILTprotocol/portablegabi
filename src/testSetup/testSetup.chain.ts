/* eslint-disable import/prefer-default-export */
import { KeypairType } from '@polkadot/util-crypto/types'
import Accumulator from '../attestation/Accumulator'
import {
  pubKey,
  privKey,
  pubKey2,
  privKey2,
  chainCfg,
  disclosedAttributes,
} from './testConfig'
import GabiAttesterChain from '../attestation/GabiAttester.chain'
import GabiClaimerChain from '../claim/GabiClaimer.chain'
import connect from '../blockchainApiConnection/BlockchainApiConnection'
import {
  VerificationSession,
  PresentationRequest,
  CombinedPresentationRequest,
  CombinedVerificationSession,
  IPresentationRequest,
} from '../types/Verification'
import { Presentation, Credential, CombinedPresentation } from '../types/Claim'
import { attestationSetup } from './testSetup'
import { PgabiModName } from '../types/Chain'
import GabiVerifier from '../verification/GabiVerifier'

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
  claimers: GabiClaimerChain[]
  attesters: GabiAttesterChain[]
  accumulators: Accumulator[]
}> {
  const chain = await connect({ pgabiModName })
  const gabiClaimer1 = await GabiClaimerChain.create<GabiClaimerChain>()
  const gabiClaimer2 = await GabiClaimerChain.create<GabiClaimerChain>()
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

// identical to presentationSetup except for using chain functionality
export async function presentationSetupChain({
  claimer,
  attester,
  credential,
  accumulator,
  requestedAttributes = disclosedAttributes,
  reqUpdatedAfter = new Date(),
  reqNonRevocationProof = true,
}: {
  claimer: GabiClaimerChain
  attester: GabiAttesterChain
  credential: Credential
  accumulator: Accumulator
  requestedAttributes?: string[]
  reqUpdatedAfter?: Date
  reqNonRevocationProof?: boolean
}): Promise<{
  verifierSession: VerificationSession
  presentationReq: PresentationRequest
  presentation: Presentation
  verified: boolean
  claim: object
}> {
  // request
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestedAttributes,
    reqNonRevocationProof,
    reqUpdatedAfter,
  })
  // response
  const presentation = await claimer.buildPresentation({
    credential,
    attesterPubKey: attester.publicKey,
    presentationReq,
  })
  // verify
  const { verified, claim: aClaim } = await GabiVerifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
    accumulator,
  })
  return {
    verifierSession,
    presentationReq,
    presentation,
    verified,
    claim: aClaim,
  }
}

export async function combinedSetupChain({
  claimer,
  attesters,
  accumulators,
  disclosedAttsArr,
  reqUpdatesAfter,
  reqNonRevocationProof,
  inputCredentials,
}: {
  claimer: GabiClaimerChain
  attesters: GabiAttesterChain[]
  accumulators: Accumulator[]
  disclosedAttsArr: string[][]
  reqUpdatesAfter: Date[]
  reqNonRevocationProof: boolean[]
  inputCredentials?: Credential[]
}): Promise<{
  combinedPresentation: CombinedPresentation
  combinedPresentationReq: CombinedPresentationRequest
  combinedSession: CombinedVerificationSession
  verified: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  claims: any[]
}> {
  if (
    attesters.length !== accumulators.length ||
    accumulators.length !== disclosedAttsArr.length ||
    disclosedAttsArr.length !== reqUpdatesAfter.length ||
    reqUpdatesAfter.length !== reqNonRevocationProof.length
  ) {
    throw new Error('Array lengths dont match up in combined setup')
  }
  const attesterPubKeys = attesters.map(attester => attester.publicKey)
  // build credentials if inputCredentials is missing
  let credentials: Credential[]
  if (
    inputCredentials &&
    inputCredentials.filter(cred => cred instanceof Credential).length ===
      attesters.length
  ) {
    credentials = inputCredentials
  } else {
    credentials = await Promise.all(
      attesters.map((attester, idx) =>
        attestationSetup({
          attester,
          claimer,
          accumulator: accumulators[idx],
        })
      )
    ).then(attestations =>
      attestations.map(attestation => attestation.credential)
    )
  }
  // build combined requests
  const requests: IPresentationRequest[] = disclosedAttsArr.map(
    (requestedAttributes, idx) => ({
      requestedAttributes,
      reqNonRevocationProof: reqNonRevocationProof[idx],
      reqUpdatedAfter: reqUpdatesAfter[idx],
    })
  )
  // request combined presentation
  const {
    message: combinedPresentationReq,
    session: combinedSession,
  } = await GabiVerifier.requestCombinedPresentation(requests)

  // build presentation
  const combinedPresentation = await claimer.buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  })
  // verify presentation
  const { verified, claims } = await GabiVerifier.verifyCombinedPresentation({
    proof: combinedPresentation,
    attesterPubKeys,
    verifierSession: combinedSession,
    accumulators,
  })
  return {
    combinedPresentationReq,
    combinedSession,
    combinedPresentation,
    verified,
    claims,
  }
}
