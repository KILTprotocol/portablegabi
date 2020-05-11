# Introduction to Portablegabi 

[![NPM](https://img.shields.io/npm/v/@kiltprotocol/portablegabi)](https://www.npmjs.com/package/@kiltprotocol/portablegabi)

The Portablegabi library provides an **easy to use API for signing JSON objects and for verifying and revoking these signatures**.
This library intends to enable the claimer, who possesses the signed JSON object, to prove to a third party, called verifier, that a specific property is present inside the JSON object and that a trusted attester signed the object.
The important benefit of Portablegabi is that the **claimer stays anonymous during the verification**.
The verifier is not able to link two verification sessions to a single identity and learns nothing about the user besides the shared properties.

## Terminology

**Attester**: An entity which signs JSON objects.

**Claim**: A JSON object.

**Credential**: A signed **Claim** which can be used to create a verifiable presentation.

**Claimer**: An entity which is in possession of a **Credential**.

**Presentation**: A **Credential** slice (JSON object) which contains selected properties plus a signature from an attester.

**Verifier**: An entity which requests signed properties from the claimer in form of a presentation.

**Witness**: A unique number tied to a credential which is required to prove whether it has been revoked or not.

**Accumulator**: A whitelist which contains all non-revocation witnesses and can be used to prove that a credential was not revoked.

## Technical overview

The cryptographic primitives of Portablegabi are implemented in [Gabi](https://github.com/privacybydesign/gabi) which is maintained by the [privacy by design foundation](https://privacybydesign.foundation/en/) and also used inside [IRMA](https://www.irmacard.org).
Gabi makes use of [CL-Signatures](https://dl.acm.org/doi/10.5555/1766811.1766838) and is based on the [Idemix Specification](https://domino.research.ibm.com/library/cyberdig.nsf/papers/EEB54FF3B91C1D648525759B004FBBB1/File/rz3730_revised.pdf).

Portablegabi provides a protocol for [attestation](2_attestation.md) and [verification](3_verification.md) of claims.
The **main goals of Portablegabi are _selective disclosure_ and _multi-show unlinkability_**.
_Selective disclosure_ enables the claimer to only present a subset of the information contained inside their attested JSON object.
The _unlinkability_ feature hinders the verifier to link two verification sessions of the same claimer together.
The claimer can interact with the same verifier multiple times without the verifier being able to tell if they talked to the same claimer.
Please note that this only holds true if the claimer does not reveal attributes which uniquely identify them.
Otherwise, the verifier would be able to link multiple sessions together.

### Revocation

The library also provides a scheme to support revocation of attestations using a distributed ledger.
Each attestation contains a _non-revocation witness_ which proves that the attestation is still valid and has not been revoked.
A witness basically consists of two large integer numbers.
It is valid against an attester's accumulator like a signature over a message can be valid against a public key.

#### Accumulator

Each attester has their own _accumulator_ that is written on the blockchain.
Initially, this is just a large random integer and a timestamp signed by the attester.
Therefore, **an accumulator includes every witness by default**.
To be more precise, checking whether a witness is included in an accumulator is done by checking a mathmatical equation.
If the attester wishes to revoke an attestation, they remove the associated witness from the accumulator and update the blockchain with the new one.
This is done by calculating the new accumulator in such a way that the inclusion equality check does not hold true for the witness of the revoked credential.
Thus, if a claimer wants to prove their credential has not been revoked, they prove it is still included inside the newest accumulator.

For more information about the accumulator and witness, please check out the cryptography section of the [IRMA docs](https://irma.app/docs/revocation/#cryptography) or ["Dynamic accumulators and application to efficient revocation of anonymous credentials"](http://static.cs.brown.edu/people/alysyans/papers/camlys02.pdf) by Camenisch et al.

## Architecture of Portablegabi

Portablegabi consists of a part written in [Go](https://golang.org) which wraps the Gabi library and can be compiled to [WASM](https://webassembly.org).
The second part is a [Typescript](http://www.typescriptlang.org/index.html) layer which uses the WASM-Module and provides an API for attestation, verification and revocation. It provides usage with and without a [Substrate](https://www.parity.io/substrate/)-based blockchain implementing the [`portablegabi-pallet`](https://github.com/KILTprotocol/portablegabi-pallet).

Portablegabi is documented using a generated [API reference](https://kiltprotocol.github.io/portablegabi/).

## State of Security

There has been no code audit of portablegabi or of the gabi library.
Portablegabi is therefore experimental and provides no security guarantees.
