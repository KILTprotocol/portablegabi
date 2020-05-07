[![Test](https://github.com/KILTprotocol/portablegabi/workflows/Test/badge.svg)](https://github.com/KILTprotocol/portablegabi/actions)
[![NPM](https://img.shields.io/npm/v/@kiltprotocol/portablegabi)](https://www.npmjs.com/package/@kiltprotocol/portablegabi)
[![NPM size](https://img.shields.io/bundlephobia/min/@kiltprotocol/portablegabi)](https://www.npmjs.com/package/@kiltprotocol/portablegabi)
[![Last Commit](https://img.shields.io/github/last-commit/KILTprotocol/portablegabi)](https://github.com/KILTprotocol/portablegabi/commits/develop)
[![License](https://img.shields.io/npm/l/@kiltprotocol/portablegabi)](https://github.com/KILTprotocol/portablegabi/blob/develop/LICENSE)


# Portablegabi

This TypeScript module of Portable Gabi enables the use of [Idemix](http://www.research.ibm.com/labs/zurich/idemix/) attribute based anonymous credentials via NPM. It is based on the [Gabi Go](https://github.com/privacybydesign/gabi) implementation by the [Privacy By Design Foundation](https://privacybydesign.foundation/) but does not use the same API.

A user (in the following referred to as _claimer_) claiming something in JSON format (e.g. citizenship in a specific country, ownership of a valid driver's license) can request an attestation from a trusted entity (_attester_) and present these claims to multiple _verifiers_ without revealing their identity or sensitive information (**multi-show unlinkability**).
The claimer can chose which attributes of the claim to disclose to a verifier (**selective disclosure**).

## Tutorial

We recommend visiting our [Portablegabi tutorial](https://kiltprotocol.github.io/portablegabi-tutorial/) to better understand how to use our anonymous credentials and the API.

Portablegabi also provides a generated [API reference](https://kiltprotocol.github.io/portablegabi/).

## Revocation and Substrate

This module can be used with and without a [Substrate](https://www.parity.io/substrate/)-based blockchain.
However, it was designed to be used with a chain acting as a decentralised storage of each attester's accumulator versions to enable revocation.
All processes tied to chain activity can be found in files with `chain` suffix. In order to use them, you are required to have an active Substrate blockchain implementing our [`portablegabi-pallet`](https://github.com/KILTprotocol/portablegabi-pallet).
We also provide a blockchain template which includes our pallet and can be used to store accumulators.
In order to use that, just clone and set up the [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node) or use the template to create your own project. Please see our tutorial for more information.

## Installing

npm
```
npm i @kiltprotocol/portablegabi
```

yarn
```
yarn add @kiltprotocol/portablegabi
```


## Building + Testing

If you want to help develop portablegabi, we would be glad to merge your pull request.
But first, you need to set up a development environment for our project.
See [our tutorial](https://kiltprotocol.github.io/portablegabi-tutorial/6_development.html) for more information.

## Example

Please see the [example files](docs/examples/) for a showcase of on- and off-chain usage with single or combined credentials.

```typescript
const portablegabi = require('@kiltprotocol/portablegabi')
async function exec() {
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
  const claimer = await portablegabi.Claimer.create()

  /* (2) Attester Setup */

  // (2.1) Create a key pair and attester entity.
  const attester = await portablegabi.Attester.create() // takes very long due to finding safe prime numbers (~10-20 minutes)

  // (2.1.b) Alternatively, use a pre-compiled key pair from /docs/examples/exampleReadme.js
  // const attester = new portablegabi.Attester(pubKey, privKey);
  console.log('Public key:\n\t', attester.privateKey.toString())
  console.log('Private key:\n\t', attester.privateKey.toString())

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
  console.log('Attester checks claim :\n\t', checkClaim)

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
    witnesses: [witness],
  })

  // Expect failure here due to prior revocation.
  await credential
    .updateSingle({
      attesterPubKey: attester.publicKey,
      accumulator: accumulatorAfterRevocation,
    })
    .catch(e => {
      if (e.message.includes('revoked')) {
        console.log('Credential was revoked and cannot be updated')
      } else throw e
    })
}
exec()
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
