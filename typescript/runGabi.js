"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const src_1 = require("./kilt-sdk/src");
const AcClaimer_1 = tslib_1.__importDefault(require("./kilt-sdk/src/anonymousCredentials/AcClaimer"));
const TestEnv_1 = tslib_1.__importDefault(require("./kilt-sdk/src/anonymousCredentials/TestEnv"));
const AcAttester_1 = tslib_1.__importDefault(require("./kilt-sdk/src/anonymousCredentials/AcAttester"));
const AcVerifier_1 = tslib_1.__importDefault(require("./kilt-sdk/src/anonymousCredentials/AcVerifier"));
// class IGabiIdentity extends Identity {}
const runGabi = async () => {
    const mnemonic = `scissors purse again yellow cabbage fat alpha come snack ripple jacket broken`;
    const claimer = src_1.Identity.buildFromMnemonic(mnemonic);
    console.log('Claimer \n', claimer);
    // load from test environment
    const { disclosedAttributes, ctype, claimRaw, privKey, pubKey } = TestEnv_1.default;
    // create claim
    const claim = src_1.Claim.fromCTypeAndClaimContents(new src_1.CType(JSON.parse(ctype)), claimRaw, claimer.address);
    /**
     * GABI STUFF.
     * */
    console.time('>> Complete Gabi process <<');
    // build claimer identity
    // TODO: pull from master + add mnemonic
    console.time('(1) Build claimer identity');
    const acClaimer = await AcClaimer_1.default.buildFromMnemonic('test');
    console.timeEnd('(1) Build claimer identity');
    console.time('(2) Start attestation: attester sends 2 nonces to claimer');
    const acAttester = new AcAttester_1.default(pubKey, privKey);
    const attesterPubKey = acAttester.getPubKey();
    const { message: startAttestationMsg, session: attesterSignSession, } = await acAttester.startAttestation();
    console.timeEnd('(2) Start attestation: attester sends 2 nonces to claimer');
    console.time('(3) Claimer requests attestation');
    const { message: reqSignMsg, session: claimerSignSession, } = await acClaimer.requestAttestation({
        startAttestationMsg,
        claim,
        attesterPubKey,
    });
    console.timeEnd('(3) Claimer requests attestation');
    console.log(reqSignMsg, claimerSignSession);
    console.time('(4) Attester issues requested attestation');
    const aSignature = await acAttester.issueAttestation({
        attesterSignSession,
        reqSignMsg,
    });
    console.timeEnd('(4) Attester issues requested attestation');
    console.time('(5) Claimer builds credential');
    const credential = await acClaimer.buildCredential({
        claimerSignSession,
        signature: aSignature,
    });
    console.timeEnd('(5) Claimer builds credential');
    console.log(credential);
    console.time('(6) Start verification: verifier sends 2 nonces to claimer');
    const { session: verifierSession, message: reqRevealedAttrMsg, } = await AcVerifier_1.default.startVerificationSession({ disclosedAttributes });
    console.timeEnd('(6) Start verification: verifier sends 2 nonces to claimer');
    console.log(claim.contents);
    console.time('(7) Slaimer reveals attributes');
    const proof = await acClaimer.revealAttributes({
        credential,
        reqRevealedAttrMsg,
        attesterPubKey,
    });
    console.timeEnd('(7) Slaimer reveals attributes');
    console.time('(8) Verifier verifies attributes');
    const { claim: verifiedClaim, verified } = await AcVerifier_1.default.verifyAttributes({
        proof,
        verifierSession,
        attesterPubKey,
    });
    console.timeEnd('(8) Verifier verifies attributes');
    console.log(verifiedClaim, verified);
    console.timeEnd('>> Complete Gabi process <<');
};
runGabi();
//# sourceMappingURL=runGabi.js.map