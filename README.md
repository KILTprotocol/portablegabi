# Portable Gabi

This TypeScript module of Portable Gabi enables the use of [Idemix](http://www.research.ibm.com/labs/zurich/idemix/) attribute based anonymous credentials via NPM. It is based on the [Gabi Go](https://github.com/privacybydesign/gabi) implementation by the [Privacy By Design Foundation](https://privacybydesign.foundation/) but does not use the same API does.

A user (in the following referred to as "claimer") claiming something (e.g. citizenship in a specific country, ownership of a valid driver's license) can request an attestation from a trusted entity ("attester") and present these claims to multiple verifiers without revealing sensitive information uniquely tied to the claimer. The claimer can chose which attributes of the claim to disclose to a verifier.

Note that due to the usage of a Go WASM (--> callbacks), all functions are asynchronous. It can happen that NodeJs does not exit automatically since we keep the WASM instance open. We recommend calling `goWasmExec()` from `/src/wasm/wasm_exec_wrapper` at the end.

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

The complete process is showcased in the [example file](docs/example.ts). Note that the key generation `GabiAttester.buildFromScratch()` takes about 10 minutes due to finding huge prime numbers being very slow in WASM.

```javascript
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
const claimer = await GabiClaimer.buildFromScratch()
const claimer = await GabiClaimer.buildFromMnemonic(
  'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken'
)

/* (2) Attester Setup */

// (2.1) Create key pair and attester
const attester = await GabiAttester.buildFromScratch() // Takes very long due to finding safe prime numbers, ~10 minutes

// (2.1) Create accumulator (for revocation)
let update = await attester.createAccumulator()

/* (3) Attestation */

// (3.1) Attester sends two nonces to claimer
const {
  message: startAttestationMsg,
  session: AttesterAttestationSession,
} = await attester.startAttestation()

// (3.2) Claimer requests attestation
const {
  message: attestationRequest,
  session: claimerSignSession,
} = await claimer.requestAttestation({
  startAttestationMsg,
  claim: JSON.stringify(claim),
  attesterPubKey: attester.getPubKey(),
})

// (3.3) Attester issues requested attestation and generates a witness which can be used to revoke the attestation
const { attestation, witness } = await attester.issueAttestation({
  attestationSession: AttesterAttestationSession,
  attestationRequest,
  update,
})

// (3.4) Claimer builds credential from attester's signature
const credential = await claimer.buildCredential({
  claimerSignSession,
  attestation,
})

/* (4) Verification */

// (4.1) Verifier sends two nonces to claimer
const {
  session: verifierSession,
  message: presentationReq,
} = await GabiVerifier.requestPresentation({
  requestedAttributes: ['contents.age', 'contents.city'],
  requestNonRevocationProof: true,
  minIndex: 1,
})

// (4.2) Claimer reveals attributes
const proof = await claimer.buildPresentation({
  credential,
  presentationReq,
  attesterPubKey: attester.getPubKey(),
})

// (4.3) Verifier verifies attributes
const {
  claim: verifiedClaim,
  verified,
} = await GabiVerifier.verifyPresentation({
  proof,
  verifierSession,
  attesterPubKey: attester.getPubKey(),
})

/* (5) Revocation */

// revoke witness of a credential
update = await attester.revokeAttestation({ update, witness: other_witness })

// all claimers have to update their own credential with the new update.
// This will only work for non revoked credentials
credential = await claimer.updateCredential({
    credential,
    attesterPubKey: attester.getPubKey(),
    update,
  })

/* (6) Close WASM Instance */
await goWasmClose()

```

## Limitations

- all numbers inside a claim are handled as `float64`
- arrays are handled as a single attribute. Disclosing a value inside an array is only possible if the whole array is disclosed.
