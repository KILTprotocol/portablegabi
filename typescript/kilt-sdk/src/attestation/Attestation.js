"use strict";
/**
 * An [[Attestation]] certifies a [[Claim]], sent by a claimer in the form of a [[RequestForAttestation]]. [[Attestation]]s are **written on the blockchain** and are **revokable**.
 * Note: once an [[Attestation]] is stored, it can be sent to and stored with the claimer as an [[AttestedClaim]] ("Credential").
 *
 * An [[Attestation]] can be queried from the chain. It's stored on-chain in a map:
 * * the key is the hash of the corresponding claim;
 * * the value is a tuple ([[CType]] hash, account, id of the [[Delegation]], and revoked flag).
 *
 * @module Attestation
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigLog_1 = require("../config/ConfigLog");
const Attestation_chain_1 = require("./Attestation.chain");
const log = ConfigLog_1.factory.getLogger('Attestation');
class Attestation {
    /**
     * Builds a new [[Attestation]] instance.
     *
     * @param attestationInput - The base object from which to create the attestation.
     * @example ```javascript
     * // create an attestation, e.g. to store it on-chain
     * new Attestation(attestationInput);
     * ```
     */
    constructor(attestationInput) {
        if (!attestationInput.cTypeHash ||
            !attestationInput.claimHash ||
            !attestationInput.owner) {
            throw new Error(`Property Not Provided while building Attestation!\n
        attestationInput.cTypeHash:\n
        ${attestationInput.cTypeHash}\n
        attestationInput.claimHash:\n
        ${attestationInput.claimHash}\n
        attestationInput.owner:\n
        ${attestationInput.owner}`);
        }
        this.owner = attestationInput.owner;
        this.claimHash = attestationInput.claimHash;
        this.cTypeHash = attestationInput.cTypeHash;
        this.delegationId = attestationInput.delegationId;
        this.revoked = attestationInput.revoked;
    }
    /**
     * [STATIC] [ASYNC] Queries the chain for a given attestation, by `claimHash`.
     *
     * @param claimHash - The hash of the claim that corresponds to the attestation to query.
     * @returns A promise containing the [[Attestation]] or null.
     * @example ```javascript
     * Attestation.query('0xd8024cdc147c4fa9221cd177').then(attestation => {
     *    // now we can for example revoke `attestation`
     * });
     * ```
     */
    static async query(claimHash) {
        return Attestation_chain_1.query(claimHash);
    }
    /**
     * [STATIC] [ASYNC] Revokes an attestation. Also available as an instance method.
     *
     * @param claimHash - The hash of the claim that corresponds to the attestation to revoke.
     * @param identity - The identity used to revoke the attestation (should be an attester identity, or have delegated rights).
     * @returns A promise containing the [[TxStatus]] (transaction status).
     * @example ```javascript
     * Attestation.revoke('0xd8024cdc147c4fa9221cd177').then(() => {
     *   // the attestation was successfully revoked
     * });
     * ```
     */
    static async revoke(claimHash, identity) {
        return Attestation_chain_1.revoke(claimHash, identity);
    }
    /**
     * [STATIC] Builds an instance of [[Attestation]], from a simple object with the same properties.
     * Used for deserialization.
     *
     * @param attestationInput - The base object from which to create the attestation.
     * @returns A new [[Attestation]] object.
     * @example ```javascript
     * // create an Attestation object, so we can call methods on it (`serialized` is a serialized Attestation object )
     * Attestation.fromAttestation(JSON.parse(serialized));
     * ```
     */
    static fromAttestation(attestationInput) {
        return new Attestation(attestationInput);
    }
    /**
     * [STATIC] Builds a new instance of an [[Attestation]], from a complete set of input required for an attestation.
     *
     * @param request - The base request for attestation.
     * @param attesterPublicIdentity - The attesters public identity, used to attest the underlying claim.
     * @param [delegationIdInput] - optional delegationId for which the attester attests the claim.
     * @returns A new [[Attestation]] object.
     * @example ```javascript
     * // create a complete new attestation from the RequestForAttestation and all other needed properties
     * Attestation.fromRequestAndPublicIdentity(request, attesterPublicIdentity, delegationId);
     * ```
     */
    static fromRequestAndPublicIdentity(request, attesterPublicIdentity, delegationIdInput) {
        return new Attestation({
            claimHash: request.rootHash,
            cTypeHash: request.claim.cTypeHash,
            owner: attesterPublicIdentity.address,
            delegationId: delegationIdInput,
            revoked: false,
        });
    }
    /**
     * [ASYNC] Stores the attestation on chain.
     *
     * @param identity - The identity used to store the attestation.
     * @returns A promise containing the [[TxStatus]] (transaction status).
     * @example ```javascript
     * // Use [[store]] to store an attestation on chain, and to create an [[AttestedClaim]] upon success:
     * attestation.store(attester).then(() => {
     * // the attestation was successfully stored, so now we can for example create an AttestedClaim
     * });
     * ```
     */
    async store(identity) {
        return Attestation_chain_1.store(this, identity);
    }
    /**
     * [ASYNC] Revokes the attestation. Also available as a static method.
     *
     * @param identity - The identity used to revoke the attestation (should be an attester identity, or have delegated rights).
     * @returns A promise containing the [[TxStatus]] (transaction status).
     * @example ```javascript
     * attestation.revoke(identity).then(() => {
     *    // the attestation was successfully revoked
     * });
     * ```
     */
    async revoke(identity) {
        return Attestation_chain_1.revoke(this.claimHash, identity);
    }
    /**
     * [ASYNC] Queries an attestation from the chain and checks its validity.
     *
     * @param claimHash - The hash of the claim that corresponds to the attestation to check. Defaults to the claimHash for the attestation onto which "verify" is called.
     * @returns A promise containing whether the attestation is valid.
     * @example ```javascript
     * attestation.verify().then(isVerified => {
     *   // `isVerified` is true if the attestation is verified, false otherwise
     * });
     * ```
     */
    async verify(claimHash = this.claimHash) {
        // Query attestation by claimHash. null if no attestation is found on-chain for this hash
        const attestation = await Attestation_chain_1.query(claimHash);
        // Check if attestation is valid
        const isValid = this.isAttestationValid(attestation);
        if (!isValid) {
            log.debug(() => 'No valid attestation found');
        }
        return Promise.resolve(isValid);
    }
    /**
     * Checks if the attestation is valid. An attestation is valid if it:
     * * exists;
     * * and has the correct owner;
     * * and is not revoked.
     *
     * @param attestation - The attestation to check.
     * @returns Whether the attestation is valid.
     */
    isAttestationValid(attestation) {
        return (attestation !== null &&
            attestation.owner === this.owner &&
            !attestation.revoked);
    }
}
exports.default = Attestation;
//# sourceMappingURL=Attestation.js.map