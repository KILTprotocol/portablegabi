import runTestSetup from '../testSetup/testSetup'
import { disclosedAttributes, claim } from '../testSetup/testConfig'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { VerificationSession, PresentationRequest } from '../types/Verification'

afterAll(async () => {
  await goWasmClose()
})

describe('Test verifier', () => {
  let verifierSession: VerificationSession
  let presentationReq: PresentationRequest
  let verifiedClaim: any
  let verified: boolean
  beforeAll(async () => {
    ;({
      verifierSession,
      presentationReq,
      verifiedClaim,
      verified,
    } = await runTestSetup())
  }, 10000)
  it('Checks valid startVerficiationSession', async () => {
    expect(verifierSession).toBeDefined()
    expect(presentationReq).toBeDefined()

    const verObj = JSON.parse(verifierSession.valueOf())
    const presObj = JSON.parse(presentationReq.valueOf())
    expect(verObj.context).toStrictEqual(presObj.context)
    expect(verObj.nonce).toStrictEqual(presObj.nonce)
    expect(
      presObj.partialPresentationRequest.requestedAttributes
    ).toStrictEqual(disclosedAttributes)
    // TODO: add more?
  })
  it('Checks valid verifyPresentation', () => {
    expect(verifiedClaim).toBeDefined()
    expect(verified).toBeTruthy()
    expect(verifiedClaim).not.toStrictEqual(claim)
    expect(verifiedClaim).toHaveProperty('contents', {
      id: claim.contents.id,
      picture: { DATA: claim.contents.picture.DATA },
      eyeColor: claim.contents.eyeColor,
    })
    // TODO: add more?
  })
  it.todo('Invalid disclosed attribute(s)')
  it.todo('invalid startVerificationSession?')
  it.todo('invalid verifyPresentation')
})
