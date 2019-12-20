"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm_exec_wrapper"));
const Enums_1 = tslib_1.__importDefault(require("./Enums"));
const TestEnv_1 = tslib_1.__importDefault(require("./TestEnv"));
// generate master secret
exports.genClaimer = async () => JSON.parse(await wasm_exec_wrapper_1.default(Enums_1.default.genKey));
// request attestation
exports.requestAttestation = async ({ claimer, startAttestationMsg, claim = TestEnv_1.default.claim, pubKey = TestEnv_1.default.pubKey }) => {
    const { session, message } = await wasm_exec_wrapper_1.default(Enums_1.default.requestAttestation, [
        JSON.stringify(claimer),
        claim,
        JSON.stringify(startAttestationMsg),
        pubKey
    ]);
    return { message: JSON.parse(message), session: JSON.parse(session) };
};
// build credential
exports.buildCredential = async ({ claimer, claimerSignSession, signature }) => {
    const response = await wasm_exec_wrapper_1.default(Enums_1.default.buildCredential, [
        JSON.stringify(claimer),
        JSON.stringify(claimerSignSession),
        signature
    ]);
    // console.log(JSON.parse(response));
    return response;
};
// reveal attributes
exports.revealAttributes = async ({ claimer, credential, reqRevealedAttrMsg, pubKey = TestEnv_1.default.pubKey }) => {
    const response = await wasm_exec_wrapper_1.default(Enums_1.default.revealAttributes, [
        JSON.stringify(claimer),
        credential,
        JSON.stringify(reqRevealedAttrMsg),
        pubKey
    ]);
    return response;
};
//# sourceMappingURL=Claimer.js.map