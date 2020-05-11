# Blockchain

Although you are free to choose how you would like to provide access to accumulators, we suggest that you use a blockchain for that.
The advantage of using a blockchain is that you have a decentralized database.
If each attester operated their own servers for providing accumulators, these servers would become a single point of failure.
If a server is not reachable, the verifier cannot check if a credential was recently revoked.
Another concern of a centralised approach is the privacy of the claimer.
Since the attester operates the server where the accumulator is stored, they can also track how often a claimer updates their credential.
A blockchain can prevent attesters from tracking claimers and provides a redundant storage.

### Build the chain

If you want to use a blockchain, you can integrate our [`portablegabi pallet`](https://github.com/KILTprotocol/portablegabi-pallet) into your [substrate blockchain](https://www.parity.io/substrate/).
We also provide a blockchain template which includes our pallet and can be used to store accumulators.
In order to use that, just clone and set up the [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node) or use the template to create your own project.

```bash
git clone https://github.com/KILTprotocol/portablegabi-node.git
cd portablegabi-node
./scripts/init.sh
./scripts/build.sh
cargo build
```

You might want to grab a cup of tee! 🍵
Building the chain might take up to 30 min.

### Start the chain

```bash
cargo run -- --dev
```

# Run examples

The purpose of the chain is to both store each attester's accumulator and give access to old revisions, as these are required when updating older credentials.
Therefore, we have added some chain functionality to both the credential and attester classes.

## AttesterChain

We extended the attester identity in a sub-class named `AttesterChain`.
This class extends `Attester` by adding on-chain functionality to the identity's creation, handling of the accumulator and revocation.
In terms of the creation, you have the choice between an [`ed25519` and a `sr25519` account key](https://wiki.polkadot.network/docs/en/learn-keys) for the chain.
Moreover, you can build it from a [URI](https://polkadot.js.org/ui/start/keyring.derivation.html) like `//Alice`.
When revoking a credential, the accumulator on the chain gets updated automatically.

## Example 1: Complete process for single credential with revocation

In the following, we will run a complete exemplary chain process:

1. Connect to the chain and add an accumulator.
2. Attest a claim.
3. Revoke the attested claim from 2. and (automatically) update the accumulator.
4. Check out multiple verifications with different timestamps.

```js
const portablegabi = require("@kiltprotocol/portablegabi");

const pubKey = new portablegabi.AttesterPublicKey(
  "<The pre-generated public key of the attester>"
);
const privKey = new portablegabi.AttesterPrivateKey(
  "<The pre-generated private key of the attester>"
);

async function exec() {
  /** (1) Chain phase */
  // (1.1) Connect to the chain.
  const chain = await portablegabi.connect({
    pgabiModName: "portablegabi",
  });
  console.log("Successfully connected to the chain");

  // (1.2) Create Alice identity.
  const attester = await portablegabi.AttesterChain.buildFromURI(
    pubKey,
    privKey,
    "//Alice",
    "ed25519"
  );

  // (1.3) Create a fresh accumulator.
  const accPreRevo = await attester.createAccumulator();

  // (1.4) Put the accumulator on chain.
  console.log("Putting accumulator on the chain for Alice");
  await attester.updateAccumulator(accPreRevo);

  // Check whether it has actually been added to chain.
  console.log("\t Waiting for next block to have the accumulator on the chain");
  console.log(
    "Latest accumulator === accPreRevo? Expected true, received",
    (await chain.getLatestAccumulator(attester.address)).toString()() ===
      accPreRevo.toString()()
  );

  /** (2) Attestation phase */
  // (2.1) The attester initiates the attestation session.
  const {
    message: startAttestationMsg,
    session: attestationSession,
  } = await attester.startAttestation();

  // (2.2) The claimer answers with an attestation request.
  const claimer = await portablegabi.Claimer.buildFromMnemonic(
    "siege decrease quantum control snap ride position strategy fire point airport include"
  );
  const claim = {
    name: "George Ericson",
    age: 24,
    drivers_license: {
      id: "127128204193",
      category: "B2",
      licensing_authority: "Berlin A52452",
    },
  };
  const {
    message: attestationRequest,
    session: claimerSession,
  } = await claimer.requestAttestation({
    // the received attestation message
    startAttestationMsg,
    // the claim which should get attested
    claim,
    // the public key of the attester
    attesterPubKey: attester.publicKey,
  });

  // (2.3) The attester issues an attestation.
  const {
    // The attestation should be sent over to the claimer.
    attestation,
    // The witness should be stored for later revocation.
    witness,
  } = await attester.issueAttestation({
    attestationSession,
    attestationRequest,
    // The update is used to generate a non-revocation witness.
    accumulator: accPreRevo,
  });
  const credential = await claimer.buildCredential({
    claimerSession,
    attestation,
  });

  /** (3) Revocation phase */

  // Revoke the attestation and receive a new accumulator whitelist.
  const accPostRevo = await attester.revokeAttestation({
    witnesses: [witness],
    accumulator: accPreRevo,
  });
  // Check whether accPostRevo is the latest accumulator on chain.
  console.log(
    "Latest accumulator === accPostRevo? Expected true, received",
    (await chain.getLatestAccumulator(attester.address)).toString()() ===
      accPostRevo.toString()()
  );

  /** (4) Verification phase */
  // Get the exact timestamp of the revocation for simplicity, also works for dates after accumulator date.
  const timeAtRev = await accPostRevo.getDate(attester.publicKey);

  // (4.1) The verifier sends a nonce and context to the claimer and requests disclosed attributes.
  // Note: The requested timestamp equals the accumulator date.
  const {
    session: verifierSession,
    message: presentationReq,
  } = await portablegabi.Verifier.requestPresentation({
    requestedAttributes: ["age", "drivers_license.category"],
    reqUpdatedAfter: timeAtRev,
  });

  // (4.2) The claimer builds a presentation with the revoked credential.
  // Note: They need to update as the credential was build before timeAtRev.
  const presentation = await claimer.buildPresentation({
    credential,
    presentationReq,
    attesterPubKey: attester.publicKey,
  });

  // (4.3) The verifier checks the presentation for non-revocation, valid data and matching attester's public key.

  // We expect success because the credential is still valid in accPreRevo.
  const {
    verified: verifiedPreRevo,
  } = await portablegabi.Verifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
    latestAccumulator: accPreRevo,
  });
  console.log(
    "Cred verified w/ timestamp at revocation and old accumulator?\n\tExpected true, received",
    verifiedPreRevo
  );

  // We expect failure because the credential is invalid in accPostRevo.
  const {
    verified: verifiedPostRevo,
  } = await portablegabi.Verifier.verifyPresentation({
    proof: presentation,
    verifierSession,
    attesterPubKey: attester.publicKey,
    latestAccumulator: accPostRevo,
  });
  console.log(
    "Cred verified w/ timestamp at revocation and new accumulator?\n\tExpected false, received",
    verifiedPostRevo
  );

  // Expect failure when updating a credential whose witness was revoked in any of the used accumulators.
  await credential
    .updateSingle({
      attesterPubKey: attester.publicKey,
      accumulator: accPostRevo,
    })
    .catch(() => {
      console.log("Could not update revoked credential as expected");
    });
}
exec()
  .catch((e) => console.log(e))
  .finally(() => process.exit(1));
```
