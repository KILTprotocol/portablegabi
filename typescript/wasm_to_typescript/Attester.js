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
var wasm_exec_wrapper_1 = require("./wasm_exec_wrapper");
var Enums_1 = require("./Enums");
var TestEnv_1 = require("./TestEnv");
// start attestation
function startAttestation(_a) {
    var _b = _a.privKey, privKey = _b === void 0 ? TestEnv_1["default"].privKey : _b, _c = _a.pubKey, pubKey = _c === void 0 ? TestEnv_1["default"].pubKey : _c;
    return __awaiter(this, void 0, void 0, function () {
        var _d, message, session;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, wasm_exec_wrapper_1["default"](Enums_1["default"].startAttestationSession, [
                        privKey,
                        pubKey
                    ])];
                case 1:
                    _d = _e.sent(), message = _d.message, session = _d.session;
                    return [2 /*return*/, { message: JSON.parse(message), session: JSON.parse(session) }];
            }
        });
    });
}
exports.startAttestation = startAttestation;
// issue attestation
exports.issueAttestation = function (_a) {
    var attesterSignSession = _a.attesterSignSession, reqSignMsg = _a.reqSignMsg, _b = _a.privKey, privKey = _b === void 0 ? TestEnv_1["default"].privKey : _b, _c = _a.pubKey, pubKey = _c === void 0 ? TestEnv_1["default"].pubKey : _c;
    return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, wasm_exec_wrapper_1["default"](Enums_1["default"].issueAttestation, [
                        privKey,
                        pubKey,
                        JSON.stringify(attesterSignSession),
                        JSON.stringify(reqSignMsg)
                    ])];
                case 1:
                    response = _d.sent();
                    return [2 /*return*/, response];
            }
        });
    });
};
// TODO: To be implemented when revocation is published
// revoke attestation
exports.revokeAttestation = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, wasm_exec_wrapper_1["default"](Enums_1["default"].revokeAttestation)];
    });
}); };
