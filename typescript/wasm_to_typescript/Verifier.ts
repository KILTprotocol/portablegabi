import goWasmExec from "./wasm_exec_wrapper";
import GoHooks from "./Enums";
import testEnv from "./TestEnv";
import { IGabiAttrMsg, IGabiMessageSession, IGabiVerifiedAtts } from "./Types";

export const verifyAttributes = async ({
  proof,
  verifierSession,
  pubKey = testEnv.pubKey
}: {
  proof: string;
  verifierSession: { [key: string]: any };
  pubKey?: string;
}): Promise<IGabiVerifiedAtts> => {
  const reponse = await goWasmExec<IGabiVerifiedAtts>(
    GoHooks.verifyAttributes,
    [proof, JSON.stringify(verifierSession), pubKey]
  );
  return reponse;
};

// start verification
export const startVerificationSession = async ({
  disclosedAttributes = testEnv.disclosedAttributes
}: {
  disclosedAttributes?: string[]; // TODO: Make mandatory before sdk implementation
}): Promise<{
  message: IGabiAttrMsg;
  session: { [key: string]: any };
}> => {
  const { message, session } = await goWasmExec<IGabiMessageSession>(
    GoHooks.startVerificationSession,
    disclosedAttributes
  );
  return { message: JSON.parse(message), session: JSON.parse(session) };
};
