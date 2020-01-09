"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const WasmHooks_1 = tslib_1.__importDefault(require("../wasm/WasmHooks"));
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("../wasm/wasm_exec_wrapper"));
class GabiClaimer {
    constructor(secret) {
        this.secret = secret;
    }
    static async buildFromMnemonic(mnemonic) {
        // secret's structure unmarshalled is { MasterSecret: string }
        const secret = await GabiClaimer.genSecret(mnemonic);
        return new GabiClaimer(secret);
    }
    // TODO: Find better name
    static async buildFromScratch() {
        const secret = await wasm_exec_wrapper_1.default(WasmHooks_1.default.genKey);
        return new GabiClaimer(secret);
    }
    static async genSecret(mnemonic) {
        return wasm_exec_wrapper_1.default(WasmHooks_1.default.keyFromMnemonic, [mnemonic]);
    }
    // request attestation
    async requestAttestation({ claim, startAttestationMsg, attesterPubKey, }) {
        const { session, message } = await wasm_exec_wrapper_1.default(WasmHooks_1.default.requestAttestation, [this.secret, claim, JSON.stringify(startAttestationMsg), attesterPubKey]);
        return {
            message: JSON.parse(message),
            session: JSON.parse(session),
        };
    }
    // build credential
    async buildCredential({ claimerSignSession, signature, }) {
        const response = await wasm_exec_wrapper_1.default(WasmHooks_1.default.buildCredential, [
            this.secret,
            JSON.stringify(claimerSignSession),
            signature,
        ]);
        return response;
    }
    // reveal attributes
    async revealAttributes({ credential, reqRevealedAttrMsg, attesterPubKey, }) {
        const response = await wasm_exec_wrapper_1.default(WasmHooks_1.default.revealAttributes, [
            this.secret,
            credential,
            JSON.stringify(reqRevealedAttrMsg),
            attesterPubKey,
        ]);
        return response;
    }
}
exports.default = GabiClaimer;
//# sourceMappingURL=GabiClaimer.js.map