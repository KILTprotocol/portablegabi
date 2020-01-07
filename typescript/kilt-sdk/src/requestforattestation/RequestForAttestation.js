"use strict";
/**
 * Requests for attestation are a core building block of the KILT SDK.
 * A RequestForAttestation represents a [[Claim]] which needs to be validated. In practice, the RequestForAttestation is sent from a claimer to an attester.
 *
 * A RequestForAttestation object contains the [[Claim]] and its hash, and legitimations/delegationId of the attester.
 * It's signed by the claimer, to make it tamperproof (`claimerSignature` is a property of [[Claim]]).
 * A RequestForAttestation also supports hiding of claim data during a credential presentation.
 *
 * @module RequestForAttestation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove.
 */
const uuid_1 = require("uuid");
const Crypto_1 = require("../crypto/Crypto");
const AttestedClaim_1 = tslib_1.__importDefault(require("../attestedclaim/AttestedClaim"));
function hashNonceValue(nonce, value) {
    return Crypto_1.hashObjectAsStr(value, nonce);
}
function generateHash(value) {
    const nonce = uuid_1.v4();
    return {
        nonce,
        hash: hashNonceValue(nonce, value),
    };
}
function generateHashTree(contents) {
    const result = {};
    Object.keys(contents).forEach(key => {
        result[key] = generateHash(contents[key]);
    });
    return result;
}
function verifyClaimerSignature(rfa) {
    return Crypto_1.verify(rfa.rootHash, rfa.claimerSignature, rfa.claim.owner);
}
function getHashRoot(leaves) {
    const result = Crypto_1.u8aConcat(...leaves);
    return Crypto_1.hash(result);
}
class RequestForAttestation {
    /**
     * Builds a new [[RequestForAttestation]] instance.
     *
     * @param requestInput - The base object from which to create the requestForAttestation.
     * @example ```javascript
     * // create a new request for attestation
     * new RequestForAttestation(requestForAttestationInput);
     * ```
     */
    constructor(requestForAttestationInput) {
        if (!requestForAttestationInput.claim ||
            !requestForAttestationInput.legitimations ||
            !requestForAttestationInput.claimOwner ||
            !requestForAttestationInput.claimerSignature ||
            !requestForAttestationInput.claimHashTree ||
            !requestForAttestationInput.cTypeHash ||
            !requestForAttestationInput.rootHash) {
            throw new Error(`Property Not Provided while building RequestForAttestation:\n
          requestInput.claim:\n
          ${requestForAttestationInput.claim}\n
          requestInput.legitimations:\n
          ${requestForAttestationInput.legitimations}\n
          requestInput.claimOwner:\n
          ${requestForAttestationInput.claimOwner}\n
          requestInput.claimerSignature:\n
          ${requestForAttestationInput.claimerSignature}
          requestInput.claimHashTree:\n
          ${requestForAttestationInput.claimHashTree}\n
          requestInput.rootHash:\n
          ${requestForAttestationInput.rootHash}\n
          requestInput.cTypeHash:\n
          ${requestForAttestationInput.cTypeHash}\n`);
        }
        this.claim = requestForAttestationInput.claim;
        this.claimOwner = requestForAttestationInput.claimOwner;
        this.cTypeHash = requestForAttestationInput.cTypeHash;
        if (typeof requestForAttestationInput.legitimations !== 'undefined' &&
            Array.isArray(requestForAttestationInput.legitimations) &&
            requestForAttestationInput.legitimations.length) {
            this.legitimations = requestForAttestationInput.legitimations.map(legitimation => AttestedClaim_1.default.fromAttestedClaim(legitimation));
        }
        else {
            this.legitimations = [];
        }
        this.delegationId = requestForAttestationInput.delegationId;
        this.claimHashTree = requestForAttestationInput.claimHashTree;
        this.rootHash = requestForAttestationInput.rootHash;
        this.claimerSignature = requestForAttestationInput.claimerSignature;
        this.verifySignature();
        this.verifyData();
    }
    /**
     * [STATIC] Builds an instance of [[RequestForAttestation]], from a simple object with the same properties.
     * Used for deserialization.
     *
     * @param requestForAttestationInput - An object built from simple [[Claim]], [[Identity]] and legitimation objects.
     * @returns  A new [[RequestForAttestation]] `object`.
     * @example ```javascript
     * const serializedRequest = '{ "claim": { "cType": "0x981...", "contents": { "name": "Alice", "age": 29 }, owner: "5Gf..." }, ... }, ... }';
     * const parsedRequest = JSON.parse(serializedRequest);
     * RequestForAttestation.fromRequest(parsedRequest);
     * ```
     */
    static fromRequest(requestForAttestationInput) {
        return new RequestForAttestation(requestForAttestationInput);
    }
    /**
     * [STATIC] Builds a new instance of [[RequestForAttestation]], from a complete set of requiered parameters.
     *
     * @param claimInput - An `IClaim` object the request for attestation is built for.
     * @param identity - The Claimer's [Identity].
     * @param [legitimationsInput] - Array of [AttestedClaim] objects of the Attester which the Claimer requests to include into the attestation as legitimations.
     * @param [delegationInput] - The id of the DelegationNode of the Attester, which should be used in the attestation
     * @returns  A new [[RequestForAttestation]] object.
     * @example ```javascript
     * const requestForAttestation = RequestForAttestation.fromClaimAndIdentity(claim,alice,[],null)
     * ```
     */
    static fromClaimAndIdentity(claimInput, identity, legitimationsInput, delegationIdInput) {
        if (claimInput.owner !== identity.address) {
            throw Error('Claim owner is not Identity');
        }
        const claimOwnerGenerated = generateHash(claimInput.owner);
        const cTypeHashGenerated = generateHash(claimInput.cTypeHash);
        const claimHashTreeGenerated = generateHashTree(claimInput.contents);
        const calculatedRootHash = RequestForAttestation.calculateRootHash(claimOwnerGenerated, cTypeHashGenerated, claimHashTreeGenerated, legitimationsInput, delegationIdInput);
        let legitimations = [];
        if (Array.isArray(legitimationsInput)) {
            legitimations = legitimationsInput;
        }
        return new RequestForAttestation({
            claim: claimInput,
            legitimations,
            claimOwner: claimOwnerGenerated,
            claimHashTree: claimHashTreeGenerated,
            cTypeHash: cTypeHashGenerated,
            rootHash: calculatedRootHash,
            claimerSignature: RequestForAttestation.sign(identity, calculatedRootHash),
            delegationId: delegationIdInput,
        });
    }
    static async acFromClaimAndIdentity(claimInput, identity, legitimationsInput, delegationIdInput) { }
    /**
     * Removes [[Claim]] properties from the [[RequestForAttestation]] object, provides anonymity and security when building the [[createPresentation]] method.
     *
     * @param properties - Properties to remove from the [[Claim]] object.
     * @throws An error when a property which should be deleted wasn't found.
     * @example ```javascript
     * const rawClaim = {
     *   name: 'Alice',
     *   age: 29,
     * };
     * const claim = Claim.fromCTypeAndClaimContents(ctype, rawClaim, alice);
     * const reqForAtt = RequestForAttestation.fromClaimAndIdentity(claim,alice,[],null);
     * reqForAtt.removeClaimProperties(['name']);
     * // reqForAtt does not contain `name` in its claimHashTree and its claim contents anymore.
     * ```
     */
    removeClaimProperties(properties) {
        properties.forEach(key => {
            if (!this.claimHashTree[key]) {
                throw Error(`Property '${key}' not found in claim`);
            }
            delete this.claim.contents[key];
            delete this.claimHashTree[key].nonce;
        });
    }
    /**
     * Removes the [[Claim]] owner from the [[RequestForAttestation]] object.
     *
     * @example ```javascript
     * const reqForAtt = RequestForAttestation.fromClaimAndIdentity(claim,alice,[],null);
     * reqForAtt.removeClaimOwner();
     * // `requestForAttestation` does not contain the claim `owner` or the `claimOwner`'s nonce anymore.
     * ```
     */
    removeClaimOwner() {
        delete this.claim.owner;
        delete this.claimOwner.nonce;
    }
    /**
     * Verifies the data of the [[RequestForAttestation]] object; used to check that the data was not tampered with, by checking the data against hashes.
     *
     * @returns Whether the data is valid.
     * @example ```javascript
     * const reqForAtt = RequestForAttestation.fromClaimAndIdentity(claim,alice,[],null);
     * reqForAtt.verifyData();  // returns true if the data is correct
     * ```
     */
    verifyData() {
        // check claim hash
        if (this.rootHash !==
            RequestForAttestation.calculateRootHash(this.claimOwner, this.cTypeHash, this.claimHashTree, this.legitimations, this.delegationId)) {
            return false;
        }
        // check claim owner hash
        if (this.claim.owner) {
            if (this.claimOwner.hash !==
                hashNonceValue(this.claimOwner.nonce, this.claim.owner)) {
                throw Error('Invalid hash for claim owner');
            }
        }
        // check cType hash
        if (this.cTypeHash.hash !==
            hashNonceValue(this.cTypeHash.nonce, this.claim.cTypeHash)) {
            throw Error('Invalid hash for CTYPE');
        }
        // check all hashes for provided claim properties
        Object.keys(this.claim.contents).forEach(key => {
            const value = this.claim.contents[key];
            if (!this.claimHashTree[key]) {
                throw Error(`Property '${key}' not in claim hash tree`);
            }
            const hashed = this.claimHashTree[key];
            if (hashed.hash !== hashNonceValue(hashed.nonce, value)) {
                throw Error(`Invalid hash for property '${key}' in claim hash tree`);
            }
        });
        // check legitimations
        let valid = true;
        if (this.legitimations) {
            this.legitimations.forEach(legitimation => {
                valid = valid && legitimation.verifyData();
            });
        }
        if (!valid) {
            return false;
        }
        // check signature
        return this.verifySignature();
    }
    /**
     * Verifies the signature of the [[RequestForAttestation]] object.
     *
     * @returns Whether the signature is correct.
     * @example ```javascript
     * const reqForAtt = RequestForAttestation.fromClaimAndIdentity(claim,alice,[],null);
     * reqForAtt.verifySignature(); // returns `true` if the signature is correct
     * ```
     */
    verifySignature() {
        return verifyClaimerSignature(this);
    }
    static sign(identity, rootHash) {
        return identity.signStr(rootHash);
    }
    static getHashLeaves(claimOwner, cTypeHash, claimHashTree, legitimations, delegationId) {
        const result = [];
        result.push(Crypto_1.coToUInt8(claimOwner.hash));
        result.push(Crypto_1.coToUInt8(cTypeHash.hash));
        Object.keys(claimHashTree).forEach(key => {
            result.push(Crypto_1.coToUInt8(claimHashTree[key].hash));
        });
        if (legitimations) {
            legitimations.forEach(legitimation => {
                result.push(Crypto_1.coToUInt8(legitimation.getHash()));
            });
        }
        if (delegationId) {
            result.push(Crypto_1.coToUInt8(delegationId));
        }
        return result;
    }
    static calculateRootHash(claimOwner, cTypeHash, claimHashTree, legitimations, delegationId) {
        const hashes = RequestForAttestation.getHashLeaves(claimOwner, cTypeHash, claimHashTree, legitimations, delegationId);
        const root = hashes.length === 1 ? hashes[0] : getHashRoot(hashes);
        return Crypto_1.u8aToHex(root);
    }
}
exports.default = RequestForAttestation;
//# sourceMappingURL=RequestForAttestation.js.map