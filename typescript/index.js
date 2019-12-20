"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Attester_1 = require("./wasm_to_typescript/Attester");
var Claimer_1 = require("./wasm_to_typescript/Claimer");
var Verifier_1 = require("./wasm_to_typescript/Verifier");
var runGabiProcess = function () { return __awaiter(void 0, void 0, void 0, function () {
    var claimer, _a, startAttestationMsg, attesterSignSession, _b, reqSignMsg, claimerSignSession, signature, credential, _c, verifierSession, reqRevealedAttrMsg, proof, _d, claim, verified, revoked, e_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 10, , 11]);
                console.time("(1) Claimer");
                return [4 /*yield*/, Claimer_1.genClaimer()];
            case 1:
                claimer = _e.sent();
                console.timeEnd("(1) Claimer");
                console.log(claimer);
                console.time("(2) Start attestation");
                return [4 /*yield*/, Attester_1.startAttestation({})];
            case 2:
                _a = _e.sent(), startAttestationMsg = _a.message, attesterSignSession = _a.session;
                console.timeEnd("(2) Start attestation");
                console.log({ startAttestationMsg: startAttestationMsg, attesterSignSession: attesterSignSession });
                console.time("(3) Request attestation");
                return [4 /*yield*/, Claimer_1.requestAttestation({
                        claimer: claimer,
                        startAttestationMsg: startAttestationMsg
                    })];
            case 3:
                _b = _e.sent(), reqSignMsg = _b.message, claimerSignSession = _b.session;
                console.timeEnd("(3) Request attestation");
                console.log(reqSignMsg, claimerSignSession);
                console.time("(4) Issue attestation");
                return [4 /*yield*/, Attester_1.issueAttestation({
                        attesterSignSession: attesterSignSession,
                        reqSignMsg: reqSignMsg
                    })];
            case 4:
                signature = _e.sent();
                console.timeEnd("(4) Issue attestation");
                console.log(signature);
                console.time("(5) Build Credential");
                return [4 /*yield*/, Claimer_1.buildCredential({
                        claimer: claimer,
                        claimerSignSession: claimerSignSession,
                        signature: signature
                    })];
            case 5:
                credential = _e.sent();
                console.timeEnd("(5) Build Credential");
                console.log(credential);
                console.time("(6) Start Verification");
                return [4 /*yield*/, Verifier_1.startVerificationSession({})];
            case 6:
                _c = _e.sent(), verifierSession = _c.session, reqRevealedAttrMsg = _c.message;
                console.timeEnd("(6) Start Verification");
                console.log(reqRevealedAttrMsg, verifierSession);
                console.time("(7) Reveal Attributes");
                return [4 /*yield*/, Claimer_1.revealAttributes({
                        claimer: claimer,
                        credential: credential,
                        reqRevealedAttrMsg: reqRevealedAttrMsg
                    })];
            case 7:
                proof = _e.sent();
                console.timeEnd("(7) Reveal Attributes");
                console.log(proof);
                console.time("(8) Verify Attributes");
                return [4 /*yield*/, Verifier_1.verifyAttributes({
                        proof: proof,
                        verifierSession: verifierSession
                    })];
            case 8:
                _d = _e.sent(), claim = _d.claim, verified = _d.verified;
                console.timeEnd("(8) Verify Attributes");
                console.log(claim, verified);
                console.time("(9) Revoked");
                return [4 /*yield*/, Attester_1.revokeAttestation()];
            case 9:
                revoked = _e.sent();
                console.timeEnd("(9) Revoked");
                console.log(revoked);
                return [3 /*break*/, 11];
            case 10:
                e_1 = _e.sent();
                console.error("Gabi process error", e_1.stack);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, runGabiProcess()];
}); }); })();
