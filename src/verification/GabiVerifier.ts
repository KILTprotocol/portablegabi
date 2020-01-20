import goWasmExec from '../wasm/wasm_exec_wrapper'
import WasmHooks from '../wasm/WasmHooks'
import { IGabiReqAttrMsg, IGabiVerifiedAtts } from '../types/Verification'
import { IGabiMsgSession, IGabiContextNonce } from '../types/Attestation'

export default class GabiVerifier {
  // start verification
  public static async startVerificationSession({
    disclosedAttributes,
    requestNonRevocationProof,
    minIndex,
  }: {
    disclosedAttributes: string[]
    requestNonRevocationProof: boolean
    minIndex: number
  }): Promise<{
    message: IGabiReqAttrMsg
    session: IGabiContextNonce
  }> {
    const { message, session } = await goWasmExec<IGabiMsgSession>(
      WasmHooks.startVerificationSession,
      [requestNonRevocationProof, minIndex, ...disclosedAttributes]
    )
    return {
      message: JSON.parse(message),
      session: JSON.parse(session),
    }
  }

  // verify attributes
  public static async verifyAttributes({
    proof,
    verifierSession,
    attesterPubKey,
  }: {
    proof: string
    verifierSession: IGabiContextNonce
    attesterPubKey: string
  }): Promise<IGabiVerifiedAtts<any>> {
    const response = await goWasmExec<IGabiVerifiedAtts<string>>(
      WasmHooks.verifyAttributes,
      [proof, JSON.stringify(verifierSession), attesterPubKey]
    )
    if (response && 'claim' in response && 'verified' in response) {
      const claim = JSON.parse(response.claim)
      return {
        claim,
        verified: Boolean(response.verified),
      } as IGabiVerifiedAtts<typeof claim>
    }
    return {
      claim: undefined,
      verified: false,
    } as IGabiVerifiedAtts<undefined>
  }
}
