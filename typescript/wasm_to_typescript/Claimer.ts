import goWasmExec from "./wasm_exec_wrapper";
import GoHooks from "./Enums";
import testEnv from "./TestEnv";
import {
  IGabiAttestationRequest,
  IGabiAttestationStart,
  IGabiAttrMsg,
  IGabiClaimer,
  IGabiMessageSession
} from "./Types";

// generate master secret
export const genClaimer = async (): Promise<IGabiClaimer> =>
  JSON.parse(await goWasmExec<string>(GoHooks.genKey));

// request attestation
export const requestAttestation = async ({
  claimer,
  startAttestationMsg,
  claim = testEnv.claim,
  pubKey = testEnv.pubKey
}: {
  claimer: IGabiClaimer;
  startAttestationMsg: IGabiAttestationStart["message"];
  claim?: string; // TODO: Make mandatory before sdk implementation
  pubKey?: string; // TODO: Make mandatory before sdk implementation
}): Promise<IGabiAttestationRequest> => {
  const { session, message } = await goWasmExec<IGabiMessageSession>(
    GoHooks.requestAttestation,
    [
      JSON.stringify(claimer),
      claim,
      JSON.stringify(startAttestationMsg),
      pubKey
    ]
  );
  return { message: JSON.parse(message), session: JSON.parse(session) };
};

// build credential
export const buildCredential = async ({
  claimer,
  claimerSignSession,
  signature
}: {
  claimer: IGabiClaimer;
  claimerSignSession: IGabiAttestationRequest["session"];
  signature: string;
}): Promise<string> => {
  const response = await goWasmExec<string>(GoHooks.buildCredential, [
    JSON.stringify(claimer),
    JSON.stringify(claimerSignSession),
    signature
  ]);
  // console.log(JSON.parse(response));
  return response;
};

// reveal attributes
export const revealAttributes = async ({
  claimer,
  credential,
  reqRevealedAttrMsg,
  pubKey = testEnv.pubKey
}: {
  claimer: IGabiClaimer;
  credential: string;
  reqRevealedAttrMsg: IGabiAttrMsg;
  pubKey?: string;
}): Promise<string> => {
  const response = await goWasmExec<string>(GoHooks.revealAttributes, [
    JSON.stringify(claimer),
    credential,
    JSON.stringify(reqRevealedAttrMsg),
    pubKey
  ]);
  return response;
};
