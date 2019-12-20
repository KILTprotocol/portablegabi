"use strict";
/**
 * Identities are a core building block of the KILT SDK.
 * An Identity object represent an **entity** - be it a person, an organization, a machine or some other entity.
 *
 * An Identity object can be built via a seed phrase or other. It has a signature keypair, an associated public address, and an encryption ("boxing") keypair. These are needed to:
 * * create a signed [[Claim]], an [[Attestation]] or other (and verify these later).
 * * encrypt messages between participants.
 *
 * Note: A [[PublicIdentity]] object exposes only public information such as the public address, but doesn't expose any secrets such as private keys.
 *
 * @module Identity
 * @preferred
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Dummy comment needed for correct doc display, do not remove.
 */
const keyring_1 = require("@polkadot/keyring");
const generate_1 = tslib_1.__importDefault(require("@polkadot/util-crypto/mnemonic/generate"));
const toSeed_1 = tslib_1.__importDefault(require("@polkadot/util-crypto/mnemonic/toSeed"));
const validate_1 = tslib_1.__importDefault(require("@polkadot/util-crypto/mnemonic/validate"));
const u8aUtil = tslib_1.__importStar(require("@polkadot/util/u8a"));
const hex_1 = require("@polkadot/util/hex");
// see node_modules/@polkadot/util-crypto/nacl/keypair/fromSeed.js
// as util-crypto is providing a wrapper only for signing keypair
// and not for box keypair, we use TweetNaCl directly
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const crypto_1 = tslib_1.__importDefault(require("../crypto"));
const PublicIdentity_1 = tslib_1.__importDefault(require("./PublicIdentity"));
class Identity extends PublicIdentity_1.default {
    constructor(seed, signKeyringPair) {
        // NB: use different secret keys for each key pair in order to avoid
        // compromising both key pairs at the same time if one key becomes public
        // Maybe use BIP32 and BIP44
        const seedAsHex = u8aUtil.u8aToHex(seed);
        const { address } = signKeyringPair;
        const boxKeyPair = Identity.createBoxKeyPair(seed);
        const boxPublicKeyAsHex = u8aUtil.u8aToHex(boxKeyPair.publicKey);
        super(address, boxPublicKeyAsHex);
        this.seed = seed;
        this.seedAsHex = seedAsHex;
        this.signKeyringPair = signKeyringPair;
        this.signPublicKeyAsHex = u8aUtil.u8aToHex(signKeyringPair.publicKey);
        this.boxKeyPair = boxKeyPair;
    }
    /**
     * [STATIC] Generates Mnemonic phrase used to create identities from phrase seed.
     *
     * @returns Randomly generated [[BIP39]](https://www.npmjs.com/package/bip39) mnemonic phrase (Secret phrase).
     * @example ```javascript
     * Identity.generateMnemonic();
     * // returns: "coast ugly state lunch repeat step armed goose together pottery bind mention"
     * ```
     */
    static generateMnemonic() {
        return generate_1.default();
    }
    /**
     * [STATIC] Builds an identity object from a mnemonic string.
     *
     * @param phraseArg - [[BIP39]](https://www.npmjs.com/package/bip39) Mnemonic word phrase (Secret phrase).
     * @returns An [[Identity]].
     *
     * @example ```javascript
     * const mnemonic = Identity.generateMnemonic();
     * // mnemonic: "coast ugly state lunch repeat step armed goose together pottery bind mention"
     *
     * Identity.buildFromMnemonic(mnemonic);
     * ```
     */
    static buildFromMnemonic(phraseArg) {
        let phrase = phraseArg;
        if (phrase) {
            if (phrase.trim().split(/\s+/g).length < 12) {
                // https://www.npmjs.com/package/bip39
                throw Error(`Phrase '${phrase}' too long or malformed`);
            }
        }
        else {
            phrase = generate_1.default();
        }
        if (!validate_1.default(phrase)) {
            throw Error(`Invalid phrase '${phrase}'`);
        }
        const seed = toSeed_1.default(phrase);
        return Identity.buildFromSeed(seed);
    }
    /**
     * [STATIC] Builds an [[Identity]], generated from a seed hex string.
     *
     * @param seedArg - Seed as hex string (Starting with 0x).
     * @returns  An [[Identity]].
     * @example ```javascript
     * const seed =
     *   '0x6ce9fd060c70165c0fc8da25810d249106d5df100aa980e0d9a11409d6b35261';
     * Identity.buildFromSeedString(seed);
     * ```
     */
    static buildFromSeedString(seedArg) {
        const asU8a = hex_1.hexToU8a(seedArg);
        return Identity.buildFromSeed(asU8a);
    }
    /**
     * [STATIC] Builds a new [[Identity]], generated from a seed (Secret Seed).
     *
     * @param seed - A seed as an Uint8Array with 24 arbitrary numbers.
     * @returns An [[Identity]].
     * @example ```javascript
     * // prettier-ignore
     * const seed = new Uint8Array([108, 233, 253,  6,  12, 112,  22,  92,
     *                               15, 200, 218, 37, 129,  13,  36, 145,
     *                                6, 213, 223, 16,  10, 169, 128, 224,
     *                              217, 161,  20,  9, 214, 179,  82,  97
     *                            ]);
     * Identity.buildFromSeed(seed);
     * ```
     */
    static buildFromSeed(seed) {
        const keyring = new keyring_1.Keyring({ type: 'ed25519' });
        const keyringPair = keyring.addFromSeed(seed);
        return new Identity(seed, keyringPair);
    }
    /**
     * [STATIC] Builds a new [[Identity]], generated from a uniform resource identifier (URIs).
     *
     * @param uri - Standard identifiers.
     * @returns  An [[Identity]].
     * @example ```javascript
     * Identity.buildFromURI('//Bob');
     * ```
     */
    static buildFromURI(uri) {
        const keyring = new keyring_1.Keyring({ type: 'ed25519' });
        const derived = keyring.createFromUri(uri);
        // TODO: heck to create identity from //Alice
        return new Identity(u8aUtil.u8aToU8a(uri), derived);
    }
    /**
     * Returns the [[PublicIdentity]] (identity's address and public key) of the Identity.
     * Can be given to third-parties to communicate and process signatures.
     *
     * @returns The [[PublicIdentity]], corresponding to the [[Identity]].
     * @example ```javascript
     * const alice = Kilt.Identity.buildFromMnemonic();
     * alice.getPublicIdentity();
     * ```
     */
    getPublicIdentity() {
        const { address, boxPublicKeyAsHex } = this;
        return { address, boxPublicKeyAsHex };
    }
    /**
     * Signs data with an [[Identity]] object's key.
     *
     * @param cryptoInput - The data to be signed.
     * @returns The signed data.
     * @example  ```javascript
     * const alice = Identity.buildFromMnemonic();
     * const data = 'This is a test';
     * alice.sign(data);
     * // (output) Uint8Array [
     * //           205, 120,  29, 236, 152, 144, 114, 133,  65, ...
     * //          ]
     * ```
     */
    sign(cryptoInput) {
        return crypto_1.default.sign(cryptoInput, this.signKeyringPair);
    }
    /**
     * Signs data with an [[Identity]] object's key returns it as string.
     *
     * @param cryptoInput - The data to be signed.
     * @returns The signed data.
     * @example ```javascript
     * identity.signStr(data);
     * ```
     */
    signStr(cryptoInput) {
        return crypto_1.default.signStr(cryptoInput, this.signKeyringPair);
    }
    /**
     * Encrypts data asymmetrically and returns it as string.
     *
     * @param cryptoInput - The data to be encrypted.
     * @param boxPublicKey - The public key of the receiver of the encrypted data.
     * @returns The encrypted data.
     * @example ```javascript
     * const alice = Identity.buildFromMnemonic('car dog ...');
     * const bob = new PublicIdentity('523....', '0xab1234...');
     *
     * const messageStr = 'This is a test';
     * alice.encryptAsymmetricAsStr(messageStr, bob.boxPublicKeyAsHex);
     * // (output) EncryptedAsymmetricString {
     * //           box: '0xd0b556c4438270901662ff2d3e9359f244f211a225d66dcf74b64f814a92',
     * //           nonce: '0xe4c82d261d1f8fc8a0cf0bbd524530afcc5b201541827580'
     * //          }
     * ```
     */
    encryptAsymmetricAsStr(cryptoInput, boxPublicKey) {
        return crypto_1.default.encryptAsymmetricAsStr(cryptoInput, boxPublicKey, this.boxKeyPair.secretKey);
    }
    /**
     * Decrypts data asymmetrical and returns it as string.
     *
     * @param encrypted - The encrypted data.
     * @param boxPublicKey - The public key of the sender of the encrypted data.
     * @returns The decrypted data.
     * @example  ```javascript
     * const alice = new PublicIdentity('74be...', '0xeb98765...');
     * const bob = Identity.buildFromMnemonic('house cat ...');
     *
     * const encryptedData = {
     *   box: '0xd0b556c4438270901662ff2d3e9359f244f211a225d66dcf74b64f814a92',
     *   nonce: '0xe4c82d261d1f8fc8a0cf0bbd524530afcc5b201541827580',
     * };
     *
     * bob.decryptAsymmetricAsStr(encryptedData, alice.boxPublicKeyAsHex);
     * // (output) "This is a test"
     * ```
     */
    decryptAsymmetricAsStr(encrypted, boxPublicKey) {
        return crypto_1.default.decryptAsymmetricAsStr(encrypted, boxPublicKey, this.boxKeyPair.secretKey);
    }
    /**
     * Encrypts data asymmetrically and returns it as a byte array.
     *
     * @param input - The data to be encrypted.
     * @param boxPublicKey - The public key of the receiver of the encrypted data.
     * @returns The encrypted data.
     * @example ```javascript
     * const alice = Identity.buildFromMnemonic('car dog ...');
     * const bob = new PublicIdentity('523....', '0xab1234...');
     *
     * const message = 'This is a test';
     * const data = stringToU8a(message);
     * alice.encryptAsymmetric(data, bob.boxPublicKeyAsHex);
     * // (output) EncryptedAsymmetric {
     * //           box: Uint8Array [ 56,  27,   2, 254, ... ],
     * //           nonce: Uint8Array [ 76, 23, 145, 216, ...]
     * //         }
     * ```
     */
    encryptAsymmetric(input, boxPublicKey) {
        return crypto_1.default.encryptAsymmetric(input, boxPublicKey, this.boxKeyPair.secretKey);
    }
    /**
     * Decrypts data asymmetrical and returns it as a byte array.
     *
     * @param encrypted - The encrypted data.
     * @param boxPublicKey - The public key of the sender of the encrypted data.
     * @returns The decrypted data.
     * @example ```javascript
     * const alice = new PublicIdentity('74be...', '0xeb98765...');
     * const bob = Identity.buildFromMnemonic('house cat ...');
     *
     * const encryptedData = {
     *   box: '0xd0b556c4438270901662ff2d3e9359f244f211a225d66dcf74b64f814a92',
     *   nonce: '0xe4c82d261d1f8fc8a0cf0bbd524530afcc5b201541827580',
     * };
     *
     * bob.decryptAsymmetric(encryptedData, alice.boxPublicKeyAsHex);
     * // (output) "This is a test"
     * ```
     */
    decryptAsymmetric(encrypted, boxPublicKey) {
        return crypto_1.default.decryptAsymmetric(encrypted, boxPublicKey, this.boxKeyPair.secretKey);
    }
    /**
     * Signs a submittable extrinsic (transaction), in preparation to pushing it to the blockchain.
     *
     * @param submittableExtrinsic - A chain transaction.
     * @param nonceAsHex - The nonce of the address operating the transaction.
     * @returns The signed SubmittableExtrinsic.
     * @example ```javascript
     * const alice = Identity.buildFromMnemonic('car dog ...');
     * const tx = await blockchain.api.tx.ctype.add(ctype.hash);
     * const nonce = await blockchain.api.query.system.accountNonce(alice.address);
     * alice.signSubmittableExtrinsic(tx, nonce.tohex());
     * ```
     */
    signSubmittableExtrinsic(submittableExtrinsic, nonceAsHex) {
        return submittableExtrinsic.sign(this.signKeyringPair, {
            nonce: nonceAsHex,
        });
    }
    // As nacl.box.keyPair.fromSeed() is not implemented here we do our own hashing in order to prohibit inferring the original seed from a secret key
    // To be sure that we don't generate the same hash by accidentally using the same hash algorithm we do some padding
    static createBoxKeyPair(seed) {
        const paddedSeed = new Uint8Array(seed.length + Identity.ADDITIONAL_ENTROPY_FOR_HASHING.length);
        paddedSeed.set(seed);
        paddedSeed.set(Identity.ADDITIONAL_ENTROPY_FOR_HASHING, seed.length);
        const hash = crypto_1.default.hash(paddedSeed);
        return tweetnacl_1.default.box.keyPair.fromSecretKey(hash);
    }
}
exports.default = Identity;
Identity.ADDITIONAL_ENTROPY_FOR_HASHING = new Uint8Array([1, 2, 3]);
//# sourceMappingURL=Identity.js.map