export interface IGabiClaimer {
  MasterSecret: string;
}

export interface IGabiMessageSession {
  message: string;
  session: string;
}

// TODO: remove?
export interface IGabiPk {
  XMLName: { Space: string; Local: string };
  Counter: number;
  ExpiryDate: number;
  N: string;
  Z: string;
  S: string;
  R: string[];
  EpochLength: number;
  Params: { [key: string]: number };
  Issuer: string;
}

export interface IGabiAttestationStart {
  // TODO: remove typing of nested keys
  message: {
    nonce: string;
    context: string;
  };
  // TODO: remove typing of nested keys
  session: {
    GabiIssuer: {
      Sk: {
        XMLName: { Space: string; Local: string };
        Counter: number;
        ExpiryDate: number;
        P: string;
        Q: string;
        PPrime: string;
        QPrime: string;
      };
      Pk: IGabiPk;
      Context: string;
    };
  };
}

export interface IGabiAttestationRequest {
  // TODO: remove typing of nested keys
  message: {
    commitMsg: {
      U: string;
      n_2: string;
      combinedProofs: any[];
      proofPJwt: string;
      proofPJwts: string | null;
    };
    values: string[];
  };
  // TODO: remove typing of nested keys
  session: {
    cb: {
      Secret: string;
      VPrime: string;
      VPrimeCommit: string | null;
      Nonce2: string;
      U: string;
      UCommit: string;
      SkRandomizer: string | null;
      Pk: IGabiPk;
      Context: string;
      ProofPcomm: string | null;
    };
    claim: {
      cType: string;
      contents: any;
    };
  };
}

export interface IGabiAttrMsg {
  disclosedAttributes: string[];
  context: string;
  nonce: string;
}

export interface IGabiVerifiedAtts {
  verified: "true" | "false";
  claim: string;
}
