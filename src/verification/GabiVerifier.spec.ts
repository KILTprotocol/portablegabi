import { IGabiContextNonce } from '../types/Attestation'
import { IGabiReqAttrMsg, IGabiVerifiedAtts } from '../types/Verification'
import runTestSetup from '../testSetup/testSetup'
import { disclosedAttributes, claim } from '../testSetup/testConfig'
import { goWasmClose } from '../wasm/wasm_exec_wrapper'
import { IProof } from '../testSetup/testTypes'

afterAll(() => {
  goWasmClose()
})

describe('Test verifier', () => {
  let credential: string
  let verifierSession: IGabiContextNonce
  let reqRevealedAttrMsg: IGabiReqAttrMsg
  let proof: string
  let verifiedClaim: IGabiVerifiedAtts<typeof claim>['claim']
  let verified: boolean
  beforeAll(async () => {
    ;({
      credential,
      verifierSession,
      reqRevealedAttrMsg,
      proof,
      verifiedClaim,
      verified,
    } = await runTestSetup())
  }, 10000)
  it('Checks valid startVerficiationSession', async () => {
    expect(verifierSession).toBeDefined()
    expect(reqRevealedAttrMsg).toBeDefined()
    expect(verifierSession.context).toStrictEqual(reqRevealedAttrMsg.context)
    expect(verifierSession.nonce).toStrictEqual(reqRevealedAttrMsg.nonce)
    console.log(disclosedAttributes)
    console.log(reqRevealedAttrMsg.discloseAttributes)

    // FIXME: @weichweich
    // expect(reqRevealedAttrMsg.discloseAttributes).toStrictEqual(
    //   disclosedAttributes
    // )
  })
  it('Checks valid verifyAttributes', () => {
    expect(verifiedClaim).toBeDefined()
    expect(verified).toBeTruthy()
    console.log(claim.contents.picture.DATA)
    console.log(verifiedClaim.contents)
    console.log(proof)
    console.log(credential)
    expect(verifiedClaim).not.toStrictEqual(claim)

    // FIXME: @weichweich
    // expect(verifiedClaim.contents).toStrictEqual({
    //   id: claim.contents.id,
    //   contents: {
    //     data: claim.contents.picture.DATA,
    //     eyeColor: claim.contents.eyeColor,
    //   },
    // })
  })
  it.todo('Invalid disclosed attribute(s)')
  it.todo('invalid startVerificationSession?')
  it.todo('invalid verifyattributes')
})
