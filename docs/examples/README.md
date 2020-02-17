## Offchain examples

There are two separate files [`exampleSingle.ts`](exampleSingle.ts) and [`exampleCombined.ts`](exampleCombined.ts) dealing with the complete issuance and verification process for either a single or a combined proof. These should give you a good idea how to the library can be used apart from the chain.

We split both examples into the following three processes:

1. [actorProcess](./offchain/1_actorProcess.ts) - Creation of claimer, attester(s) and accumulator(s)
2. [issuanceProcess](./offchain/2_issuanceProcess.ts) - Issuance of the credential (claimer and attester)
3. [verificationProcessSingle](./offchain/3_verificationProcessSingle.ts) / [3_verificationProcessCombined](./offchain/3_verificationProcessCombined.ts) - Verification of the credential w/ and w/o revocation (claimer and verifier)

## Onchain examples

TODO: Complete

### Where can I find negative examples?

Please note, that the examples displayed here are mainly positive. For negative ones please have a look at the following tests. Most notably are the ones within `GabiVerifier.spec.ts`

- [Accumulator `'Negative tests'`](../../src/attestation/Accumulator.spec.ts#L79)
- [GabiClaimer `'Negative tests'`](../../src/claim/GabiClaimer.spec.ts#L362)
- [GabiAttester `'Test attester functionality'`](../../src/attestation/GabiAttester.spec.ts#L100)
- [GabiVerifier `'Negative tests'`](../../src/verification/GabiVerifier.spec.ts#419)
- [CombinedRequestBuilder `'If one credential is revoked, it...'`](../../src/attestation/CombinedRequestBuilder.spec.ts#234)
- TODO: Onchain methods

### Remarks

We are aware that the key generation `GabiAttester.create()` takes about more than 10 monutes due to finding huge prime numbers being very slow in WASM. We are currently working on this issue.
