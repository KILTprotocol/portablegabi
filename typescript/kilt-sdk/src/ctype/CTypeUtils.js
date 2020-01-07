"use strict";
/**
 * @module CType
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove.
 */
const ajv_1 = tslib_1.__importDefault(require("ajv"));
const CTypeSchema_1 = require("./CTypeSchema");
const crypto_1 = tslib_1.__importDefault(require("../crypto"));
function verifySchemaWithErrors(model, metaModel, messages) {
    const ajv = new ajv_1.default();
    ajv.addMetaSchema(CTypeSchema_1.CTypeModel);
    const result = ajv.validate(metaModel, model);
    if (!result && ajv.errors) {
        if (messages) {
            ajv.errors.forEach((error) => {
                messages.push(error.message);
            });
        }
    }
    return !!result;
}
exports.verifySchemaWithErrors = verifySchemaWithErrors;
function verifySchema(model, metaModel) {
    return verifySchemaWithErrors(model, metaModel);
}
exports.verifySchema = verifySchema;
function verifyClaimStructure(claim, schema) {
    if (!verifySchema(schema, CTypeSchema_1.CTypeModel)) {
        throw new Error('CType does not correspond to schema');
    }
    return verifySchema(claim, schema);
}
exports.verifyClaimStructure = verifyClaimStructure;
function getHashForSchema(schema) {
    return crypto_1.default.hashObjectAsStr(schema);
}
exports.getHashForSchema = getHashForSchema;
//# sourceMappingURL=CTypeUtils.js.map