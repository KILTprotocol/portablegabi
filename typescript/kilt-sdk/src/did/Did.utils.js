"use strict";
/**
 * @module DID
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove.
 */
const util_1 = require("@polkadot/util");
const crypto_1 = tslib_1.__importDefault(require("../crypto"));
const Did_1 = tslib_1.__importStar(require("./Did"));
function decodeDid(identifier, encoded) {
    const json = encoded && encoded.encodedLength ? encoded.toJSON() : null;
    if (json instanceof Array) {
        let documentStore = null;
        if (util_1.isHex(json[2])) {
            documentStore = util_1.hexToString(json[2]);
        }
        return Object.assign(Object.create(Did_1.default.prototype), {
            identifier,
            publicSigningKey: json[0],
            publicBoxKey: json[1],
            documentStore,
        });
    }
    return null;
}
exports.decodeDid = decodeDid;
function getIdentifierFromAddress(address) {
    return Did_1.IDENTIFIER_PREFIX + address;
}
exports.getIdentifierFromAddress = getIdentifierFromAddress;
function getAddressFromIdentifier(identifier) {
    if (!identifier.startsWith(Did_1.IDENTIFIER_PREFIX)) {
        throw new Error(`Not a KILT did: ${identifier}`);
    }
    return identifier.substr(Did_1.IDENTIFIER_PREFIX.length);
}
exports.getAddressFromIdentifier = getAddressFromIdentifier;
function createDefaultDidDocument(identifier, publicBoxKey, publicSigningKey, kiltServiceEndpoint) {
    return {
        id: identifier,
        '@context': Did_1.CONTEXT,
        authentication: {
            type: Did_1.KEY_TYPE_AUTHENTICATION,
            publicKey: [`${identifier}#key-1`],
        },
        publicKey: [
            {
                id: `${identifier}#key-1`,
                type: Did_1.KEY_TYPE_SIGNATURE,
                controller: identifier,
                publicKeyHex: publicSigningKey,
            },
            {
                id: `${identifier}#key-2`,
                type: Did_1.KEY_TYPE_ENCRYPTION,
                controller: identifier,
                publicKeyHex: publicBoxKey,
            },
        ],
        service: kiltServiceEndpoint
            ? [
                {
                    type: Did_1.SERVICE_KILT_MESSAGING,
                    serviceEndpoint: kiltServiceEndpoint,
                },
            ]
            : [],
    };
}
exports.createDefaultDidDocument = createDefaultDidDocument;
function verifyDidDocumentSignature(didDocument, identifier) {
    if (!didDocument || !didDocument.signature || !identifier) {
        throw new Error(`Missing data for verification (either didDocument, didDocumentHash, signature, or address is missing):\n
          didDocument:\n
          ${didDocument}\n
          signature:\n
          ${didDocument.signature}\n
          address:\n
          ${identifier}\n
          `);
    }
    const { id } = didDocument;
    if (identifier !== id) {
        throw new Error(`This identifier (${identifier}) doesn't match the DID Document's identifier (${id})`);
    }
    const unsignedDidDocument = Object.assign({}, didDocument);
    delete unsignedDidDocument.signature;
    return crypto_1.default.verify(crypto_1.default.hashObjectAsStr(unsignedDidDocument), didDocument.signature, getAddressFromIdentifier(identifier));
}
exports.verifyDidDocumentSignature = verifyDidDocumentSignature;
function signDidDocument(didDocument, identity) {
    const didDocumentHash = crypto_1.default.hashObjectAsStr(didDocument);
    return Object.assign(Object.assign({}, didDocument), { signature: identity.signStr(didDocumentHash) });
}
exports.signDidDocument = signDidDocument;
//# sourceMappingURL=Did.utils.js.map