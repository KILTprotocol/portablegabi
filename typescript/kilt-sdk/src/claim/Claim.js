"use strict";
/**
 * Claims are a core building block of the KILT SDK. A claim represents **something an entity claims about itself**. Once created, a claim can be used to create a [[RequestForAttestation]].
 * ***
 * A claim object has:
 * * contents - among others, the pure content of a claim, for example `"isOver18": yes`;
 * * a [[CType]] that represents its data structure.
 * <br><br>
 * A claim object's owner is (should be) the same entity as the claimer.
 * @module Claim
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const CTypeUtils_1 = require("../ctype/CTypeUtils");
function verifyClaim(claimContents, cTypeSchema) {
    return CTypeUtils_1.verifyClaimStructure(claimContents, cTypeSchema);
}
class Claim {
    constructor(claimInput) {
        if (!claimInput.cTypeHash || !claimInput.contents || !claimInput.owner) {
            throw new Error(`Property Not Provided while building Claim:\n
        claimInput.cTypeHash:\n
          ${claimInput.cTypeHash}\n
          claimInput.contents:\n
          ${claimInput.contents}\n
          claimInput.owner:\n'
          ${claimInput.owner}`);
        }
        this.cTypeHash = claimInput.cTypeHash;
        this.contents = claimInput.contents;
        this.owner = claimInput.owner;
    }
    static fromClaim(claimInput, cTypeSchema) {
        if (cTypeSchema) {
            if (!verifyClaim(claimInput.contents, cTypeSchema)) {
                throw Error('Claim not valid');
            }
        }
        return new Claim(claimInput);
    }
    static fromCTypeAndClaimContents(ctypeInput, claimContents, claimOwner) {
        if (ctypeInput.schema) {
            if (!verifyClaim(claimContents, ctypeInput.schema)) {
                throw Error('Claim not valid');
            }
        }
        return new Claim({
            cTypeHash: ctypeInput.hash,
            contents: claimContents,
            owner: claimOwner,
        });
    }
}
exports.default = Claim;
//# sourceMappingURL=Claim.js.map