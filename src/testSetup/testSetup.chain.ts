/* eslint-disable import/prefer-default-export */
import { Accumulator } from '../types/Attestation'
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
import getCached from '../blockchain/BlockchainApiConnection'
import Blockchain from '../blockchain/Blockchain'
import {
  VerificationSession,
  PresentationRequest,
  IPresentationRequestChain,
  CombinedPresentationRequest,
  CombinedVerificationSession,
} from '../types/Verification'
import { Presentation, Credential, CombinedPresentation } from '../types/Claim'
import { attestationSetup } from './testSetup'
import GabiVerifierChain from '../verification/GabiVerifier.chain'

export const blockchain = (): Promise<Blockchain> =>
  Promise.resolve(getCached())

// creates instances for two claimers, attesters and corresponding accumulators each
export async function actorSetupChain(): Promise<{
  claimers: GabiClaimerChain[]
  attesters: GabiAttesterChain[]
  accumulators: Accumulator[]
}> {
  const chain = await blockchain()
  const gabiClaimer1 = await GabiClaimerChain.buildFromScratch<
    GabiClaimerChain
  >()
  const gabiClaimer2 = await GabiClaimerChain.buildFromScratch<
    GabiClaimerChain
  >()
  const gabiAttester1 = GabiAttesterChain.buildFromMnemonic(
    pubKey,
    privKey,
    chainCfg.attester1.mnemonic,
    'ed25519'
  )
  const gabiAttester2 = GabiAttesterChain.buildFromMnemonic(
    pubKey2,
    privKey2,
    chainCfg.attester2.mnemonic,
    'ed25519'
  )

  // get accumulators or calculate new ones if non existent on chain
  let accumulator1
  let accumulator2
  try {
    accumulator1 = await chain.getLatestAccumulator(
      gabiAttester1.getPublicIdentity().address
    )
  } catch (e) {
    accumulator1 = await gabiAttester1.createAccumulator()
    await gabiAttester1.updateAccumulator(accumulator1)
  }
  try {
    accumulator2 = await chain.getLatestAccumulator(
      gabiAttester2.getPublicIdentity().address
    )
  } catch (e) {
    accumulator2 = await gabiAttester1.createAccumulator()
    await gabiAttester2.updateAccumulator(accumulator2)
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
  requestedAttributes = disclosedAttributes,
  reqIndex = 'latest',
  reqNonRevocationProof = true,
}: {
  claimer: GabiClaimerChain
  attester: GabiAttesterChain
  credential: Credential
  requestedAttributes?: string[]
  reqIndex?: number | 'latest'
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
  } = await GabiVerifierChain.requestPresentationChain({
    requestedAttributes,
    reqNonRevocationProof,
    reqIndex,
    address: attester.getPublicIdentity().address,
  })
  // response
  const presentation = await claimer.buildPresentation({
    credential,
    attesterPubKey: attester.getPubKey(),
    presentationReq,
  })
  // verify
  const {
    verified,
    claim: aClaim,
  } = await GabiVerifierChain.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.getPubKey(),
  })
  return {
    verifierSession,
    presentationReq,
    presentation,
    verified,
    claim: aClaim,
  }
}

// TODO: This only makes sense if we test requestCombinedPresentationChain
export async function combinedSetupChain({
  claimer,
  attesters,
  accumulators,
  disclosedAttsArr,
  indices,
  reqNonRevocationProof,
  inputCredentials,
}: {
  claimer: GabiClaimerChain
  attesters: GabiAttesterChain[]
  accumulators: Accumulator[]
  disclosedAttsArr: string[][]
  indices: Array<number | 'latest'>
  reqNonRevocationProof: boolean[]
  inputCredentials?: Credential[]
}): Promise<{
  combinedPresentation: CombinedPresentation
  combinedPresentationReq: CombinedPresentationRequest
  combinedSession: CombinedVerificationSession
  verified: boolean
  claims: any[]
}> {
  if (
    attesters.length !== accumulators.length ||
    accumulators.length !== disclosedAttsArr.length ||
    disclosedAttsArr.length !== indices.length ||
    indices.length !== reqNonRevocationProof.length
  ) {
    throw new Error('Array lengths dont match up in combined setup')
  }
  const attesterPubKeys = attesters.map(attester => attester.getPubKey())
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
  const requests: IPresentationRequestChain[] = disclosedAttsArr.map(
    (requestedAttributes, idx) => ({
      requestedAttributes,
      reqNonRevocationProof: reqNonRevocationProof[idx],
      reqIndex: indices[idx],
      address: attesters[idx].getPublicIdentity().address,
    })
  )
  // request combined presentation
  const {
    message: combinedPresentationReq,
    session: combinedSession,
  } = await GabiVerifierChain.requestCombinedPresentationChain(requests)

  // build presentation
  const combinedPresentation = await claimer.buildCombinedPresentation({
    credentials,
    combinedPresentationReq,
    attesterPubKeys,
  })
  // verify presentation
  const {
    verified,
    claims,
  } = await GabiVerifierChain.verifyCombinedPresentation({
    proof: combinedPresentation,
    attesterPubKeys,
    verifierSession: combinedSession,
  })
  return {
    combinedPresentationReq,
    combinedSession,
    combinedPresentation,
    verified,
    claims,
  }
}
