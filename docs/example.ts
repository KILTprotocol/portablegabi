/* eslint-disable no-console */
import GabiClaimer from '../build/claim/GabiClaimer'
import GabiAttester from '../build/attestation/GabiAttester'
import GabiVerifier from '../build/verification/GabiVerifier'
import { goWasmClose } from '../build/wasm/wasm_exec_wrapper'
import CombinedRequestBuilder from '../src/verification/CombinedRequestBuilder'
import { Witness, Accumulator } from '../src/types/Attestation'

const testEnv1 = {
  privKey:
    '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"P":"iDYKxuFGt1Xv1aqMLaagjrOPX0hjkOlFrKOp4NPnSBHmQ9SFETUX1M43q3jLsGz+UEWFS3+SS9QpP4CTkl3p/w==","Q":"92MJOhwjESn7QohCCY1oBxsToAfccGoKtE3sBoaNxHWoowSiCy8fMG+B1sO5QU+bV3i1xwvVno9o30RcMoXEaw==","PPrime":"RBsFY3CjW6r36tVGFtNQR1nHr6QxyHSi1lHU8GnzpAjzIepCiJqL6mcb1bxl2DZ/KCLCpb/JJeoUn8BJyS70/w==","QPrime":"e7GEnQ4RiJT9oUQhBMa0A42J0APuODUFWib2A0NG4jrUUYJRBZePmDfA62HcoKfNq7xa44Xqz0e0b6IuGULiNQ==","ECDSA":"MHcCAQEEILO+g4uSDheZ6PSLxR7olFzUhZpeO9tQu84hX6UeIevaoAoGCCqGSM49AwEHoUQDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevSk":null}',
  pubKey:
    '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"N":"g6DWNN/cWep9/lCc6gg0tA8wS1y5LgQx2/fM/wMpYJE8MTZ9SJ3y9kjIBAeSb4aY3vsFhRp8aWsEZzAA0Qu0kW4bzyKN1RU7A0tlmkmDetCxu7Gy2zQMHlTg4YkAVxVYAIIIWhHKHrVLzH7zCsuXos1qm/sthByVdEXv4HPjCZU=","Z":"BiDMFSNGKLIcHJY3tmh2vgiW7D3f5g5b+6Bjf0ns3/rPOg8x0BJ+CzqOLQL+loNIomOzBm/Pk36q3pmPPFMfug80AwUlZOvKTrzj29Agq4DF7p4jruElRyZsdGNjlFkVzILFT/9yrXfjD/9DAHXGm6/4unVnwKP4I0j1r9sLYtg=","S":"Bxm9bNpNLZUM6gy74aR0HW2DadFuy/l+MOdZkG2BiFxbTEP24GXBYA3+d1xajplWEm2iLF4w2OeviIpr8VIzDNy6dXRyGcTnGzj6sVeGlR5u3N+8M2XNH1pNEymLQQbUAt3ogYSWiJW88bxHCf3AZiS91XT1Zh3ENCS9NsyGzt8=","G":"Angd7BuIjTeWGsVLGVCtv+5dx1TMEUr/Z5Fhk7OFUNBexY8fuNfzxfeclgSQpC+nyIAFHc3RB+3Fcs2vOSygopVfLEJo9h7dSjtlcxSZ1wE8YNgouHwfVuq4KWixzIk7Le+IeUzNaQNOL9SI3h5mlxJ5QOO2Src+BPQuFjXPSfI=","H":"U1MyQqwl1LrZY5G61Z2ZDM3zWQKv78HOluCrtxCDBsMvYNRLvhbppOhOdsnG3axN5NIH01/R6mlYojBDg9L7xSwR+1QpmHGUbwkemADlUZQ9c98Up1ORKxNW0asQJdPHV4NGqjQbDfJzejdGJwd95scmSpqLNvRTT+L0iW0ln4A=","T":"BEIUJ5pXzFZPeoB3us341EWxwE7HByM4NaPYRS6YVtDcJdz+H9EEKdUcXhUVrJAQ2OZy2FP0+SNvQVk8AxWDiD73tHUUKDnkMoKSkHPnEnsCInGHr4iTYE2zp8/uEBFxNppq5SP9gQOzE2qekGket2co0W/+jKNtg63u1udlZjo=","R":["OpuoX8xEvGaULH7ir3G/W9zBB1gmYN6lllJsk8+QGGQxydbrtoQiFfhU1Tyqm59sq3GIhksiYB6Th6jYq3BIFKVynX993FPYU2HS2dceFk5kvymIx33u2nTyMzFvox2b6IkKHKXfbtx/VWWlVYcywFOAOiQ1Xa7dXDx1ebuGowE=","Jamoy887kQjyTKjHwgFGxOKugcGIxdUhK9pE/nDTFttU6ndo5qm04AVB5n4WUaFurrKlNSIICheAXI10kIy37Ogr1N4Ge/7TbyZ/hXB8DBzoJbD3MVpXblq9hrhEkb+yyJ9uipnKckflQBWGzl+grXV17SWVhd5TKpUrMw1cDYs=","YGogpko2T4xWQjipZN691tpWJYffyX5evzh2EJAZSpP3evnMbro0Et5Bk+2NY9yt/GoJW8qkVkwEdaYU0jQiGS27F3aJ5e00VOCnZ6bIXJKgcTTxqc5c9NrpJVWNX9n5G590OVTNqlLUOFw3/mIY26A2MKxsa56j2K0V4IM0FI4=","Jca8++mT6d93MK0S8Fb6rtu7TpV9TGqM0mSvO0JKuyRvEro3anRbvZ8sHRLt2q2ePIyCQHz2eUc4iJ1vQLnzMxVavQ3xS5AAS27Tw+xM64JhWV6BFDqZgaEcu22jEi+Rrjjqss2nmC6CQYJZt5g5P0dXGV2JKDcrUaGCtzc4cNE=","ZIV6MWKglRL5B9vv5RmBigbieiuebmy/mcpycXlyQcoZEeNCzuGs/JgRnGr05umbcsQ5ZNSS3TKiL5CM/Z4fanuSu6jNnVoHvSkxI3x28ZpMV8C43CXkS6smmiZP+2SSL419Q247ZbP04T5wHcZ6GooCLxnfx5DeEtRze3UU1Wk=","IbwQtY9iF7C/rNKkTilHP5jEj9r3aI1tRVU9WeMzE9yxrE0mggzpcoCM0lJFLcqVyWhKD3PWssuXwNiLJipUL+sH/u8Qk8Bu6sv/USlUU7sgSJ4akl2Lp+5oYSkzHiZTeJtLg0OVGZnka3pGxzg0ihkkT6Bdk8K2OicTNxlHzgI=","ZQ9/qIgvOx/8dyXlAFeZH+2lriSPaj/NDzPCxR9sXqBYJskSkSrdGogxP2RZeAGyDh7NvwUtvBDQ/vLKz/O3ANPUOnaRx1n4uBF+uBdt0h3Ml/DckhL5k2+nHQsnZWPFxkdpatCIFWcvYuldx+gXLePBaRmNnKMoxAgT+tJnJcw=","ZGfBOqHujseUhLZdfs8kq+/kmG3yMwUAmQrGgTdNej8npNsOyD/Am/SoPdSjpr1enuMgBzva/bjn3/z8nncpia65+v9Pn5831UuFp8h53/1WaEHvN/yctnIKb8k1IRtPlSvnfq7qwC/sIGvHq+ZTj3/ie57rTSkSMrmdFL8PMM0=","TM38T4ekWiNWICCgry7GsppfVt2ImPv4SL//f/J3beP34K1afJCsHk50XJwi8qyMz8HqEVK2sWvMQzJ8Amct4sAfRYIZNmqH7mSR7LwIXvihwv1dUlJv2R7MLTjEGkEnJHE5cCR0K5GxjeQSSgNHAu33MOth3ipsK9ZmF+slSkI=","YwMb/IVn2NsA4y8ZiiBxCWoOg0tsqyYKTakxDZnRhw+wHwhnA3+T87X4tOSAx+dYlmtj3UQzUAeFRYztr2YTrF2boS/YFeAiVh6swPgFOScvmOuf5O4fJn7z+iXr+ivgFccswxBhxqa9MdF8ReqHaVouj8LLyk33fZgWduwfnA=="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevPk":null}',
  claim: JSON.stringify({
    cType: '0x39ffc33202410721743e19082986e650b4e847b85bea7eab77...',
    contents: {
      id: 9007199254740993,
      picture: {
        URL: 'http://placehold.it/32x32',
        DATA: 'Ox123123123123123123DEADBEeF',
      },
      eyeColor: true,
    },
  }),
  disclosedAttributes: ['contents.picture.DATA', 'contents.id'],
  mnemonic:
    'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken',
}

const testEnv2 = {
  privKey:
    '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610785920,"P":"9TW0SbOeS3UfKwv6a85VGcmCzb0wkG7ZCM0iesXzvXfjLBHoTc1dwpTNa85cgbS4eytypMBgRERmSEpS3f4A6w==","Q":"jMLlfQmJNUlBVI2i2bf0JCPgf47DV9VJ/b26eg+1VgdroIzNlJHhqn1kHBfCYKYCDu8u1P7u4aqiyZccdbLmzw==","PPrime":"epraJNnPJbqPlYX9NecqjOTBZt6YSDdshGaRPWL53rvxlgj0Juau4UpmtecuQNpcPZW5UmAwIiIzJCUpbv8AdQ==","QPrime":"RmFyvoTEmqSgqkbRbNv6EhHwP8dhq+qk/t7dPQfaqwO10EZmykjw1T6yDgvhMFMBB3eXan93cNVRZMuOOtlzZw==","ECDSA":"MHcCAQEEIIXBgLpoCL0Ly0J7ZGQVlOTf+MTuhUqnKX03XDlewf6ToAoGCCqGSM49AwEHoUQDQgAEdzoV71Dge11D7bCVbmQUEyOy9S5Y8h1cngnjq4tVR+JnvbzI/2bH4/O1GHmT+jtN9YTSHw5RgADpBGTmofmm1A=="}',
  pubKey:
    '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610785920,"N":"htQNG7y19QDlkMHfrZzip1HyCpQzRDkmpfUEU2l3Bkx4N2bbSJ/CIcsqDjDViLk2c+eg44t6BcNxDcGUGMdBj2mh5uONNAE48bvfN3C/BogXbt/ilYUlMf9Q3XpPzc39JZGKXon5CreyK1sx2LVKhE9d65kSugGBvSO0L7+b4AU=","Z":"X1B+508I1b7i/+0Ej+JQFhjuvopJ9sQcu3+eirVdjNrnUWKR+6o8Fcb1mPg4oiPr8g5/BT1t8qOqy39j3/bW51SqHZf9y7rMoyNVl8mvcSHM83nbStMSFSJJCKCDksVtwEeCohCpAIvCH2y4S6AKkNUn0DfFZdCTXKOWVrFdosA=","S":"A8V9xIuQvZQVr1UfqcMQM4J4nw8TLggY7V51gWG+5xQ38OGh725+56oLmtGwwxgUR66BckJJ7gjeQh0usqKSgBQqg8GcZXTSGsC01QO1L8Vt+8OYKQKZFrbJN/xvnq5lRYNfEQ2B2gOqT1rubHt2kP1gVccCnpAmSlxZNORdHqg=","G":"GHR8oz3wVc+ory6aQWP5DC2O++Q7mpqIr0Qb7P4Qb3RgyyokfdR71+ko3ILDKsLWoSWlpaPchBif3PlAt0IiOziKmgdd9n3Psu4o/KnJc1x9bem8G8HrE7YwMfk71u9PcGYJaTgQ/xo+lrIHsNo0sLBED9fH2RiGtsQl2gnGoBg=","H":"CWj72rLGfbLKbm6f/fjctf/TDCMita3lwzjZJzMhEcXrTJ2RfO0XrkVLHb2hY7sfIj6RJchdaSDkuaRfxZfV+fR55h6y8tX6+vmHrpE2o4rZQ4nKNP6h3udmowTw+vQEy+dLwT+IUFDbW0CVlVv/OqtVOMM1tMf0huBBb8qBo6g=","T":"HsA4U2yoOICblCt9qtZ1pTlWyjCIOp3VwttHOnrsT0M0ZhKVrXhedQwJGBY+0PlLIzzGEz2WzFwF4Gdh7q2iJL/W7znEy8aolWYQrMWS8mDC5AS1FPyBdBAKdpCZbkjqV4BkumB8Q2sQSBxSuC2N9dFfh+u2+KVXlB9qs0O4UgY=","R":["J8b8BTbgPuc8x/zlXx4EoYJOfyfxrXbv0OnlLAuvFWDN1oEPutASYaL/Q0ghOaIvH+U1zJdAZr1TzXs7qHQFHqxxcnze3JwDKeY2gZ7wqaXW9nGwLKFmJYySm1zpmhxmpA0hJpxxt9UL47OV0KG9EzyEVFIkuasgO2URuTAiiQg=","O8++5a8Z4frJwz3LuDomlbE4HebLlcnyNeqe23jY5GOsuRARfRoJEhOQvQQs3SVPVp/o4ApywyN94LW7HdAhH9Ef9U6tR7kJE/X/9IRdo17AYwm/R+n6moU3sKXo80XyXk3YBipURkYvZr69/qDtWMQhaTS0UOMTUlU1rG04IBg=","KN66kHkvOukEKj5oakbQYAt8KfCgQSOZ5G8EDb0l6CL2NUXwPncEKgSofBEAcK5sq2PAINZ9SnG0NAeKAHA0xbY9h22JgOrfwQn4QRQLFKSYz44qG/msa3McLseX6wzVQVpY/h0oWKEXcCItZ+mQrXBkYFAxoFoxwHUOthVsE4I=","RZzBYfb8W/i2NU02t685bkLzUNdKLFuyA/HvBrpaz48P/9ACQ2s3N033v5M/IBFO7MpucR42x/yfFvbnUmB+2rVifdjPEwWbHydwPLi5hq1WN5iExUw0YMtmnt+NpC2N2kbUMmpotaVB1w0atCcZ9eR3J7GixBKIikwffEndbPM=","bUx5ZpJfn7n/dbsGxQ4cGGBDbW1VvejXU6/Qiu33PF+gYkdKrHMMCnmhglJfbRwpBH3Fj6L0LVpybLOjTyzK/3F+C7AlE0E1E9nXQGiW6qAxWDw9sNXke65lt/VEwO6uu1LSf6nNuYJNzcGH3aRq4N7wrDYkkb2Eu42aKHkVl+U=","hmVW2rT3HBSWH6F3sZDhZQOVvqfcuPtzZ2PU2FC/HVxDroHm/xAOojh7W/68mfXfUlfjsZJHr7SoOOXSGSXjU0tmn7xRuOD2vjzzWXnXcpn284fsO9O4qb7gjqy7HLfSGWxxKtSHyKdCuzIJE1Iiuo369wGt4paMV71sCH39DV0="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdzoV71Dge11D7bCVbmQUEyOy9S5Y8h1cngnjq4tVR+JnvbzI/2bH4/O1GHmT+jtN9YTSHw5RgADpBGTmofmm1A=="}',
  claim: JSON.stringify({
    cType: '0x39ffc33202410721743e19082986e650b4e847b85bea7eab77...',
    contents: {
      ident: 9007199254740993,
      image: {
        URI: 'http://placehold.it/32x32',
        BINARY: 'Ox123123123123123123DEADBEeF',
      },
      eyeColour: true,
    },
  }),
  disclosedAttributes: ['contents.image.BINARY', 'contents.ident'],
  mnemonic:
    'scissors again purse yellow cabbage fat alpha snack come ripple jacket broken',
}

const issuanceProcess = async (
  attester: GabiAttester,
  claimer: GabiClaimer,
  update: Accumulator,
  claim: string
): Promise<{ credential: string; witness: Witness }> => {
  console.time('Start attestation: attester sends nonce and context to claimer')
  const {
    message: startAttestationMsg,
    session: attestationSession,
  } = await attester.startAttestation()
  console.timeEnd(
    'Start attestation: attester sends nonce and context to claimer'
  )

  console.time('Claimer requests attestation')
  const {
    message: attestationRequest,
    session: claimerSignSession,
  } = await claimer.requestAttestation({
    startAttestationMsg,
    claim,
    attesterPubKey: attester.getPubKey(),
  })
  console.timeEnd('Claimer requests attestation')

  console.time('Attester issues requested attestation')
  const { attestation, witness } = await attester.issueAttestation({
    attestationSession,
    attestationRequest,
    update,
  })
  console.timeEnd('Attester issues requested attestation')

  console.time('Claimer builds credential')
  const credential = await claimer.buildCredential({
    claimerSignSession,
    attestation,
  })
  console.timeEnd('Claimer builds credential')
  return { credential, witness }
}

const verify = async (
  claimer: GabiClaimer,
  attester: GabiAttester,
  credential: string,
  disclosedAttributes: string[],
  index: number
): Promise<boolean> => {
  console.time('Verifier requests attributes')
  const {
    session: verifierSession,
    message: presentationReq,
  } = await GabiVerifier.requestPresentation({
    requestNonRevocationProof: true,
    requestedAttributes: disclosedAttributes,
    minIndex: index,
  })
  console.timeEnd('Verifier requests attributes')

  console.time('Claimer reveals attributes')
  const proof = await claimer.revealAttributes({
    credential,
    presentationReq,
    attesterPubKey: attester.getPubKey(),
  })
  console.timeEnd('Claimer reveals attributes')

  console.time('Verifier verifies attributes')
  const {
    claim: verifiedClaim,
    verified,
  } = await GabiVerifier.verifyPresentation({
    proof,
    verifierSession,
    attesterPubKey: attester.getPubKey(),
  })
  console.timeEnd('Verifier verifies attributes')
  console.log('Verified claim: ', verifiedClaim)
  console.log('Claim verified?', verified)

  return false
}

const runWorkflow = async (): Promise<void> => {
  const { disclosedAttributes, claim, privKey, pubKey } = testEnv1

  console.time('build attester')
  const gabiAttester = new GabiAttester(pubKey, privKey)
  console.timeEnd('build attester')

  console.time('Build claimer identity')
  // const gabiClaimer = await GabiClaimer.buildFromMnemonic(mnemonic)
  const gabiClaimer = await GabiClaimer.buildFromScratch()
  console.timeEnd('Build claimer identity')

  console.time('Build accumulator')
  let update = await gabiAttester.createAccumulator()
  console.timeEnd('Build accumulator')

  let { credential } = await issuanceProcess(
    gabiAttester,
    gabiClaimer,
    update,
    claim
  )
  const { credential: credential2, witness: witness2 } = await issuanceProcess(
    gabiAttester,
    gabiClaimer,
    update,
    claim
  )
  // should verify
  await verify(gabiClaimer, gabiAttester, credential, disclosedAttributes, 1)
  await verify(gabiClaimer, gabiAttester, credential2, disclosedAttributes, 1)
  // should not verify (there is no accumulator with index 2, newest accumulator has index 1)
  await verify(gabiClaimer, gabiAttester, credential, disclosedAttributes, 2)

  console.time('revoke attestation')
  update = await gabiAttester.revokeAttestation({ update, witness: witness2 })
  console.timeEnd('revoke attestation')

  console.time('update credential')
  credential = await gabiClaimer.updateCredential({
    credential,
    attesterPubKey: gabiAttester.getPubKey(),
    update,
  })
  console.timeEnd('update credential')
  await verify(gabiClaimer, gabiAttester, credential, disclosedAttributes, 1)
}

const runCombinedWorkflow = async (): Promise<void> => {
  const {
    disclosedAttributes: disclosedAttributes1,
    claim: claim1,
    privKey: privKey1,
    pubKey: pubKey1,
  } = testEnv1
  const {
    disclosedAttributes: disclosedAttributes2,
    claim: claim2,
    privKey: privKey2,
    pubKey: pubKey2,
  } = testEnv2

  console.time('build attester')
  const gabiAttester1 = new GabiAttester(pubKey1, privKey1)
  console.timeEnd('build attester')

  console.time('build attester')
  const gabiAttester2 = new GabiAttester(pubKey2, privKey2)
  console.timeEnd('build attester')

  console.time('Build claimer identity')
  // const gabiClaimer = await GabiClaimer.buildFromMnemonic(mnemonic)
  const gabiClaimer = await GabiClaimer.buildFromScratch()
  console.timeEnd('Build claimer identity')

  console.time('Build accumulator')
  const update1 = await gabiAttester1.createAccumulator()
  console.timeEnd('Build accumulator')

  console.time('Build accumulator')
  const update2 = await gabiAttester2.createAccumulator()
  console.timeEnd('Build accumulator')

  // eslint-disable-next-line prefer-const
  const { credential: credential1 } = await issuanceProcess(
    gabiAttester1,
    gabiClaimer,
    update1,
    claim1
  )
  const { credential: credential2 } = await issuanceProcess(
    gabiAttester2,
    gabiClaimer,
    update2,
    claim2
  )

  const { message, session } = await new CombinedRequestBuilder()
    .requestPresentation({
      requestedAttributes: disclosedAttributes1,
      requestNonRevocationProof: true,
      minIndex: 1,
    })
    .requestPresentation({
      requestedAttributes: disclosedAttributes2,
      requestNonRevocationProof: true,
      minIndex: 1,
    })
    .finalise()

  console.time('Build combined presentation')
  const proof = await gabiClaimer.buildCombinedPresentation({
    credentials: [credential1, credential2],
    combinedPresentationReq: message,
    attesterPubKeys: [gabiAttester1.getPubKey(), gabiAttester2.getPubKey()],
  })
  console.timeEnd('Build combined presentation')

  console.time('verify combined presentation')
  const { verified, claims } = await GabiVerifier.verifyCombinedPresentation({
    proof,
    attesterPubKeys: [gabiAttester1.getPubKey(), gabiAttester2.getPubKey()],
    verifierSession: session,
  })
  console.timeEnd('verify combined presentation')

  console.log('Verification:', verified, claims)
}

const runGabiExamples = async (): Promise<void> => {
  console.time('>> Complete Combined Gabi process <<')
  await runCombinedWorkflow()
  console.timeEnd('>> Complete Combined Gabi process <<')

  console.time('>> Complete Gabi process <<')
  await runWorkflow()
  console.timeEnd('>> Complete Gabi process <<')

  goWasmClose()
}

runGabiExamples()
