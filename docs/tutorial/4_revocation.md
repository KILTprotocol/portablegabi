# Revocation

An attester can revoke any credential they attested.
This is achieved by using a witness which is contained inside a credential and a whitelist containing all non-revoked witnesses.
If an attester revokes a credential, they remove the associated witness from the whitelist and publish a new version of this whitelist.
Note that **witnesses are added to the whitelist implicitly**.
Therefore, adding witnesses to the whitelist requires no change.
Since this whitelist is implemented using accumulators, it is called _accumulator_.
Further documentation on how this accumulator works can be found in the [IRMA docs](https://irma.app/docs/revocation/#cryptography).

## Example

In order to revoke a credential, the attester needs their key pair, the witness of credential they want to revoke (created in `issueAttestation`) and the accumulator.

```js
const portablegabi = require("@kiltprotocol/portablegabi");

const pubKey = new portablegabi.AttesterPrivateKey(
  "<The pre-generated public key of the attester>"
);
const privKey = new portablegabi.AttesterPrivateKey(
  "<The pre-generated private key of the attester>"
);
const attester = new portablegabi.Attester(pubKey, privKey);
const accPreRevo = new portablegabi.Accumulator(
  "<The accumulator created during the attestation>"
);
const witnessToBeRevoked = new portablegabi.Witness(
  "<The witness created during the attestation>"
);

// Issue attestations and store witnesses.
const accPostRevo = await attester.revokeAttestation({
  accumulator: accPreRevo,
  // The list of witnesses associated with the credentials which should get revoked.
  witnesses: [witnessToBeRevoked],
});
console.log("Accumulator after revocation:\n\t", accPostRevo.toString()());
// Publish the accumulator after revocation.
```

After an attester publishes a new accumulator, all claimers should update their credential attested by this specific attester to their newest available accumulator.
In order to update the credential, **the claimer needs the complete history of all new accumulators since their last update**.

```js
const claimer = await portablegabi.Claimer.buildFromMnemonic('siege decrease quantum control snap ride position strategy fire point airport include')
let credential = () => {
    // Request an attestation from an attester.
    // Build a credential.
    // ...
    return credential
}()

// How to update your credential?
// The Credential is updated to accumulator 55, the newest accumulator has index 59.
// Note that a user does not have to input the accumulators in a sorted way - Portablegabi takes care of this.
const newCredential = await credential.update({
    attesterPubKey: attestersPublicKey,
    accumulators: [accumulator56, accumulator57, accumulator58, accumulator59],
})
```
