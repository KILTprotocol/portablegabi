"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Attester_1 = require("./wasm_to_typescript/Attester");
const Claimer_1 = require("./wasm_to_typescript/Claimer");
const Verifier_1 = require("./wasm_to_typescript/Verifier");
const runGabiProcess = async () => {
    try {
        console.time("(1) Claimer");
        const claimer = await Claimer_1.genClaimer();
        console.timeEnd("(1) Claimer");
        console.log(claimer);
        console.time("(2) Start attestation");
        const { message: startAttestationMsg, session: attesterSignSession } = await Attester_1.startAttestation({});
        console.timeEnd("(2) Start attestation");
        console.log({ startAttestationMsg, attesterSignSession });
        console.time("(3) Request attestation");
        const { message: reqSignMsg, session: claimerSignSession } = await Claimer_1.requestAttestation({
            claimer,
            startAttestationMsg
        });
        console.timeEnd("(3) Request attestation");
        console.log(reqSignMsg, claimerSignSession);
        console.time("(4) Issue attestation");
        const signature = await Attester_1.issueAttestation({
            attesterSignSession,
            reqSignMsg
        });
        console.timeEnd("(4) Issue attestation");
        console.log(signature);
        console.time("(5) Build Credential");
        const credential = await Claimer_1.buildCredential({
            claimer,
            claimerSignSession,
            signature
        });
        console.timeEnd("(5) Build Credential");
        console.log(credential);
        console.time("(6) Start Verification");
        const { session: verifierSession, message: reqRevealedAttrMsg } = await Verifier_1.startVerificationSession({});
        console.timeEnd("(6) Start Verification");
        console.log(reqRevealedAttrMsg, verifierSession);
        console.time("(7) Reveal Attributes");
        const proof = await Claimer_1.revealAttributes({
            claimer,
            credential,
            reqRevealedAttrMsg
        });
        console.timeEnd("(7) Reveal Attributes");
        console.log(proof);
        console.time("(8) Verify Attributes");
        const { claim, verified } = await Verifier_1.verifyAttributes({
            proof,
            verifierSession
        });
        console.timeEnd("(8) Verify Attributes");
        console.log(claim, verified);
        console.time("(9) Revoked");
        const revoked = await Attester_1.revokeAttestation();
        console.timeEnd("(9) Revoked");
        console.log(revoked);
    }
    catch (e) {
        console.error("Gabi process error", e.stack);
    }
};
(async () => runGabiProcess())();
//# sourceMappingURL=index.js.map