/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as portablegabi from '../../src'

const privKey = new portablegabi.AttesterPrivateKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"P":"iDYKxuFGt1Xv1aqMLaagjrOPX0hjkOlFrKOp4NPnSBHmQ9SFETUX1M43q3jLsGz+UEWFS3+SS9QpP4CTkl3p/w==","Q":"92MJOhwjESn7QohCCY1oBxsToAfccGoKtE3sBoaNxHWoowSiCy8fMG+B1sO5QU+bV3i1xwvVno9o30RcMoXEaw==","PPrime":"RBsFY3CjW6r36tVGFtNQR1nHr6QxyHSi1lHU8GnzpAjzIepCiJqL6mcb1bxl2DZ/KCLCpb/JJeoUn8BJyS70/w==","QPrime":"e7GEnQ4RiJT9oUQhBMa0A42J0APuODUFWib2A0NG4jrUUYJRBZePmDfA62HcoKfNq7xa44Xqz0e0b6IuGULiNQ==","ECDSA":"MHcCAQEEILO+g4uSDheZ6PSLxR7olFzUhZpeO9tQu84hX6UeIevaoAoGCCqGSM49AwEHoUQDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevSk":null}'
)
const pubKey = new portablegabi.AttesterPublicKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"N":"g6DWNN/cWep9/lCc6gg0tA8wS1y5LgQx2/fM/wMpYJE8MTZ9SJ3y9kjIBAeSb4aY3vsFhRp8aWsEZzAA0Qu0kW4bzyKN1RU7A0tlmkmDetCxu7Gy2zQMHlTg4YkAVxVYAIIIWhHKHrVLzH7zCsuXos1qm/sthByVdEXv4HPjCZU=","Z":"BiDMFSNGKLIcHJY3tmh2vgiW7D3f5g5b+6Bjf0ns3/rPOg8x0BJ+CzqOLQL+loNIomOzBm/Pk36q3pmPPFMfug80AwUlZOvKTrzj29Agq4DF7p4jruElRyZsdGNjlFkVzILFT/9yrXfjD/9DAHXGm6/4unVnwKP4I0j1r9sLYtg=","S":"Bxm9bNpNLZUM6gy74aR0HW2DadFuy/l+MOdZkG2BiFxbTEP24GXBYA3+d1xajplWEm2iLF4w2OeviIpr8VIzDNy6dXRyGcTnGzj6sVeGlR5u3N+8M2XNH1pNEymLQQbUAt3ogYSWiJW88bxHCf3AZiS91XT1Zh3ENCS9NsyGzt8=","G":"Angd7BuIjTeWGsVLGVCtv+5dx1TMEUr/Z5Fhk7OFUNBexY8fuNfzxfeclgSQpC+nyIAFHc3RB+3Fcs2vOSygopVfLEJo9h7dSjtlcxSZ1wE8YNgouHwfVuq4KWixzIk7Le+IeUzNaQNOL9SI3h5mlxJ5QOO2Src+BPQuFjXPSfI=","H":"U1MyQqwl1LrZY5G61Z2ZDM3zWQKv78HOluCrtxCDBsMvYNRLvhbppOhOdsnG3axN5NIH01/R6mlYojBDg9L7xSwR+1QpmHGUbwkemADlUZQ9c98Up1ORKxNW0asQJdPHV4NGqjQbDfJzejdGJwd95scmSpqLNvRTT+L0iW0ln4A=","T":"BEIUJ5pXzFZPeoB3us341EWxwE7HByM4NaPYRS6YVtDcJdz+H9EEKdUcXhUVrJAQ2OZy2FP0+SNvQVk8AxWDiD73tHUUKDnkMoKSkHPnEnsCInGHr4iTYE2zp8/uEBFxNppq5SP9gQOzE2qekGket2co0W/+jKNtg63u1udlZjo=","R":["OpuoX8xEvGaULH7ir3G/W9zBB1gmYN6lllJsk8+QGGQxydbrtoQiFfhU1Tyqm59sq3GIhksiYB6Th6jYq3BIFKVynX993FPYU2HS2dceFk5kvymIx33u2nTyMzFvox2b6IkKHKXfbtx/VWWlVYcywFOAOiQ1Xa7dXDx1ebuGowE=","Jamoy887kQjyTKjHwgFGxOKugcGIxdUhK9pE/nDTFttU6ndo5qm04AVB5n4WUaFurrKlNSIICheAXI10kIy37Ogr1N4Ge/7TbyZ/hXB8DBzoJbD3MVpXblq9hrhEkb+yyJ9uipnKckflQBWGzl+grXV17SWVhd5TKpUrMw1cDYs=","YGogpko2T4xWQjipZN691tpWJYffyX5evzh2EJAZSpP3evnMbro0Et5Bk+2NY9yt/GoJW8qkVkwEdaYU0jQiGS27F3aJ5e00VOCnZ6bIXJKgcTTxqc5c9NrpJVWNX9n5G590OVTNqlLUOFw3/mIY26A2MKxsa56j2K0V4IM0FI4=","Jca8++mT6d93MK0S8Fb6rtu7TpV9TGqM0mSvO0JKuyRvEro3anRbvZ8sHRLt2q2ePIyCQHz2eUc4iJ1vQLnzMxVavQ3xS5AAS27Tw+xM64JhWV6BFDqZgaEcu22jEi+Rrjjqss2nmC6CQYJZt5g5P0dXGV2JKDcrUaGCtzc4cNE=","ZIV6MWKglRL5B9vv5RmBigbieiuebmy/mcpycXlyQcoZEeNCzuGs/JgRnGr05umbcsQ5ZNSS3TKiL5CM/Z4fanuSu6jNnVoHvSkxI3x28ZpMV8C43CXkS6smmiZP+2SSL419Q247ZbP04T5wHcZ6GooCLxnfx5DeEtRze3UU1Wk=","IbwQtY9iF7C/rNKkTilHP5jEj9r3aI1tRVU9WeMzE9yxrE0mggzpcoCM0lJFLcqVyWhKD3PWssuXwNiLJipUL+sH/u8Qk8Bu6sv/USlUU7sgSJ4akl2Lp+5oYSkzHiZTeJtLg0OVGZnka3pGxzg0ihkkT6Bdk8K2OicTNxlHzgI=","ZQ9/qIgvOx/8dyXlAFeZH+2lriSPaj/NDzPCxR9sXqBYJskSkSrdGogxP2RZeAGyDh7NvwUtvBDQ/vLKz/O3ANPUOnaRx1n4uBF+uBdt0h3Ml/DckhL5k2+nHQsnZWPFxkdpatCIFWcvYuldx+gXLePBaRmNnKMoxAgT+tJnJcw=","ZGfBOqHujseUhLZdfs8kq+/kmG3yMwUAmQrGgTdNej8npNsOyD/Am/SoPdSjpr1enuMgBzva/bjn3/z8nncpia65+v9Pn5831UuFp8h53/1WaEHvN/yctnIKb8k1IRtPlSvnfq7qwC/sIGvHq+ZTj3/ie57rTSkSMrmdFL8PMM0=","TM38T4ekWiNWICCgry7GsppfVt2ImPv4SL//f/J3beP34K1afJCsHk50XJwi8qyMz8HqEVK2sWvMQzJ8Amct4sAfRYIZNmqH7mSR7LwIXvihwv1dUlJv2R7MLTjEGkEnJHE5cCR0K5GxjeQSSgNHAu33MOth3ipsK9ZmF+slSkI=","YwMb/IVn2NsA4y8ZiiBxCWoOg0tsqyYKTakxDZnRhw+wHwhnA3+T87X4tOSAx+dYlmtj3UQzUAeFRYztr2YTrF2boS/YFeAiVh6swPgFOScvmOuf5O4fJn7z+iXr+ivgFccswxBhxqa9MdF8ReqHaVouj8LLyk33fZgWduwfnA=="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevPk":null}'
)

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
  // const attester = await portablegabi.Attester.create() // takes very long due to finding safe prime numbers (~10-20 minutes)

  // (2.1.b) Alternatively, use a pre-compiled key pair from src/testSetup/testConfig.ts
  const attester = new portablegabi.Attester(pubKey, privKey)
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
    .catch((e) => {
      if (e.message.includes('revoked')) {
        console.log('Credential was revoked and cannot be updated')
      } else throw e
    })
}
exec()
