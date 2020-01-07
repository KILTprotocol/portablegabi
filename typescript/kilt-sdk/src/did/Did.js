"use strict";
/**
 * A Decentralized Identifier (DID) is a new type of identifier that is globally unique, resolveable with high availability, and cryptographically verifiable. Although it's not mandatory in KILT, users can optionally create a DID and anchor it to the KILT blockchain.
 * <br>
 * Official DID specification: [[https://w3c-ccg.github.io/did-primer/]].
 * ***
 * The [[Did]] class exposes methods to build, store and query decentralized identifiers.
 * @module DID
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigLog_1 = require("../config/ConfigLog");
const Did_utils_1 = require("./Did.utils");
const Did_chain_1 = require("./Did.chain");
const log = ConfigLog_1.factory.getLogger('DID');
exports.IDENTIFIER_PREFIX = 'did:kilt:';
exports.SERVICE_KILT_MESSAGING = 'KiltMessagingService';
exports.KEY_TYPE_SIGNATURE = 'Ed25519VerificationKey2018';
exports.KEY_TYPE_ENCRYPTION = 'X25519Salsa20Poly1305Key2018';
exports.KEY_TYPE_AUTHENTICATION = 'Ed25519SignatureAuthentication2018';
exports.CONTEXT = 'https://w3id.org/did/v1';
class Did {
    constructor(identifier, publicBoxKey, publicSigningKey, documentStore = null) {
        this.identifier = identifier;
        this.publicBoxKey = publicBoxKey;
        this.publicSigningKey = publicSigningKey;
        this.documentStore = documentStore;
    }
    /**
     * Builds a [[Did]] object from the given [[Identity]].
     *
     * @param identity The identity used to build the [[Did]] object.
     * @param documentStore The storage location of the associated DID Document; usally a URL.
     * @returns The [[Did]] object.
     */
    static fromIdentity(identity, documentStore) {
        const identifier = Did_utils_1.getIdentifierFromAddress(identity.address);
        return new Did(identifier, identity.boxPublicKeyAsHex, identity.signPublicKeyAsHex, documentStore);
    }
    /**
     * Stores the [[Did]] object on-chain.
     *
     * @param identity The identity used to store the [[Did]] object on-chain.
     * @returns A promise containing the [[TxStatus]] (transaction status).
     */
    async store(identity) {
        log.debug(`Create tx for 'did.add'`);
        return Did_chain_1.store(this, identity);
    }
    /**
     * Queries the [[Did]] object from the chain using the [identifier].
     *
     * @param identifier A KILT DID identifier, e.g. "did:kilt:5CtPYoDuQQF...".
     * @returns A promise containing the [[Did]] or [null].
     */
    static queryByIdentifier(identifier) {
        return Did_chain_1.queryByIdentifier(identifier);
    }
    /**
     * Queries the [[Did]] object from the chain using the [address].
     *
     * @param address The address associated to this [[Did]].
     * @returns A promise containing the [[Did]] or [null].
     */
    static queryByAddress(address) {
        return Did_chain_1.queryByAddress(address);
    }
    /**
     * Removes the [[Did]] object attached to a given [[Identity]] from the chain.
     *
     * @param identity The identity for which to delete the [[Did]].
     * @returns A promise containing the [[TxStatus]] (transaction status).
     */
    static async remove(identity) {
        log.debug(`Create tx for 'did.remove'`);
        return Did_chain_1.remove(identity);
    }
    /**
     * Gets the complete KILT DID from an [address] (in KILT, the method-specific ID is an address). Reverse of [[getAddressFromIdentifier]].
     *
     * @param address An address, e.g. "5CtPYoDuQQF...".
     * @returns The associated KILT DID identifier, e.g. "did:kilt:5CtPYoDuQQF...".
     */
    static getIdentifierFromAddress(address) {
        return Did_utils_1.getIdentifierFromAddress(address);
    }
    /**
     * Gets the [address] from a complete KILT DID (in KILT, the method-specific ID is an address). Reverse of [[getIdentifierFromAddress]].
     *
     * @param identifier A KILT DID identifier, e.g. "did:kilt:5CtPYoDuQQF...".
     * @returns The associated address, e.g. "5CtPYoDuQQF...".
     */
    static getAddressFromIdentifier(identifier) {
        return Did_utils_1.getAddressFromIdentifier(identifier);
    }
    /**
     * Signs (the hash of) a DID Document.
     *
     * @param didDocument A DID Document, e.g. created via [[createDefaultDidDocument]].
     * @param identity [[Identity]] representing the DID subject for this DID Document, and used for signature.
     * @returns The signed DID Document.
     */
    static signDidDocument(didDocument, identity) {
        return Did_utils_1.signDidDocument(didDocument, identity);
    }
    /**
     * Verifies the signature of a DID Document, to check whether the data has been tampered with.
     *
     * @param didDocument A signed DID Document.
     * @param identifier A KILT DID identifier, e.g. "did:kilt:5CtPYoDuQQF...".
     * @returns Whether the DID Document's signature is valid.
     */
    static verifyDidDocumentSignature(didDocument, identifier) {
        return Did_utils_1.verifyDidDocumentSignature(didDocument, identifier);
    }
    /**
     * Builds the default DID Document from this [[Did]] object.
     *
     * @param kiltServiceEndpoint A URI pointing to the service endpoint.
     * @returns The default DID Document.
     */
    createDefaultDidDocument(kiltServiceEndpoint) {
        return Did_utils_1.createDefaultDidDocument(this.identifier, this.publicBoxKey, this.publicSigningKey, kiltServiceEndpoint);
    }
    /**
     * [STATIC] Builds a default DID Document.
     *
     * @param identifier A KILT DID identifier, e.g. "did:kilt:5CtPYoDuQQF...".
     * @param publicBoxKey The public encryption key of the DID subject of this KILT DID identifier.
     * @param publicSigningKey The public signing key of the DID subject of this KILT DID identifier.
     * @param kiltServiceEndpoint A URI pointing to the service endpoint.
     * @returns The default DID Document.
     */
    static createDefaultDidDocument(identifier, publicBoxKey, publicSigningKey, kiltServiceEndpoint) {
        return Did_utils_1.createDefaultDidDocument(identifier, publicBoxKey, publicSigningKey, kiltServiceEndpoint);
    }
}
exports.default = Did;
//# sourceMappingURL=Did.js.map