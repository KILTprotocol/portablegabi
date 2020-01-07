"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PublicIdentity_1 = tslib_1.__importDefault(require("../identity/PublicIdentity"));
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm_exec_wrapper"));
const Enums_1 = tslib_1.__importDefault(require("./Enums"));
// TODO: Remove extends PublicIdentity?
class AcVerifier extends PublicIdentity_1.default {
    static async verifyAttributes({ proof, verifierSession, attesterPubKey, }) {
        const reponse = await wasm_exec_wrapper_1.default(Enums_1.default.verifyAttributes, [proof, JSON.stringify(verifierSession), attesterPubKey]);
        return reponse;
    }
    // start verification
    static async startVerificationSession({ disclosedAttributes, }) {
        const { message, session } = await wasm_exec_wrapper_1.default(Enums_1.default.startVerificationSession, disclosedAttributes);
        return { message: JSON.parse(message), session: JSON.parse(session) };
    }
}
exports.default = AcVerifier;
//# sourceMappingURL=AcVerifier.js.map