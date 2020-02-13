import { Codec } from '@polkadot/types/types'
import { stringToHex } from '@polkadot/util'
import GabiAttesterChain from '../attestation/GabiAttester.chain'
import {
  actorSetupChain,
  presentationSetupChain,
  combinedSetupChain,
} from '../testSetup/testSetup.chain'
import Accumulator from '../attestation/Accumulator'
import { attestationSetup } from '../testSetup/testSetup'
import api from '../blockchain/__mocks__/BlockchainApi'
import { Credential } from '../types/Claim'
import GabiClaimerChain from '../claim/GabiClaimer.chain'
import { BlockchainError } from '../blockchain/ChainError'
import { disclosedAttributes } from '../testSetup/testConfig'
import CombinedRequestBuilder from './CombinedRequestBuilder'

jest.mock('../blockchainApiConnection/BlockchainApiConnection')

describe('Test GabiAttester on chain', () => {
  let claimer: GabiClaimerChain
  let attester: GabiAttesterChain
  let accumulator: Accumulator
  let credential: Credential
  beforeAll(async () => {
    api.query.portablegabi.accumulatorList.mockReturnValueOnce(
      (0x00 as unknown) as Promise<Codec>
    )
    ;({
      attesters: [attester],
      claimers: [claimer],
    } = await actorSetupChain({}))
    accumulator = await attester.createAccumulator()
    ;({ credential } = await attestationSetup({
      claimer,
      attester,
      accumulator,
    }))
    await attester.updateAccumulator(accumulator).catch(e => {
      expect(e.message).toBe("Cannot read property 'signAndSend' of undefined")
    })
  })
  describe('Positive tests', () => {
    it('Should verify claim when setting reqIndex to latest', async () => {
      const { claim, verified } = await presentationSetupChain({
        claimer,
        attester,
        credential,
      })
      expect(claim).toEqual(expect.anything())
      expect(verified).toBe(true)
      expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    })
    it('Should verify claim when setting reqIndex to 0', async () => {
      const { claim, verified } = await presentationSetupChain({
        claimer,
        attester,
        credential,
        reqIndex: 0,
      })
      expect(claim).toEqual(expect.anything())
      expect(verified).toBe(true)
      expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    })
    it('Should verify combined request when both indices set to latest', async () => {
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex(accumulator.valueOf()) as unknown) as Promise<Codec>
      )
      const { verified, claims } = await combinedSetupChain({
        claimer,
        attesters: [attester, attester],
        accumulators: [accumulator, accumulator],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        indices: ['latest', 'latest'],
        reqNonRevocationProof: [true, true],
      })
      expect(verified).toBe(true)
      expect(claims).toHaveLength(2)
      expect(claims[0]).toEqual(expect.anything())
      expect(claims[1]).toEqual(expect.anything())
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(2)
    })
    it('Should verify combined request when both indices set to latest', async () => {
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex(accumulator.valueOf()) as unknown) as Promise<Codec>
      )
      const { verified, claims } = await combinedSetupChain({
        claimer,
        attesters: [attester, attester],
        accumulators: [accumulator, accumulator],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        indices: ['latest', 'latest'],
        reqNonRevocationProof: [true, true],
      })
      expect(verified).toBe(true)
      expect(claims).toHaveLength(2)
      expect(claims[0]).toEqual(expect.anything())
      expect(claims[1]).toEqual(expect.anything())
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(2)
      const { verified: verified2, claims: claims2 } = await combinedSetupChain(
        {
          claimer,
          attesters: [attester, attester],
          accumulators: [accumulator, accumulator],
          disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
          indices: [0, 'latest'],
          reqNonRevocationProof: [true, true],
        }
      )
      expect(verified2).toBe(true)
      expect(claims2).toHaveLength(2)
      expect(claims2[0]).toEqual(expect.anything())
      expect(claims2[1]).toEqual(expect.anything())
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(4)
    })
    it('Should verify combined request when sending credentials', async () => {
      const { credential: credential2 } = await attestationSetup({
        claimer,
        attester,
        accumulator,
      })
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex(accumulator.valueOf()) as unknown) as Promise<Codec>
      )
      const { verified, claims } = await combinedSetupChain({
        claimer,
        attesters: [attester, attester],
        inputCredentials: [credential, credential2],
        accumulators: [accumulator, accumulator],
        disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
        indices: ['latest', 'latest'],
        reqNonRevocationProof: [true, true],
      })
      expect(verified).toBe(true)
      expect(claims).toHaveLength(2)
      expect(claims[0]).toEqual(expect.anything())
      expect(claims[1]).toEqual(expect.anything())
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(2)
    })
    it('Should create chain combined request', async () => {
      const builder = new CombinedRequestBuilder().requestPresentation({
        requestedAttributes: disclosedAttributes,
        reqNonRevocationProof: true,
        reqIndex: 'latest',
        attesterIdentity: attester.getPublicIdentity(),
      })
      await builder.finalise()
      expect(builder).toEqual(expect.anything())
      expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    })
  })
  describe('Negative tests', () => {
    const maxRevIndex = 0
    let reqIndex = -1
    it('Should throw revocation indexOutOfRange error when setting reqIndex < 0', async () => {
      await expect(
        presentationSetupChain({
          claimer,
          attester,
          credential,
          reqIndex,
        })
      ).rejects.toThrowError(
        BlockchainError.indexOutOfRange(
          'revocation',
          attester.address,
          reqIndex,
          maxRevIndex
        )
      )
      expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    })
    it('Should throw revocation indexOutOfRange error when setting reqIndex > maxRevIndex', async () => {
      reqIndex = maxRevIndex + 1
      await expect(
        presentationSetupChain({
          claimer,
          attester,
          credential,
          reqIndex,
        })
      ).rejects.toThrowError(
        BlockchainError.indexOutOfRange(
          'revocation',
          attester.address,
          reqIndex,
          maxRevIndex
        )
      )
      expect(api.query.portablegabi.accumulatorCount).toHaveBeenCalledTimes(1)
      expect(api.query.portablegabi.accumulatorList).toHaveBeenCalledTimes(1)
    })
    it('Should throw revocation indexOutOfRange error when accumulator does not have revocation index', async () => {
      reqIndex = 0
      const invalidAccumulator = new Accumulator(
        'accumulatorWithouRevocationIndex'
      )
      api.query.portablegabi.accumulatorList.mockResolvedValue(
        (stringToHex(invalidAccumulator.valueOf()) as unknown) as Promise<Codec>
      )
      await expect(
        presentationSetupChain({
          claimer,
          attester,
          credential,
          reqIndex,
        })
      ).rejects.toThrowError(BlockchainError.missingRevIndex(attester.address))
    })
    it('Should throw on combinedSetupChain for mixed input array lengths', async () => {
      await expect(
        combinedSetupChain({
          claimer,
          attesters: [attester],
          inputCredentials: [credential],
          accumulators: [accumulator, accumulator],
          disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
          indices: ['latest', 'latest'],
          reqNonRevocationProof: [true, true],
        })
      ).rejects.toThrowError('Array lengths dont match up in combined setup')
      await expect(
        combinedSetupChain({
          claimer,
          attesters: [attester],
          inputCredentials: [credential],
          accumulators: [accumulator],
          disclosedAttsArr: [disclosedAttributes, disclosedAttributes],
          indices: ['latest', 'latest'],
          reqNonRevocationProof: [true, true],
        })
      ).rejects.toThrowError('Array lengths dont match up in combined setup')
      await expect(
        combinedSetupChain({
          claimer,
          attesters: [attester],
          inputCredentials: [credential],
          accumulators: [accumulator],
          disclosedAttsArr: [disclosedAttributes],
          indices: ['latest', 'latest'],
          reqNonRevocationProof: [true, true],
        })
      ).rejects.toThrowError('Array lengths dont match up in combined setup')
      await expect(
        combinedSetupChain({
          claimer,
          attesters: [attester],
          inputCredentials: [credential],
          accumulators: [accumulator],
          disclosedAttsArr: [disclosedAttributes],
          indices: ['latest'],
          reqNonRevocationProof: [true, true],
        })
      ).rejects.toThrowError('Array lengths dont match up in combined setup')
      await expect(
        combinedSetupChain({
          claimer,
          attesters: [],
          inputCredentials: [credential],
          accumulators: [accumulator],
          disclosedAttsArr: [disclosedAttributes],
          indices: ['latest'],
          reqNonRevocationProof: [true],
        })
      ).rejects.toThrowError('Array lengths dont match up in combined setup')
    })
  })
})
