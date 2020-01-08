"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm/wasm_exec_wrapper"));
const WasmHooks_1 = tslib_1.__importDefault(require("./wasm/WasmHooks"));
class GabiVerifier {
    static async verifyAttributes({ proof, verifierSession, attesterPubKey, }) {
        const reponse = await wasm_exec_wrapper_1.default(WasmHooks_1.default.verifyAttributes, [proof, JSON.stringify(verifierSession), attesterPubKey]);
        return reponse;
    }
    // start verification
    static async startVerificationSession({ disclosedAttributes, }) {
        const { message, session } = await wasm_exec_wrapper_1.default(WasmHooks_1.default.startVerificationSession, disclosedAttributes);
        return {
            message: JSON.parse(message),
            session: JSON.parse(session),
        };
    }
}
exports.default = GabiVerifier;
//# sourceMappingURL=GabiVerifier.js.map