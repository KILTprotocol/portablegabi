"use strict";
/**
 * In KILT, the AttestedClaim is a **credential**, which a Claimer can store locally and share with Verifiers as they wish.
 *
 * Once a [[RequestForAttestation]] has been made, the [[Attestation]] can be built and the Attester submits it wrapped in an [[AttestedClaim]] object. This [[AttestedClaim]] also contains the original request for attestation. RequestForAttestation also exposes a [[createPresentation]] method, that can be used by the claimer to hide some specific information from the verifier for more privacy.
 *
 * @module AttestedClaim
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove.
 */
const Attestation_1 = tslib_1.__importDefault(require("../attestation/Attestation"));
const RequestForAttestation_1 = tslib_1.__importDefault(require("../requestforattestation/RequestForAttestation"));
class AttestedClaim {
    /**
     * Builds a new [[AttestedClaim]] instance.
     *
     * @param attestedClaimInput - The base object with all required input, from which to create the attested claim.
     * @example ```javascript
     * // Create an [[AttestedClaim]] upon successful [[Attestation]] creation:
     * new AttestedClaim(attestedClaimInput);
     * ```
     */
    constructor(attestedClaimInput) {
        if (!attestedClaimInput.request || !attestedClaimInput.attestation) {
            throw new Error(`Property Not Provided while building AttestedClaim!\n
        attestedClaimInput.request: \n
        ${attestedClaimInput.request} \n
        attestedClaimInput.attestation: \n
        ${attestedClaimInput.attestation}`);
        }
        this.request = RequestForAttestation_1.default.fromRequest(attestedClaimInput.request);
        this.attestation = Attestation_1.default.fromAttestation(attestedClaimInput.attestation);
    }
    /**
     * [STATIC] Builds an instance of [[AttestedClaim]], from a simple object with the same properties.
     * Used for deserialization.
     *
     * @param attestedClaimInput - The base object from which to create the attested claim.
     * @returns A new instantiated [[AttestedClaim]] object.
     * @example ```javascript
     * // create an AttestedClaim object, so we can call methods on it (`serialized` is a serialized AttestedClaim object)
     * AttestedClaim.fromAttestedClaim(JSON.parse(serialized));
     * ```
     */
    static fromAttestedClaim(attestedClaimInput) {
        return new AttestedClaim(attestedClaimInput);
    }
    /**
     * [STATIC] Builds a new instance of [[AttestedClaim]], from all requiered properties.
     *
     * @param request - The request for attestation for the claim that was attested.
     * @param attestation - The attestation for the claim by the attester.
     * @returns A new [[AttestedClaim]] object.
     * @example ```javascript
     * //create an AttestedClaim object after receiving the attestation from the attester
     * AttestedClaim.fromRequestAndAttestation(request, attestation);
     * ```
     */
    static fromRequestAndAttestation(request, attestation) {
        return new AttestedClaim({
            request,
            attestation,
        });
    }
    /**
     * (ASYNC) Verifies whether this attested claim is valid. It is valid if:
     * * the data is valid (see [[verifyData]]);
     * and
     * * the [[Attestation]] object for this attestated claim is valid (see [[Attestation.verify]], where the **chain** is queried).
     *
     * Upon presentation of an attested claim, a verifier would call this [[verify]] function.
     *
     * @returns A promise containing whether this attested claim is valid.
     * @example ```javascript
     * attestedClaim.verify().then(isVerified => {
     *   // `isVerified` is true if the attestation is verified, false otherwise
     * });
     * ```
     */
    async verify() {
        if (!this.verifyData()) {
            Promise.resolve(false);
        }
        return this.attestation.verify();
    }
    /**
     * Verifies whether the data of this attested claim is valid. It is valid if:
     * * the [[RequestForAttestation]] object associated with this attested claim has valid data (see [[RequestForAttestation.verifyData]]);
     * and
     * * the hash of the [[RequestForAttestation]] object for this attested claim, and the hash of the [[Claim]] for this attestated claim are the same.
     *
     * @returns Whether the attestated claim's data is valid.
     * @example ```javascript
     * attestedClaim.verifyData();
     * ```
     */
    verifyData() {
        return (this.request.verifyData() &&
            this.request.rootHash === this.attestation.claimHash);
    }
    /**
     * Gets the hash of the claim that corresponds to this attestation.
     *
     * @returns The hash of the claim for this attestation (claimHash).
     * @example ```javascript
     * attestation.getHash();
     * ```
     */
    getHash() {
        return this.attestation.claimHash;
    }
    /**
     * Builds a presentation. A presentation is a custom view of the [[AttestedClaim]], in which the claimer controls what information should be shown.
     *
     * @param excludedClaimProperties - An array of [[Claim]] properties to **exclude**.
     * @param excludeIdentity - Whether the claimer's identity should be **excluded** from the presentation. By default, the claimer's identity is included (`excludeIdentity` is `false`).
     * @returns The newly created presentation.
     * @example ```javascript
     * // create a presentation that keeps `birthYear` and `identity` private
     * createPresentation(['birthYear'], true);
     * ```
     */
    createPresentation(excludedClaimProperties, excludeIdentity = false) {
        const result = AttestedClaim.fromAttestedClaim(this);
        result.request.removeClaimProperties(excludedClaimProperties);
        if (excludeIdentity) {
            result.request.removeClaimOwner();
        }
        return result;
    }
}
exports.default = AttestedClaim;
//# sourceMappingURL=AttestedClaim.js.map