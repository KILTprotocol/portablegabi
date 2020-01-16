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

TODO

## Example

The complete process is showcased in the [example file](docs/example.ts). Note that the key generation `GabiAttester.buildFromScratch()` takes about 10 minutes due to finding huge prime numbers being very slow in WASM.

```javascript
/** (1) Claim **/

// (1.1) Example claim
const claim = {
  contents: {
    name: 'Jasper',
    age: '42',
    city: 'Berlin',
    id: 'ed638ndke92902n29',
  },
}
const disclosedAttribues = ['contents.age', 'contents.city']

// (1.2) Create claimer identity: Either from scratch or mnemonic seed
const claimer = await GabiClaimer.buildFromScratch()
const claimer = await GabiClaimer.buildFromMnemonic(
  'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken'
)

/** (2) Attestation **/

// (2.1) Create attester: Either from scratch or a keypair
const attester = new GabiAttester.buildFromKeyPair(privKey, pubKey)
const attester = new GabiAttester.buildFromScratch() // Takes very long due to finding huge prime numbers, ~10 minutes

// (2.2) Attester sends two nonces to claimer
const {
  message: startAttestationMsg,
  session: attesterSignSession,
} = await gabiAttester.startAttestation()

// (2.3) Claimer requests attestaion
const {
  message: reqSignMsg,
  session: claimerSignSession,
} = await gabiClaimer.requestAttestation({
  startAttestationMsg,
  claim,
  attesterPubKey: attester.getPubKey(),
})

// (2.4) Attester issues requested attestation
const aSignature = await gabiAttester.issueAttestation({
  attesterSignSession,
  reqSignMsg,
})

// (2.5) Claimer builds credential from attester's signature
const credential = await gabiClaimer.buildCredential({
  claimerSignSession,
  signature: aSignature,
})

/** (3) Verification **/

// (3.1) Verifier sends two nonces to claimer
const {
  session: verifierSession,
  message: reqRevealedAttrMsg,
} = await GabiVerifier.startVerificationSession({ disclosedAttributes })

// (3.2) Claimer reveals attributes
const proof = await gabiClaimer.revealAttributes({
  credential,
  reqRevealedAttrMsg,
  attesterPubKey,
})

// (3.3) Verifier verifies attributes
const { claim: verifiedClaim, verified } = await GabiVerifier.verifyAttributes({
  proof,
  verifierSession,
  attesterPubKey,
})

/** (4) Revocation **/
// TODO

/** (5) Close WASM Instance **/
goWasmClose()
```
