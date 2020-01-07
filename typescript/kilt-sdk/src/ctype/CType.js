"use strict";
/**
 * CTypes are the way the KILT protocol enables a Claimer or Attester or Verifier to create a [[Claim]] schema for creating specific credentials.
 *  ***
 * * A CTYPE is a description of the [[Claim]] data structure, based on [JSON Schema](http://json-schema.org/).
 * * CTYPEs are published and stored by the creator and/or in an open storage registry.
 * * Anyone can use a CTYPE to create a new [[Claim]].
 * @module CType
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove
 */
const CTypeSchema_1 = require("./CTypeSchema");
const CTypeUtils = tslib_1.__importStar(require("./CTypeUtils"));
const CType_chain_1 = require("./CType.chain");
class CType {
    constructor(cTypeInput) {
        this.schema = cTypeInput.schema;
        if (!cTypeInput.metadata) {
            throw new Error(`No metadata provided:${cTypeInput.metadata}`);
        }
        this.metadata = cTypeInput.metadata;
        this.owner = cTypeInput.owner;
        if (!cTypeInput.hash) {
            this.hash = CTypeUtils.getHashForSchema(this.schema);
        }
        else {
            this.hash = cTypeInput.hash;
        }
    }
    static fromCType(cTypeInput) {
        if (!CTypeUtils.verifySchema(cTypeInput, CTypeSchema_1.CTypeWrapperModel)) {
            throw new Error('CType does not correspond to schema');
        }
        if (cTypeInput.hash) {
            if (CTypeUtils.getHashForSchema(cTypeInput.schema) !== cTypeInput.hash) {
                throw Error('provided and generated cType hash are not matching');
            }
        }
        return new CType(cTypeInput);
    }
    async store(identity) {
        return CType_chain_1.store(this, identity);
    }
    verifyClaimStructure(claim) {
        return CTypeUtils.verifySchema(claim, this.schema);
    }
    async verifyStored() {
        return (await CType_chain_1.getOwner(this.hash)) === this.owner;
    }
}
exports.default = CType;
//# sourceMappingURL=CType.js.map