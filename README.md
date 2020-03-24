[![Test](https://github.com/KILTprotocol/portablegabi/workflows/Test/badge.svg)](https://github.com/KILTprotocol/portablegabi/actions)

# Portablegabi

This TypeScript module of Portable Gabi enables the use of [Idemix](http://www.research.ibm.com/labs/zurich/idemix/) attribute based anonymous credentials via NPM. It is based on the [Gabi Go](https://github.com/privacybydesign/gabi) implementation by the [Privacy By Design Foundation](https://privacybydesign.foundation/) but does not use the same API.

A user (in the following referred to as _claimer_) claiming something in JSON format (e.g. citizenship in a specific country, ownership of a valid driver's license) can request an attestation from a trusted entity (_attester_) and present these claims to multiple _verifiers_ without revealing their identity or sensitive information (**multi-show unlinkability**).
The claimer can chose which attributes of the claim to disclose to a verifier (**selective disclosure**).

## Tutorial

We recommend visiting our [Portablegabi tutorial](https://kiltprotocol.github.io/portablegabi-tutorial/) to better und

## Revocation and Substraze

This module can be used with and without a [Substrate](https://www.parity.io/substrate/)-based blockchain.
However, it was designed to be used with a chain acting as a decentralised storage of each attester's accumulator versions to enable revocation.
All processes tied to chain activity can be found in files with `chain` suffix. In order to use them, you are required to have an active Substrate blockchain implementing our [`portablegabi-pallet`](https://github.com/KILTprotocol/portablegabi-pallet).
We also provide a blockchain template which includes our pallet and can be used to store accumulators.
In order to use that, just clone and set up the [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node) or use the template to create your own project. Please see our tutorial for more information.

## Installing

To build the package, you need to have [Go 1.14+](https://golang.org/) and [dep](https://github.com/golang/dep) installed. We also recommend installing [yarn](https://yarnpkg.com/getting-started), so you can easily build the WASM.

```bash
npm i @kiltprotocol/portablegabi
yarn build:wasm
```

## Tests

```bash
yarn test
pushd go-wasm && go test ./... && popd
```

## Run in the browser

It is also possible to use the Portablegabi API in the browser. Just include our [`browserBundle.js`](docs/examples/browser/browserBundle.js) and call methods from the `portablegabi` endpoint. See our [browser example](docs/examples/README.md#run-in-the-browser) for more information.

```html
<script src="browserBundle.js"></script>
```

## Example

Please see the [example files](docs/examples/) for a showcase of on- and off-chain usage with single or combined credentials.

```typescript
const portablegabi = require('@kiltprotocol/portablegabi')

/* (1) Claimer Setup */

// (1.1) Example claim
const claim = {
  contents: {
    name: 'Jasper',
    age: '42',
    city: 'Berlin',
    id: 'ed638ndke92902n29',
  },
}

// (1.2) Create the claimer identity (either from scratch or mnemonic seed).
const claimer = await portablegabi.GabiClaimer.create()

/* (2) Attester Setup */

// (2.1) Create a key pair and attester entity.
const attester = await GabiAttester.create(365 * 24 * 60 * 60 * 1000, 70) // takes very long due to finding safe prime numbers (~10-20 minutes)

// (2.1.b) Alternatively, use a pre-compiled key pair (see docs/examples)
// const attester = new portablegabi.Attester(privKey, pubKey)

// (2.1) Create accumulator (for revocation)
const accumulator = await attester.createAccumulator()

/* (3) Attestation */

// (3.1) Attester sends two nonces to claimer
const {
  message: startAttestationMsg,
  session: attestationSession,
} = await attester.startAttestation()

// (3.2) Claimer requests attestation
const {
  message: attestationRequest,
  session: claimerSession,
} = await claimer.requestAttestation({
  startAttestationMsg,
  claim,
  attesterPubKey: attester.publicKey,
})
console.log('Claimer requests attestation:\n\t', attestationRequest)

// (3.3) Attester issues requested attestation and generates a witness which can be used to revoke the attestation
// the attester might want to inspect the attributes he is about to sign
const checkClaim = attestationRequest.getClaim()

const { attestation, witness } = await attester.issueAttestation({
  attestationSession,
  attestationRequest,
  accumulator,
})
console.log('Attester issues attestion:\n\t', attestation)

// (3.4) Claimer builds credential from attester's signature
const credential = await claimer.buildCredential({
  claimerSession,
  attestation,
})
console.log('Claimer builds credential:\n\t', credential)

/* (4) Verification */

// (4.1) Verifier sends two nonces to claimer
const {
  session: verifierSession,
  message: presentationReq,
} = await portablegabi.Verifier.requestPresentation({
  requestedAttributes: ['contents.age', 'contents.city'],
  reqUpdatedAfter: new Date(), // request that the nonrevocation proof contains an accumulator which was created after this date or that the accumulator is the newest available
})
console.log('Verifier starts verification session:\n\t', presentationReq)

// (4.2) Claimer reveals attributes
const proof = await claimer.buildPresentation({
  credential,
  presentationReq,
  attesterPubKey: attester.publicKey,
})
console.log('Claimer builds zk-proof on requested attributes:\n\t', proof)

// (4.3) Verifier verifies attributes
const {
  verified,
  claim: verifiedClaim,
} = await portablegabi.Verifier.verifyPresentation({
  proof,
  verifierSession,
  attesterPubKey: attester.publicKey,
  latestAccumulator: accumulator, // the newest available accumulator
})
console.log('Verifier verifiers proof:\n\t', verified, verifiedClaim)

/* (5) Revocation */

// Revoke the witness of a credential.
const accumulatorAfterRevocation = await attester.revokeAttestation({
  accumulator,
  witnesses: [other_witness, ...],
})

// All claimers have to update their own credential with the new update.
// This will only work for non revoked credentials.
credential = await claimer.updateCredential({
  credential,
  attesterPubKey: attester.publicKey,
  accumulator: accumulatorAfterRevocation,
})
```

# Troubleshooting

## Node process did not exit automatically

Note that due to the usage of a Go WASM via callbacks, all functions are asynchronous. It can happen that NodeJS does not exit automatically since we keep the WASM instance open. We recommend calling `goWasmClose()` from [wasm_exec_wrapper](src/wasm/wasm_exec_wrapper.ts) at the end of your process.

## Go version below 1.14.1

```bash
  [LinkError: WebAssembly Instantiation: Import #3 module="go" function="runtime.nanotime" error: function import requires a callable]
  (node:6909) UnhandledPromiseRejectionWarning: Error: Function genKey missing in WASM
```

Please check your Go version, it should be at least `1.14.1`. If this is the case for you, and you still encounter this problem without having modified our code, [please open a ticket](https://github.com/KILTprotocol/portablegabi/issues/new).

## Limitations

- all numbers inside a claim are handled as `float64`
- arrays are handled as a single attribute. Disclosing a value inside an array is only possible if the whole array is disclosed.

![](./web3_foundation_grants_badge_black.svg)
