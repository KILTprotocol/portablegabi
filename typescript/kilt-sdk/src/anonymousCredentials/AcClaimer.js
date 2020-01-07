"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wasm_exec_wrapper_1 = tslib_1.__importDefault(require("./wasm_exec_wrapper"));
const Enums_1 = tslib_1.__importDefault(require("./Enums"));
class AcClaimer {
    constructor(secret) {
        this.secret = secret;
    }
    // TODO: Add checks for invalid mnemonic
    static async buildFromMnemonic(mnemonic) {
        const { MasterSecret: secret } = await AcClaimer.genClaimer(mnemonic);
        return new AcClaimer(secret);
    }
    static async genClaimer(mnemonic) {
        return JSON.parse(await wasm_exec_wrapper_1.default(Enums_1.default.genKey, [mnemonic]));
    }
    // request attestation
    async requestAttestation({ claim, startAttestationMsg, attesterPubKey, }) {
        const { session, message } = await wasm_exec_wrapper_1.default(Enums_1.default.requestAttestation, [
            JSON.stringify({ MasterSecret: this.secret }),
            JSON.stringify(claim),
            JSON.stringify(startAttestationMsg),
            attesterPubKey,
        ]);
        return {
            message: JSON.parse(message),
            session: JSON.parse(session),
        };
    }
    // build credential
    async buildCredential({ claimerSignSession, signature, }) {
        console.log(this.secret);
        const response = await wasm_exec_wrapper_1.default(Enums_1.default.buildCredential, [
            JSON.stringify({ MasterSecret: this.secret }),
            JSON.stringify(claimerSignSession),
            signature,
        ]);
        return response;
    }
    // reveal attributes
    async revealAttributes({ credential, reqRevealedAttrMsg, attesterPubKey, }) {
        const response = await wasm_exec_wrapper_1.default(Enums_1.default.revealAttributes, [
            JSON.stringify({ MasterSecret: this.secret }),
            credential,
            JSON.stringify(reqRevealedAttrMsg),
            attesterPubKey,
        ]);
        return response;
    }
}
exports.default = AcClaimer;
//# sourceMappingURL=AcClaimer.js.map