"use strict";
exports.__esModule = true;
// eslint-disable-next-line @typescript-eslint/no-var-requires
var goWasm = require("./wasm_exec");
var goWasmExec = function (goHook, args) {
    return goWasm.exec(goHook, args);
};
exports["default"] = goWasmExec;
// const test = {
//   privKey:
//     '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"P":"j3TUnfX+Ru749PHYyjZfOsQvr6wuuCtcDna1jZiSvNAQiLu9zHbNsH1hOAjfRqhutBSJSN65c0MK1dVqo9K1+w==","Q":"94n5HwmUePijRew9oJ5FoKbMgx9uMAoDzAz3fPo6IbV9326RAsurWg5GKBVppeaYcs5SRMYAJNifUZnfE/nRjw==","PPrime":"R7pqTvr/I3d8enjsZRsvnWIX19YXXBWuBztaxsxJXmgIRF3e5jtm2D6wnARvo1Q3WgpEpG9cuaGFauq1Uela/Q==","QPrime":"e8T8j4TKPHxRovYe0E8i0FNmQY+3GAUB5gZ7vn0dENq+77dIgWXVrQcjFAq00vNMOWcpImMAEmxPqMzvifzoxw=="}',
//   pubKey:
//     '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"N":"ircKRDgyrbg2L1WZBI9MWjz8QL3Nwwn7baxtz0yhQN8Jg62LHkrFgQOIR9IyvyxIF69Ku1VNFC8AUwm7Ggd9Bzj/YjIUuiQC4osOFLgo86Dbhfs2mXIaY3sbBm6wuvi0wuyUAvO/dgZkLM8rjrgRdSq2D/7jZLdnPErKaitokjU=","Z":"GGvSolZf14GGsMADXL9IWj1A/Ue/RcNz1mt8wldyagfRMIwIjMYv4J5E0sIuHHPaWj3qc7MvJJ6AfzX4zsO2EMunQP+gAU08AOyfhFT+J8udnDx0Fuh2lRCjIoTPti082KrcielCkRmqEYL5BZpAiI37m/dabi0woZ8nIi5U64I=","S":"NfqG8fq9iudU2Bp/w8O5Sv+dJpJY3uOxA1WnF/a80ZRxE83GgckhTf/5/clHD3/k6CbhMnzjqJd0udz0NYjs03D+hlvgLliLhaEuWGTa5BFgjCOuecHPufcFOUNeDoZqXXICg/g+qWeOV6FpBJLOp8WXudIDpk7SLlqY3SRtbrY=","R":["WXPAAtAdx1Y+q1596/T8q/20+kwNpJNc0H3dRgA1H+naCF4J3N9jCTFZjNgnJEZstxCHNhpw/NgyZyqxbk0AsFSUFWsaBAPgZkwHsCc6yKywohrunF3Sahna9ALdcOHl+bHzQyx3uFc1GmDiOPdXuIQUUcYKOoMDdbW2EbRCvqY=","eFPGceT5r70BlIJ14bQ5I5M1zLFKu8okfIfFpyPRhVHWuLciTpe0bhyhhXLv06UVu2TUNeLT0MskB7c16MeQVJ0ToN6O8qpexIAqVOX2VY5eUMPKT88liVNrAu/+lAyj/Sac+v8r+gv3Y4KO3Hiv36rk14sB4TnmTzmKYTf5Zj0=","h245+272Ee/5F8qsMog9U73JGDo8/v0DuKt/QJrSxfuu3Tpf1rvE1pgp+jiPWHfs9PkDAp4HWD4VlNxhiH2uxvjxXocGGE7naFI+M7uWrZ85Vg0ayHL3uoHP9vuwck8j7IzPO+vSQmd/N+v6SRxMYK4kM31EN49BBWzk+Bs+68E=","MDa1U56jhGayP1A7Afk3NL2vKkPzqELiYJmCzGkODgx3BEYuR8jibrsv3qzRwzMTJcldgWy3XJ/4GgL9wK9fg+uyHhezy5+WyKUC79aS7Epo4zE5VEFiCxK6KAI8AYwrnbhmdoc9nfWQlB4PhEhls5t6V8TIzIIbIzzhEUNtuZU=","f0+tsyHtvzMD40JrKU/SGaXe3m+8xMgu8IHJnzjlBZ9VCtsJMtrSpNITyGM6VognWGLQwYy8qQ66LzfPtELi6UuNmzp7NTcPbT4GF+Ho4qszxDXsFFGigZhghSViJvxwQYDw6khjjJT1s5mLMXM4NQiesxeWwN2Zd1zvv//HVwA=","cSq1ohLOaVMEpfRlFvvpYJqOBRgzTnPdmf5KdGRqqabLo/xAL23AX6o7919g4gr6dH+T+1NgX1L8ozPKOKGVJv0rwBdLnvttLK1Ay5RZmQItKiHEM9sr+8t2gpeQFpw1Y2kVN1JDwrjL2ZqKgiatg7Z5NWV594bkkqNEFCB4xV4=","DlT9g64FDgjAT0X0bA7AzZhBR0cgWaQ86HAziyF9/E2uHuM92vDtiOf98pQt6TVoeWjMBSc9PoAL7+yDa7ZWHNdj1GoTcfZdv27ZeactfFgX99DaskPeHdiPHcFgj/x1ViWNZkJ6nYrIuRIsMPL3pWt52IybMYrJASPDelGQik4="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":""}',
//   claim: JSON.stringify({
//     cType: "0x39ffc33202410721743e19082986e650b4e847b85bea7eab77...",
//     contents: {
//       id: 9007199254740993,
//       guid: "006ee0f3-7edd-4010-ab21-458df91dc0d5",
//       balance: 3289.88,
//       picture: "http://placehold.it/32x32",
//       eyeColor: true
//     }
//   }),
//   disclosedAttributes: [
//     "ctype",
//     "contents.eyeColor",
//     "contents.balance",
//     "contents.id"
//   ]
// };
// enum GoHooks {
//   genKeyPair = "genKeyPair",
//   genKey = "genKey",
//   startAttestationSession = "startAttestationSession",
//   requestAttestation = "requestAttestation",
//   issueAttestation = "issueAttestation",
//   buildCredential = "buildCredential",
//   startVerificationSession = "startVerificationSession",
//   revealAttributes = "revealAttributes",
//   verifyAttributes = "verifyAttributes",
//   revokeAttestation = "revokeAttestation"
// }
// interface IGabiClaimer {
//   MasterSecret: string;
// }
// interface IGabiMessageSession {
//   message: string;
//   session: string;
// }
// // TODO: remove?
// interface IGabiPk {
//   XMLName: { Space: string; Local: string };
//   Counter: number;
//   ExpiryDate: number;
//   N: string;
//   Z: string;
//   S: string;
//   R: string[];
//   EpochLength: number;
//   Params: { [key: string]: number };
//   Issuer: string;
// }
// interface IGabiAttestationStart {
//   // TODO: remove typing of nested keys
//   message: {
//     nonce: string;
//     context: string;
//   };
//   // TODO: remove typing of nested keys
//   session: {
//     GabiIssuer: {
//       Sk: {
//         XMLName: { Space: string; Local: string };
//         Counter: number;
//         ExpiryDate: number;
//         P: string;
//         Q: string;
//         PPrime: string;
//         QPrime: string;
//       };
//       Pk: IGabiPk;
//       Context: string;
//     };
//   };
// }
// interface IGabiAttestationRequest {
//   // TODO: remove typing of nested keys
//   message: {
//     commitMsg: {
//       U: string;
//       n_2: string;
//       combinedProofs: any[];
//       proofPJwt: string;
//       proofPJwts: string | null;
//     };
//     values: string[];
//   };
//   // TODO: remove typing of nested keys
//   session: {
//     cb: {
//       Secret: string;
//       VPrime: string;
//       VPrimeCommit: string | null;
//       Nonce2: string;
//       U: string;
//       UCommit: string;
//       SkRandomizer: string | null;
//       Pk: IGabiPk;
//       Context: string;
//       ProofPcomm: string | null;
//     };
//     claim: {
//       cType: string;
//       contents: any;
//     };
//   };
// }
// interface IGabiAttrMsg {
//   disclosedAttributes: string[];
//   context: string;
//   nonce: string;
// }
// // generate master secret
// export const genClaimer = async (): Promise<IGabiClaimer> =>
//   JSON.parse(await goWasmExec<string>(GoHooks.genKey));
// // start attestation
// export const startAttestation = async ({
//   privKey = test.privKey,
//   pubKey = test.pubKey
// }: {
//   privKey?: string; // TODO: Make mandatory before sdk implementation
//   pubKey?: string; // TODO: Make mandatory before sdk implementation
// }): Promise<IGabiAttestationStart> => {
//   const {
//     message,
//     session
//   }: {
//     message: string;
//     session: string;
//   } = await goWasmExec<IGabiMessageSession>(GoHooks.startAttestationSession, [
//     privKey,
//     pubKey
//   ]);
//   return { message: JSON.parse(message), session: JSON.parse(session) };
// };
// // request attestation
// export const requestAttestation = async ({
//   claimer,
//   startAttestationMsg,
//   claim = test.claim,
//   pubKey = test.pubKey
// }: {
//   claimer: IGabiClaimer;
//   startAttestationMsg: IGabiAttestationStart["message"];
//   claim?: string; // TODO: Make mandatory before sdk implementation
//   pubKey?: string; // TODO: Make mandatory before sdk implementation
// }): Promise<IGabiAttestationRequest> => {
//   const { session, message } = await goWasmExec<IGabiMessageSession>(
//     GoHooks.requestAttestation,
//     [
//       JSON.stringify(claimer),
//       claim,
//       JSON.stringify(startAttestationMsg),
//       pubKey
//     ]
//   );
//   return { message: JSON.parse(message), session: JSON.parse(session) };
// };
// // issue attestation
// export const issueAttestation = async ({
//   attesterSignSession,
//   reqSignMsg,
//   privKey = test.privKey,
//   pubKey = test.pubKey
// }: {
//   attesterSignSession: IGabiAttestationStart["session"];
//   reqSignMsg: IGabiAttestationRequest["message"];
//   privKey?: string; // TODO: Make mandatory before sdk implementation
//   pubKey?: string; // TODO: Make mandatory before sdk implementation
// }): Promise<string> => {
//   const response = await goWasmExec<string>(GoHooks.issueAttestation, [
//     privKey,
//     pubKey,
//     JSON.stringify(attesterSignSession),
//     JSON.stringify(reqSignMsg)
//   ]);
//   return response;
// };
// // build credential
// export const buildCredential = async ({
//   claimer,
//   claimerSignSession,
//   signature
// }: {
//   claimer: IGabiClaimer;
//   claimerSignSession: IGabiAttestationRequest["session"];
//   signature: string;
// }): Promise<string> => {
//   const response = await goWasmExec<string>(GoHooks.buildCredential, [
//     JSON.stringify(claimer),
//     JSON.stringify(claimerSignSession),
//     signature
//   ]);
//   // console.log(JSON.parse(response));
//   return response;
// };
// // start verification
// export const startVerificationSession = async ({
//   disclosedAttributes = test.disclosedAttributes
// }: {
//   disclosedAttributes?: string[]; // TODO: Make mandatory before sdk implementation
// }): Promise<{
//   message: IGabiAttrMsg;
//   session: { [key: string]: any };
// }> => {
//   const { message, session } = await goWasmExec<IGabiMessageSession>(
//     GoHooks.startVerificationSession,
//     disclosedAttributes
//   );
//   return { message: JSON.parse(message), session: JSON.parse(session) };
// };
// // reveal attributes and create proof
// export const revealAttributes = async ({
//   claimer,
//   credential,
//   reqRevealedAttrMsg,
//   pubKey = test.pubKey
// }: {
//   claimer: IGabiClaimer;
//   credential: string;
//   reqRevealedAttrMsg: IGabiAttrMsg;
//   pubKey?: string;
// }): Promise<string> => {
//   const response = await goWasmExec<string>(GoHooks.revealAttributes, [
//     JSON.stringify(claimer),
//     credential,
//     JSON.stringify(reqRevealedAttrMsg),
//     pubKey
//   ]);
//   return response;
// };
// // verify proof
// interface IGabiVerifiedAtts {
//   verified: "true" | "false";
//   claim: string;
// }
// export const verifyAttributes = async ({
//   proof,
//   verifierSession,
//   pubKey = test.pubKey
// }: {
//   proof: string;
//   verifierSession: { [key: string]: any };
//   pubKey?: string;
// }): Promise<IGabiVerifiedAtts> => {
//   const reponse = await goWasmExec<IGabiVerifiedAtts>(
//     GoHooks.verifyAttributes,
//     [proof, JSON.stringify(verifierSession), pubKey]
//   );
//   return reponse;
// };
// // TODO: To be implemented when revocation is published
// // revoke attestation
// export const revokeAttestation = async (): Promise<any> => {
//   return goWasmExec(GoHooks.revokeAttestation);
// };
