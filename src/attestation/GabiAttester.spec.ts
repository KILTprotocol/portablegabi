import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { attestationSetup, actorSetup } from '../testSetup/testSetup'
import GabiAttester from './GabiAttester'
import { Accumulator } from '../types/Attestation'
import GabiClaimer from '../claim/GabiClaimer'
import { AttestationRequest } from '../types/Claim'
import { claim } from '../testSetup/testConfig'

afterAll(async () => {
  await goWasmClose()
})

describe('Test verifier', () => {
  let attester: Array<[GabiAttester, Accumulator]>
  let claimers: GabiClaimer[]
  let attestationRequest: AttestationRequest

  beforeAll(async () => {
    ;({ attester, claimers } = await actorSetup())
    ;({ attestationRequest } = await attestationSetup({
      claimer: claimers[0],
      attester: attester[0][0],
      update: attester[0][1],
    }))
  })
  it('Get Claim from AttestationRequest', async () => {
    const tClaim = attestationRequest.getClaim()
    expect(tClaim).toBeDefined()
    expect(tClaim).toEqual(claim)
  })
  it('Get Claim from invalid AttestationRequest (wrong content)', async () => {
    const invalidAttestationRequest = new AttestationRequest(
      '{"i am kinda invalid?!": true}'
    )
    expect(() => {
      invalidAttestationRequest.getClaim()
    }).toThrowError('invalid request: claim is missing')
  })
  it('Get Claim from invalid AttestationRequest (invalid json)', async () => {
    const invalidAttestationRequest = new AttestationRequest(
      'i am kinda invalid?!'
    )
    expect(() => {
      invalidAttestationRequest.getClaim()
    }).toThrowError('invalid request: could not parse json')
  })
})
