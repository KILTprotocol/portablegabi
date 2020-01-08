"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm/wasm_exec_wrapper"));
const WasmHooks_1 = tslib_1.__importDefault(require("./wasm/WasmHooks"));
class GabiAttester {
    constructor(pubKey, privKey) {
        // TODO: To be implemented when revocation is published
        // revoke attestation
        this.revokeAttestation = async () => {
            return wasm_exec_wrapper_1.default(WasmHooks_1.default.revokeAttestation);
        };
        this.pubKey = pubKey;
        this.privKey = privKey;
    }
    // generate keypair
    static async keyFromMnemonicpair() {
        const validityDuration = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000; // 365 days in nanoseconds
        return wasm_exec_wrapper_1.default(WasmHooks_1.default.genKeypair, [70, validityDuration]);
    }
    static async buildFromScratch() {
        const { privKey, pubKey } = await GabiAttester.keyFromMnemonicpair();
        return new GabiAttester(pubKey, privKey);
    }
    getPubKey() {
        return this.pubKey;
    }
    // start attestation
    async startAttestation() {
        const { message, session, } = await wasm_exec_wrapper_1.default(WasmHooks_1.default.startAttestationSession, [
            this.privKey,
            this.pubKey,
        ]);
        return { message: JSON.parse(message), session: JSON.parse(session) };
    }
    // issue attestation
    async issueAttestation({ attesterSignSession, reqSignMsg, }) {
        const response = await wasm_exec_wrapper_1.default(WasmHooks_1.default.issueAttestation, [
            this.privKey,
            this.pubKey,
            JSON.stringify(attesterSignSession),
            JSON.stringify(reqSignMsg),
        ]);
        return response;
    }
}
exports.default = GabiAttester;
//# sourceMappingURL=GabiAttester.js.map