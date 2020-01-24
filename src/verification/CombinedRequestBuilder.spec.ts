import {
  disclosedAttributes,
  disclosedAttributesCombined,
  //   claimCombined,
} from '../testSetup/testConfig'
import CombinedRequestBuilder from './CombinedRequestBuilder'

describe('Test combined requests', () => {
  it('Checks valid CombinedRequestBuilder', async () => {
    const { message, session } = await new CombinedRequestBuilder()
      .requestPresentation({
        requestedAttributes: disclosedAttributes,
        requestNonRevocationProof: true,
        minIndex: 1,
      })
      .requestPresentation({
        requestedAttributes: disclosedAttributesCombined,
        requestNonRevocationProof: true,
        minIndex: 1,
      })
      .finalise()
    expect(message).toEqual(expect.anything())
    expect(session).toEqual(expect.anything())
  })
})
