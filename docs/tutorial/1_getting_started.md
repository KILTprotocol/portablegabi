# Getting Started

This tutorial will show you how to use the portablegabi library.
It will take you approx. 30 minutes to work through.
Before you dive in and try out the tutorial, you need to set up your environment.

To get started, you need to have the following dependencies installed:

- [node](https://nodejs.org/en/) (any version starting with 10.19)
- [yarn](https://yarnpkg.com/getting-started)

## Set up a tutorial project

If you want to try out the examples inside this tutorial, create a new project and add Portablegabi as a dependency by using `yarn add`.
If you have built and customized the [Portablegabi repo](https://github.com/KILTprotocol/portablegabi/) on your own, just link it with `yarn link`.

```bash
mkdir portablegabi-rocks
cd portablegabi-rocks
yarn init -y
yarn add @kiltprotocol/portablegabi
# or if you have build and linked Portablegabi by yourself:
yarn link @kiltprotocol/portablegabi
```

Create an JavaScript file

```bash
touch index.js
```

and after adding some code from the examples, execute them with node

```bash
node index.js
```

## Run the examples

Most of the Portablegabi functions are asynchronous (due to calling the WASM in a callback-fashion).
Therefore, you need to wrap the examples inside an asynchronous function which you call in the end.
Moreover, when sending data from JavaScript to WASM and vise versa, it needs to be serialized to a string.
Since the zero knowledge magic happens in the WASM, we rarely deserialize the received data in JavaScript.
In case you are curious, you can deeper inspect the data more by calling `<data>.parse()`.
We wrap all data received from WASM into a custom class `WasmData` that only supports unmarshalling via `JSON.parse(<data>)` by calling `.parse()` and displaying the data as string via `.toString()`

Note: If you run the examples in Typescript and have version [3.8+](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/) installed, you won't be required to do this due to the added top-level `await`.

```js
async function exec() {
  // Portable gabi example functions...
}
exec();
```

The creation of attester keys can take 10 to 30 minutes in javascript.
Therefore, we recommend using the following example keys which to speed up the process.
Please note that you should never use these keys in production.

```js
const portablegabi = require("@kiltprotocol/portablegabi");

const privKey = new portablegabi.AttesterPrivateKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"P":"iDYKxuFGt1Xv1aqMLaagjrOPX0hjkOlFrKOp4NPnSBHmQ9SFETUX1M43q3jLsGz+UEWFS3+SS9QpP4CTkl3p/w==","Q":"92MJOhwjESn7QohCCY1oBxsToAfccGoKtE3sBoaNxHWoowSiCy8fMG+B1sO5QU+bV3i1xwvVno9o30RcMoXEaw==","PPrime":"RBsFY3CjW6r36tVGFtNQR1nHr6QxyHSi1lHU8GnzpAjzIepCiJqL6mcb1bxl2DZ/KCLCpb/JJeoUn8BJyS70/w==","QPrime":"e7GEnQ4RiJT9oUQhBMa0A42J0APuODUFWib2A0NG4jrUUYJRBZePmDfA62HcoKfNq7xa44Xqz0e0b6IuGULiNQ==","ECDSA":"MHcCAQEEILO+g4uSDheZ6PSLxR7olFzUhZpeO9tQu84hX6UeIevaoAoGCCqGSM49AwEHoUQDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevSk":null}'
);
const pubKey = new portablegabi.AttesterPublicKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"N":"g6DWNN/cWep9/lCc6gg0tA8wS1y5LgQx2/fM/wMpYJE8MTZ9SJ3y9kjIBAeSb4aY3vsFhRp8aWsEZzAA0Qu0kW4bzyKN1RU7A0tlmkmDetCxu7Gy2zQMHlTg4YkAVxVYAIIIWhHKHrVLzH7zCsuXos1qm/sthByVdEXv4HPjCZU=","Z":"BiDMFSNGKLIcHJY3tmh2vgiW7D3f5g5b+6Bjf0ns3/rPOg8x0BJ+CzqOLQL+loNIomOzBm/Pk36q3pmPPFMfug80AwUlZOvKTrzj29Agq4DF7p4jruElRyZsdGNjlFkVzILFT/9yrXfjD/9DAHXGm6/4unVnwKP4I0j1r9sLYtg=","S":"Bxm9bNpNLZUM6gy74aR0HW2DadFuy/l+MOdZkG2BiFxbTEP24GXBYA3+d1xajplWEm2iLF4w2OeviIpr8VIzDNy6dXRyGcTnGzj6sVeGlR5u3N+8M2XNH1pNEymLQQbUAt3ogYSWiJW88bxHCf3AZiS91XT1Zh3ENCS9NsyGzt8=","G":"Angd7BuIjTeWGsVLGVCtv+5dx1TMEUr/Z5Fhk7OFUNBexY8fuNfzxfeclgSQpC+nyIAFHc3RB+3Fcs2vOSygopVfLEJo9h7dSjtlcxSZ1wE8YNgouHwfVuq4KWixzIk7Le+IeUzNaQNOL9SI3h5mlxJ5QOO2Src+BPQuFjXPSfI=","H":"U1MyQqwl1LrZY5G61Z2ZDM3zWQKv78HOluCrtxCDBsMvYNRLvhbppOhOdsnG3axN5NIH01/R6mlYojBDg9L7xSwR+1QpmHGUbwkemADlUZQ9c98Up1ORKxNW0asQJdPHV4NGqjQbDfJzejdGJwd95scmSpqLNvRTT+L0iW0ln4A=","T":"BEIUJ5pXzFZPeoB3us341EWxwE7HByM4NaPYRS6YVtDcJdz+H9EEKdUcXhUVrJAQ2OZy2FP0+SNvQVk8AxWDiD73tHUUKDnkMoKSkHPnEnsCInGHr4iTYE2zp8/uEBFxNppq5SP9gQOzE2qekGket2co0W/+jKNtg63u1udlZjo=","R":["OpuoX8xEvGaULH7ir3G/W9zBB1gmYN6lllJsk8+QGGQxydbrtoQiFfhU1Tyqm59sq3GIhksiYB6Th6jYq3BIFKVynX993FPYU2HS2dceFk5kvymIx33u2nTyMzFvox2b6IkKHKXfbtx/VWWlVYcywFOAOiQ1Xa7dXDx1ebuGowE=","Jamoy887kQjyTKjHwgFGxOKugcGIxdUhK9pE/nDTFttU6ndo5qm04AVB5n4WUaFurrKlNSIICheAXI10kIy37Ogr1N4Ge/7TbyZ/hXB8DBzoJbD3MVpXblq9hrhEkb+yyJ9uipnKckflQBWGzl+grXV17SWVhd5TKpUrMw1cDYs=","YGogpko2T4xWQjipZN691tpWJYffyX5evzh2EJAZSpP3evnMbro0Et5Bk+2NY9yt/GoJW8qkVkwEdaYU0jQiGS27F3aJ5e00VOCnZ6bIXJKgcTTxqc5c9NrpJVWNX9n5G590OVTNqlLUOFw3/mIY26A2MKxsa56j2K0V4IM0FI4=","Jca8++mT6d93MK0S8Fb6rtu7TpV9TGqM0mSvO0JKuyRvEro3anRbvZ8sHRLt2q2ePIyCQHz2eUc4iJ1vQLnzMxVavQ3xS5AAS27Tw+xM64JhWV6BFDqZgaEcu22jEi+Rrjjqss2nmC6CQYJZt5g5P0dXGV2JKDcrUaGCtzc4cNE=","ZIV6MWKglRL5B9vv5RmBigbieiuebmy/mcpycXlyQcoZEeNCzuGs/JgRnGr05umbcsQ5ZNSS3TKiL5CM/Z4fanuSu6jNnVoHvSkxI3x28ZpMV8C43CXkS6smmiZP+2SSL419Q247ZbP04T5wHcZ6GooCLxnfx5DeEtRze3UU1Wk=","IbwQtY9iF7C/rNKkTilHP5jEj9r3aI1tRVU9WeMzE9yxrE0mggzpcoCM0lJFLcqVyWhKD3PWssuXwNiLJipUL+sH/u8Qk8Bu6sv/USlUU7sgSJ4akl2Lp+5oYSkzHiZTeJtLg0OVGZnka3pGxzg0ihkkT6Bdk8K2OicTNxlHzgI=","ZQ9/qIgvOx/8dyXlAFeZH+2lriSPaj/NDzPCxR9sXqBYJskSkSrdGogxP2RZeAGyDh7NvwUtvBDQ/vLKz/O3ANPUOnaRx1n4uBF+uBdt0h3Ml/DckhL5k2+nHQsnZWPFxkdpatCIFWcvYuldx+gXLePBaRmNnKMoxAgT+tJnJcw=","ZGfBOqHujseUhLZdfs8kq+/kmG3yMwUAmQrGgTdNej8npNsOyD/Am/SoPdSjpr1enuMgBzva/bjn3/z8nncpia65+v9Pn5831UuFp8h53/1WaEHvN/yctnIKb8k1IRtPlSvnfq7qwC/sIGvHq+ZTj3/ie57rTSkSMrmdFL8PMM0=","TM38T4ekWiNWICCgry7GsppfVt2ImPv4SL//f/J3beP34K1afJCsHk50XJwi8qyMz8HqEVK2sWvMQzJ8Amct4sAfRYIZNmqH7mSR7LwIXvihwv1dUlJv2R7MLTjEGkEnJHE5cCR0K5GxjeQSSgNHAu33MOth3ipsK9ZmF+slSkI=","YwMb/IVn2NsA4y8ZiiBxCWoOg0tsqyYKTakxDZnRhw+wHwhnA3+T87X4tOSAx+dYlmtj3UQzUAeFRYztr2YTrF2boS/YFeAiVh6swPgFOScvmOuf5O4fJn7z+iXr+ivgFccswxBhxqa9MdF8ReqHaVouj8LLyk33fZgWduwfnA=="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevPk":null}'
);
```
