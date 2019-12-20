import goWasmExec from "./wasm_exec_wrapper";
import GoHooks from "./Enums";
import testEnv from "./TestEnv";
import {
  IGabiAttestationRequest,
  IGabiAttestationStart,
  IGabiMessageSession
} from "./Types";

// start attestation
export async function startAttestation({
  privKey = testEnv.privKey,
  pubKey = testEnv.pubKey
}: {
  privKey?: string; // TODO: Make mandatory before sdk implementation
  pubKey?: string; // TODO: Make mandatory before sdk implementation
}): Promise<IGabiAttestationStart> {
  const {
    message,
    session
  }: {
    message: string;
    session: string;
  } = await goWasmExec<IGabiMessageSession>(GoHooks.startAttestationSession, [
    privKey,
    pubKey
  ]);
  return { message: JSON.parse(message), session: JSON.parse(session) };
}

// issue attestation
export const issueAttestation = async ({
  attesterSignSession,
  reqSignMsg,
  privKey = testEnv.privKey,
  pubKey = testEnv.pubKey
}: {
  attesterSignSession: IGabiAttestationStart["session"];
  reqSignMsg: IGabiAttestationRequest["message"];
  privKey?: string; // TODO: Make mandatory before sdk implementation
  pubKey?: string; // TODO: Make mandatory before sdk implementation
}): Promise<string> => {
  const response = await goWasmExec<string>(GoHooks.issueAttestation, [
    privKey,
    pubKey,
    JSON.stringify(attesterSignSession),
    JSON.stringify(reqSignMsg)
  ]);
  return response;
};

// TODO: To be implemented when revocation is published
// revoke attestation
export const revokeAttestation = async (): Promise<any> => {
  return goWasmExec(GoHooks.revokeAttestation);
};
