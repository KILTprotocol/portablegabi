/* eslint-disable camelcase */
type SpyKeys = 'exit' | 'error' | 'log'
export type Spy<T extends SpyKeys | ''> = {
  [key in Exclude<SpyKeys, T>]: jest.SpyInstance
}

export interface IAttestationRequest {
  commitMsg: {
    U: string
    n_2: string
    combins: any[]
    proofPJwt: string
    proofPJwts: string | null
  }
  values: string[]
}

export interface IAttesterSignSession {
  //   GabiIssuer: {
  //     Sk: {
  //       XMLName: { Space: string; Local: string }
  //       Counter: number
  //       ExpiryDate: number
  //       P: string
  //       Q: string
  //       PPrime: string
  //       QPrime: string
  //     }
  //     Pk: {
  //       XMLName: { Space: string; Local: string }
  //       Counter: number
  //       ExpiryDate: number
  //       N: string
  //       Z: string
  //       S: string
  //       R: string[]
  //       EpochLength: number
  //       Params: { [publicParam: string]: number }
  //       Issuer: string
  //     }
  context: string
}

export interface IClaimerSession {
  cb: {
    Secret: string
    VPrime: string
    VPrimeCommit: string | null
    Nonce2: string
    U: string
    UCommit: string
    SkRandomizer: string | null
    // Pk: AttesterSignSession['GabiIssuer']['Pk']
    Pk: {
      XMLName: { Space: string; Local: string }
      Counter: number
      ExpiryDate: number
      N: string
      Z: string
      S: string
      R: string[]
      EpochLength: number
      Params: { [publicParam: string]: number }
      Issuer: string
    }
    Context: string
    ProofPcomm: string | null
  }
  claim: {
    ctype: string
    contents: any
  }
}
