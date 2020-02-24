# Portablegabi

This TypeScript module of Portable Gabi enables the use of [Idemix](http://www.research.ibm.com/labs/zurich/idemix/) attribute based anonymous credentials via NPM. It is based on the [Gabi Go](https://github.com/privacybydesign/gabi) implementation by the [Privacy By Design Foundation](https://privacybydesign.foundation/) but does not use the same API.

A user (in the following referred to as "claimer") claiming something (e.g. citizenship in a specific country, ownership of a valid driver's license) can request an attestation from a trusted entity ("attester") and present these claims to multiple verifiers without revealing sensitive information uniquely tied to the claimer. The claimer can chose which attributes of the claim to disclose to a verifier.

Note that due to the usage of a Go WASM via callbacks, all functions are asynchronous. It can happen that NodeJS does not exit automatically since we keep the WASM instance open. We recommend calling `goWasmClose()` from [wasm_exec_wrapper](src/wasm/wasm_exec_wrapper.ts) at the end of your process.

This module can be used with and without a substrate based blockchain. However, it was designed to be used with a chain acting as a decentralised storage of each attester's accumulator versions. All processes tied to chain activity can be found in files with `chain` suffix. In order to use them, you are required to have an active [substrate](https://www.parity.io/substrate/) blockchain implementing the [`portablegabi-pallet`](https://github.com/KILTprotocol/portablegabi-pallet). You could clone and set up this [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node) basic substrate template implementing the portablegabi-pallet.

## Installing

To build the package, you need to have [GO](https://golang.org/) and [dep](https://github.com/golang/dep) installed.

```bash
npm i @kiltprotocol/portablegabi
yarn build:wasm
```

## Tests

```bash
yarn test
pushd go-wasm && go test ./... && popd
```

## Example

Please see the [example files](docs/examples/) for a showcase of on- and off-chain usage with single or combined credentials.

```typescript
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

// (1.2) Create claimer identity: Either from scratch or mnemonic seed
const claimer = await GabiClaimer.create()

/* (2) Attester Setup */

// (2.1) Create key pair and attester
const attester = GabiAttester.create()

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

// (3.3) Attester issues requested attestation and generates a witness which can be used to revoke the attestation
// the attester might want to inspect the attributes he is about to sign
const checkClaim = attestationRequest.getClaim()

const { attestation, witness } = await attester.issueAttestation({
  attestationSession,
  attestationRequest,
  accumulator,
})

// (3.4) Claimer builds credential from attester's signature
const credential = await claimer.buildCredential({
  claimerSession,
  attestation,
})

/* (4) Verification */

// (4.1) Verifier sends two nonces to claimer
const {
  session: verifierSession,
  message: presentationReq,
} = await GabiVerifier.requestPresentation({
  requestedAttributes: ['contents.age', 'contents.city'],
  reqUpdatedAfter: new Date(), // request that the nonrevocation proof contains an accumulator which was created after this date or that the accumulator is the newest available
})

// (4.2) Claimer reveals attributes
const proof = await claimer.buildPresentation({
  credential,
  presentationReq,
  attesterPubKey: attester.publicKey,
})

// (4.3) Verifier verifies attributes
const {
  verified,
  claim: verifiedClaim,
} = await GabiVerifier.verifyPresentation({
  proof,
  verifierSession,
  attesterPubKey: attester.publicKey,
  latestAccumulator: accumulator, // the newest available accumulator
})

/* (5) Revocation */

// revoke witness of a credential
const accumulatorAfterRevocation = await attester.revokeAttestation({
  accumulator,
  witnesses: [other_witness, ...],
})

// all claimers have to update their own credential with the new update.
// this will only work for non revoked credentials
credential = await claimer.updateCredential({
  credential,
  attesterPubKey: attester.publicKey,
  accumulator: accumulatorAfterRevocation,
})
```

## Limitations

- all numbers inside a claim are handled as `float64`
- arrays are handled as a single attribute. Disclosing a value inside an array is only possible if the whole array is disclosed.
