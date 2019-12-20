"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm_exec_wrapper"));
const Enums_1 = tslib_1.__importDefault(require("./Enums"));
const TestEnv_1 = tslib_1.__importDefault(require("./TestEnv"));
// start attestation
async function startAttestation({ privKey = TestEnv_1.default.privKey, pubKey = TestEnv_1.default.pubKey }) {
    const { message, session } = await wasm_exec_wrapper_1.default(Enums_1.default.startAttestationSession, [
        privKey,
        pubKey
    ]);
    return { message: JSON.parse(message), session: JSON.parse(session) };
}
exports.startAttestation = startAttestation;
// issue attestation
exports.issueAttestation = async ({ attesterSignSession, reqSignMsg, privKey = TestEnv_1.default.privKey, pubKey = TestEnv_1.default.pubKey }) => {
    const response = await wasm_exec_wrapper_1.default(Enums_1.default.issueAttestation, [
        privKey,
        pubKey,
        JSON.stringify(attesterSignSession),
        JSON.stringify(reqSignMsg)
    ]);
    return response;
};
// TODO: To be implemented when revocation is published
// revoke attestation
exports.revokeAttestation = async () => {
    return wasm_exec_wrapper_1.default(Enums_1.default.revokeAttestation);
};
//# sourceMappingURL=Attester.js.map