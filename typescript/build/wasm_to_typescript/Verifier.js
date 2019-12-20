"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm_exec_wrapper"));
const Enums_1 = tslib_1.__importDefault(require("./Enums"));
const TestEnv_1 = tslib_1.__importDefault(require("./TestEnv"));
exports.verifyAttributes = async ({ proof, verifierSession, pubKey = TestEnv_1.default.pubKey }) => {
    const reponse = await wasm_exec_wrapper_1.default(Enums_1.default.verifyAttributes, [proof, JSON.stringify(verifierSession), pubKey]);
    return reponse;
};
// start verification
exports.startVerificationSession = async ({ disclosedAttributes = TestEnv_1.default.disclosedAttributes }) => {
    const { message, session } = await wasm_exec_wrapper_1.default(Enums_1.default.startVerificationSession, disclosedAttributes);
    return { message: JSON.parse(message), session: JSON.parse(session) };
};
//# sourceMappingURL=Verifier.js.map