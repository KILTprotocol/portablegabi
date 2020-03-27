# Examples

There are two separate files for both the on- and off-chain examples dealing with the complete issuance and verification process for either a single or a combined proof: [`exampleSingle.ts`](exampleSingle.ts) / [`exampleSingle.chain.ts`](exampleSingle.chain.ts) and [`exampleCombined.ts`](exampleCombined.ts) / [`exampleCombined.chain.ts`](exampleCombined.chain.ts). These should give you a good idea how to the library can be used with and without the chain.

We split both types of examples into the following three processes:

### Off-chain processes

1. [actorProcess](./offchain/1_actorProcess.ts) - Creation of claimer, attester(s) and accumulator(s)
2. [issuanceProcess](./offchain/2_issuanceProcess.ts) - Issuance of the credential (claimer and attester)
3. [verificationProcessSingle](./offchain/3_verificationProcessSingle.ts) / [3_verificationProcessCombined](./offchain/3_verificationProcessCombined.ts) - Verification of the credential w/ and w/o revocation (claimer and verifier)

### On-chain processes

You are required to have an active [substrate](https://www.parity.io/substrate/) blockchain implementing the [`portablegabi-pallet`](https://github.com/KILTprotocol/portablegabi-pallet). You could clone and set up this [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node) basic substrate template implementing the portablegabi-pallet.

1. [actorProcess](./onchain/1_actorProcess.ts) - Creation of claimer, attester(s) and accumulator retrieval of chain or storage if missing
2. [issuanceProcess](./offchain/2_issuanceProcess.ts) - See off-chain (nothing on-chain happens here)
3. [verificationProcessSingle](./onchain/3_verificationProcessSingle.ts) / [3_verificationProcessCombined](./onchain/3_verificationProcessCombined.ts) - Verification of the credential w/ and w/o revocation (claimer and verifier)

Note that we are using `Alice` and `Bob` nodes in the examples to retrieve and store accumulators on the chain. Depending on your chain, you might have to swap the URI to nodes with balance in the [example config](exampleConfig.ts#4), otherwise you can only retrieve them.

## Run in the browser

It is also possible to use the Portablegabi API in the browser, see [here](browser/index.html).
First, you need to bundle the library using webpack.
By default, we bundle our [`browserExample.js`](./browser/browserExample.js), but you can change this easily with the `--entry` option:

```bash
yarn build:webpack --entry <your_script_file> --out <desired_output_file>
```

Without defining `out`, this will create the [`browserBundle.js`](./browser/browserBundle.js) file inside `docs/examples/browser`.

Obviously, you need to serve the files from a server. For development, you could use [goexec](https://github.com/shurcooL/goexec) since you already have Go installed.
Then, just include the `browserBundle.js` as script:

```html
<script src="browserBundle.js"></script>
```

## Where can I find negative examples?

Please note, that the examples displayed here are mainly positive. For negative ones please have a look at the following tests. Most notably are the ones within `GabiVerifier.spec.ts`

- [Accumulator `'Negative tests'`](../../src/attestation/Accumulator.spec.ts#L79)
- [GabiClaimer `'Negative tests'`](../../src/claim/GabiClaimer.spec.ts#L362)
- [GabiAttester `'Test attester functionality'`](../../src/attestation/GabiAttester.spec.ts#L100)
- [GabiVerifier `'Negative tests'`](../../src/verification/GabiVerifier.spec.ts#419)
- [GabiVerifierChain `'Negative tests'`](../../src/verification/GabiVerifier.chain.spec.ts#155)
- [CombinedRequestBuilder `'If one credential is revoked, it...'`](../../src/attestation/CombinedRequestBuilder.spec.ts#234)
- [Blockchain `'Negative tests`](../../src/blockchain/Blockchain.spec.ts#78)

## Remarks

We are aware that the key generation `GabiAttester.create()` takes about more than 10 monutes due to finding huge prime numbers in a single threat being very slow in WASM. Therefore, all examples and tests use pre-generated keys in Go. We are currently working on this issue.
