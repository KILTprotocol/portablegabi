import { AttesterPublicKey, AttesterPrivateKey } from '../types/Attestation'

// general test variables
export const privKey = new AttesterPrivateKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"P":"iDYKxuFGt1Xv1aqMLaagjrOPX0hjkOlFrKOp4NPnSBHmQ9SFETUX1M43q3jLsGz+UEWFS3+SS9QpP4CTkl3p/w==","Q":"92MJOhwjESn7QohCCY1oBxsToAfccGoKtE3sBoaNxHWoowSiCy8fMG+B1sO5QU+bV3i1xwvVno9o30RcMoXEaw==","PPrime":"RBsFY3CjW6r36tVGFtNQR1nHr6QxyHSi1lHU8GnzpAjzIepCiJqL6mcb1bxl2DZ/KCLCpb/JJeoUn8BJyS70/w==","QPrime":"e7GEnQ4RiJT9oUQhBMa0A42J0APuODUFWib2A0NG4jrUUYJRBZePmDfA62HcoKfNq7xa44Xqz0e0b6IuGULiNQ==","ECDSA":"MHcCAQEEILO+g4uSDheZ6PSLxR7olFzUhZpeO9tQu84hX6UeIevaoAoGCCqGSM49AwEHoUQDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevSk":null}'
)
export const pubKey = new AttesterPublicKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610554062,"N":"g6DWNN/cWep9/lCc6gg0tA8wS1y5LgQx2/fM/wMpYJE8MTZ9SJ3y9kjIBAeSb4aY3vsFhRp8aWsEZzAA0Qu0kW4bzyKN1RU7A0tlmkmDetCxu7Gy2zQMHlTg4YkAVxVYAIIIWhHKHrVLzH7zCsuXos1qm/sthByVdEXv4HPjCZU=","Z":"BiDMFSNGKLIcHJY3tmh2vgiW7D3f5g5b+6Bjf0ns3/rPOg8x0BJ+CzqOLQL+loNIomOzBm/Pk36q3pmPPFMfug80AwUlZOvKTrzj29Agq4DF7p4jruElRyZsdGNjlFkVzILFT/9yrXfjD/9DAHXGm6/4unVnwKP4I0j1r9sLYtg=","S":"Bxm9bNpNLZUM6gy74aR0HW2DadFuy/l+MOdZkG2BiFxbTEP24GXBYA3+d1xajplWEm2iLF4w2OeviIpr8VIzDNy6dXRyGcTnGzj6sVeGlR5u3N+8M2XNH1pNEymLQQbUAt3ogYSWiJW88bxHCf3AZiS91XT1Zh3ENCS9NsyGzt8=","G":"Angd7BuIjTeWGsVLGVCtv+5dx1TMEUr/Z5Fhk7OFUNBexY8fuNfzxfeclgSQpC+nyIAFHc3RB+3Fcs2vOSygopVfLEJo9h7dSjtlcxSZ1wE8YNgouHwfVuq4KWixzIk7Le+IeUzNaQNOL9SI3h5mlxJ5QOO2Src+BPQuFjXPSfI=","H":"U1MyQqwl1LrZY5G61Z2ZDM3zWQKv78HOluCrtxCDBsMvYNRLvhbppOhOdsnG3axN5NIH01/R6mlYojBDg9L7xSwR+1QpmHGUbwkemADlUZQ9c98Up1ORKxNW0asQJdPHV4NGqjQbDfJzejdGJwd95scmSpqLNvRTT+L0iW0ln4A=","T":"BEIUJ5pXzFZPeoB3us341EWxwE7HByM4NaPYRS6YVtDcJdz+H9EEKdUcXhUVrJAQ2OZy2FP0+SNvQVk8AxWDiD73tHUUKDnkMoKSkHPnEnsCInGHr4iTYE2zp8/uEBFxNppq5SP9gQOzE2qekGket2co0W/+jKNtg63u1udlZjo=","R":["OpuoX8xEvGaULH7ir3G/W9zBB1gmYN6lllJsk8+QGGQxydbrtoQiFfhU1Tyqm59sq3GIhksiYB6Th6jYq3BIFKVynX993FPYU2HS2dceFk5kvymIx33u2nTyMzFvox2b6IkKHKXfbtx/VWWlVYcywFOAOiQ1Xa7dXDx1ebuGowE=","Jamoy887kQjyTKjHwgFGxOKugcGIxdUhK9pE/nDTFttU6ndo5qm04AVB5n4WUaFurrKlNSIICheAXI10kIy37Ogr1N4Ge/7TbyZ/hXB8DBzoJbD3MVpXblq9hrhEkb+yyJ9uipnKckflQBWGzl+grXV17SWVhd5TKpUrMw1cDYs=","YGogpko2T4xWQjipZN691tpWJYffyX5evzh2EJAZSpP3evnMbro0Et5Bk+2NY9yt/GoJW8qkVkwEdaYU0jQiGS27F3aJ5e00VOCnZ6bIXJKgcTTxqc5c9NrpJVWNX9n5G590OVTNqlLUOFw3/mIY26A2MKxsa56j2K0V4IM0FI4=","Jca8++mT6d93MK0S8Fb6rtu7TpV9TGqM0mSvO0JKuyRvEro3anRbvZ8sHRLt2q2ePIyCQHz2eUc4iJ1vQLnzMxVavQ3xS5AAS27Tw+xM64JhWV6BFDqZgaEcu22jEi+Rrjjqss2nmC6CQYJZt5g5P0dXGV2JKDcrUaGCtzc4cNE=","ZIV6MWKglRL5B9vv5RmBigbieiuebmy/mcpycXlyQcoZEeNCzuGs/JgRnGr05umbcsQ5ZNSS3TKiL5CM/Z4fanuSu6jNnVoHvSkxI3x28ZpMV8C43CXkS6smmiZP+2SSL419Q247ZbP04T5wHcZ6GooCLxnfx5DeEtRze3UU1Wk=","IbwQtY9iF7C/rNKkTilHP5jEj9r3aI1tRVU9WeMzE9yxrE0mggzpcoCM0lJFLcqVyWhKD3PWssuXwNiLJipUL+sH/u8Qk8Bu6sv/USlUU7sgSJ4akl2Lp+5oYSkzHiZTeJtLg0OVGZnka3pGxzg0ihkkT6Bdk8K2OicTNxlHzgI=","ZQ9/qIgvOx/8dyXlAFeZH+2lriSPaj/NDzPCxR9sXqBYJskSkSrdGogxP2RZeAGyDh7NvwUtvBDQ/vLKz/O3ANPUOnaRx1n4uBF+uBdt0h3Ml/DckhL5k2+nHQsnZWPFxkdpatCIFWcvYuldx+gXLePBaRmNnKMoxAgT+tJnJcw=","ZGfBOqHujseUhLZdfs8kq+/kmG3yMwUAmQrGgTdNej8npNsOyD/Am/SoPdSjpr1enuMgBzva/bjn3/z8nncpia65+v9Pn5831UuFp8h53/1WaEHvN/yctnIKb8k1IRtPlSvnfq7qwC/sIGvHq+ZTj3/ie57rTSkSMrmdFL8PMM0=","TM38T4ekWiNWICCgry7GsppfVt2ImPv4SL//f/J3beP34K1afJCsHk50XJwi8qyMz8HqEVK2sWvMQzJ8Amct4sAfRYIZNmqH7mSR7LwIXvihwv1dUlJv2R7MLTjEGkEnJHE5cCR0K5GxjeQSSgNHAu33MOth3ipsK9ZmF+slSkI=","YwMb/IVn2NsA4y8ZiiBxCWoOg0tsqyYKTakxDZnRhw+wHwhnA3+T87X4tOSAx+dYlmtj3UQzUAeFRYztr2YTrF2boS/YFeAiVh6swPgFOScvmOuf5O4fJn7z+iXr+ivgFccswxBhxqa9MdF8ReqHaVouj8LLyk33fZgWduwfnA=="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKvmUz3HIZy890jE78CC9V9BuN8taO+L8GjAeS14v0CL7GCFZ1GMnaSZi4WG3mOjJlJ80CnMowIbUT3Fw1TluFw==","NonrevPk":null}'
)
export const privKey2 = new AttesterPrivateKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610717317,"P":"5zxD1X3VJHrs9830IttDdTIR+jcN7aUyLGe35PZ4ac7jBlpXyQCelahu3uTMLg/vSdoT1vHcehpXDhk8HIH0bw==","Q":"zvZZW+LRX6EGVZee8U8Zni1lx9CVnGphE5uLFNfW25O7ycKl+y8kpgM0V8UctCVpkXT1+BNpCsxkCn2DkCdT2w==","PPrime":"c54h6r7qkj12e+b6EW2hupkI/RuG9tKZFjPb8ns8NOdxgy0r5IBPStQ3b3JmFwf3pO0J63juPQ0rhwyeDkD6Nw==","QPrime":"Z3ssrfFor9CDKsvPeKeMzxay4+hKzjUwic3Fimvrbcnd5OFS/ZeSUwGaK+KOWhK0yLp6/Am0hWYyBT7ByBOp7Q==","ECDSA":"MHcCAQEEIBCgoaFo9tFofJ95VHYSkhcoHFsb3lSyApEiaUMsS0N2oAoGCCqGSM49AwEHoUQDQgAED7eiYNhoE9gzmAYz9wYJruB2d+WUqGdU07KilWOdB3dGvi9VfTpSqKTzI7WTGb8uMPz2aROqAmwm70zu8wLBSw=="}'
)
export const pubKey2 = new AttesterPublicKey(
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610717317,"N":"uvEDNe1KFkV3b1Op7HuOdnVDsNMj6amft1I9011DQx2NPdDnevFmE6Xly/cG2muJ6RR4IUOicKA9qxrb2l83RvsNgwtbrwdeWBiH794s/Jq4D9GicXARhU3nsC2oHQewGv4/Q5J0yjHjJ8G50VGw2aRfmPL91XLKpp/MwjJVF/U=","Z":"BOdJs8S8Sxs6lRRwzVux4XA+Q91fkaK6o8TH2+pNhGxkxg3OzHGKjT8wpd8qPJXORvyjUQV4krzf8rc+jNQJIdQB19vtrASdNb/ezpxSq9JymNJ/6mkIaVo7tt4C0/G1oSlqkzs0Jfcx7jrv8k1jhLIXbMMkjMiKpU4fN/ZkpWE=","S":"qwUXLSQLiy+r5i7qS9bhxEsmjFZ9AF1z3U0x8/g73MDefGe7KXps/U0TjKrqr/Pkr++Rzuq/EWMW8mB8QlGbdmMK+YShoyLcg8bspk0eKIuzAn3PMLWlNW2XaxveQIinxKGQFCTJrQSSg5T8fJqMWZgnheuKcJVt17WKMaY50UM=","G":"QZWQU/7gRkeVViLeS7gEWPp/m4OKAZbJGDsTXqUTrHzRO0RJGP1rI0bqjlnsslF+gd7NXxVQ3mscKOrQa8RR9VY25jaI15j7DUapI3pFqLS3k3ZFpKKDcEfT9LnGJQK080qh8AHgCZPF6Jr3do36opP9YwfBGs0zgswqSe2Le3g=","H":"TptaYd9JwnPfxqH5LtKOKoRJVQjlxOzXtHNVfVmpT/jA52DZIfH4+IRuJlEgNrHcfSMsQnzQu/fQOWUk1MtyJLykc/80e5jW+6s6kuJTLgmwkSXvyKpBSvLtKIfpMVHfgCJO6dfhHVimO/cSJ1OKtvaG3Gr344UwGni3HwM4tJ4=","T":"OGD5wSRX9PHHWyRVl8Biu+a/mpx2x3hmtZpSYft6t5Y6zeJ53QEtrLW5xFlRYXKdE4+ZE0fa4mC/eeXJdlWNcI0dQB9Xw01ouJwb80ZJpy5Oz84DU35sThE+A9rU6nZFaabTp5vrwldQoZu1zuKrkvnCpucjgc2jFpJzV+PAs+g=","R":["pmYou6W/j5hWElum8rHO84jJXOgOZKkv+xtOQh4H0MNR8xUi3Iw1mRxzXlEbOOPspynfQFElHiD+odx4zzbhOOHeii8ufKSsnuOp6l1HgD2vieG1MY8PcabsEpb2cGaOsyJeZQoj6FZ6QKKFWluRXR4GLHUZ1A/keMFLI5fzHcQ=","RmzpAQrZGUvEX02HLKoM4KZMS/NhrZ4b0KHo7FHHwvYrXfBUtl7LY+IHxlSzgO+9Upw+cq1hwJFuiczrE2J0aLLd2bFG2Wh+37AOZiJUyuyOhS4EdVUvw/kzR5K3qJRhbi/ljuU0cNkfHW+SKO9YtJvcQtSQqBKuM3qd5B+QU44=","oqXOafScX1nWRRygw4uFaI5fgiO5gsyzb4DWjLSuycqP1IHY67FpXRR2YSXKv+Wzw6NacVtZ+caDwZUcb+x8SfKEOKqrGGM389MBj2uHj8uk0GDjIJogVHRpoy7mPsqjpV64iZSSYawd3CszQrZY6QvvibcVem+Hg7Hqwlfp0qw=","Ikj/07Ip14Ay0QZZfLx8Mpq1UQeZcC+MhmwEEOfFeBKOGyEciDHjUUzgJZ8ZAyF7/VCWLm3+glYZ1KIb6JQMNaAPaGAg22p0okeYi/69bGhbeDV4oZy+27LBMt74XJqxU8gaXVzG7b2Lwv0jEtbDEJjpMUVsZzPCe9yLWu77zW8=","RyRhhf7bjfY6mFO0H7o6ZeqsNUxpow4YSsi0ZG7M6ako0fytCLIXgNZy8K9Is2J9QKcwHFhkWulo3p6uil5uaJHWc6emQSXEYEMu9zugMIWmnbh28snL4CnJ9WQHXrm9LaZHfLWiwMwMv6fOE9+dsYA1Y0eUhOpxD40Rjh6qnis=","sjofIpRpJe1OegtCYU+ADPZmxseEyqN7snBywM5dGtnvPw3ShY+WTBejO1Jr+i+iL9mWq8Jw/ABj9RAmW/Xc901ED8QtQQh1WO69urDJTBywpDPx4D24sUPpVKAOLexNuf+sbIs74Omu/dX6K+/+UZoJwojVOOPyvRt3cdKyajI=","jXJelo+k9onbRmvGqVsiRfgjCmuFRmx2KdFGg4vLHMrbUmU/Jom1ox4toIsvrUrLy+5QHcIZ2t9EBsHj3ltpXFY40CdDoIgJ9KndKCojo+u6Wur7b1tCR3DfAlYiorjz0UjNbotWFhFDVPZfFh02lT8jagQ9DEv9/2+CMOpjVKQ=","PkUzNfJfz0G3rpLZPy0Icr6tmpH2ZY/clZU7GTDFHlwn4TQxxQWnyJknfY/9jk3fEwOjJARrjJO2qKN83UlcAForxIy19/TIrGNjvSCA9vJbNV5P3L3O/KswD0NOLE8MjV6p6e0QWkDeET864y3F/kHwTkFiQ3VVQ+2BP9Sofxc=","l7kOzCTLNBNn9phUbYcwUclJlcIUHqoNCRyY1j1ZsyKUNDKyLvI0ZsOE1JlnUbRAtbp1+EwrId6/DC0q7jBmy+XrETKqWQLqfWDxJd8bsYrQfu0avNvz78Qv+ZmkuDhrQNJ1MKSNBvrMvxuOQEEXHCpKD/HZUFoPCmUWqqeYVHw=","i2XT4cmtlQo+00MruNcIWfvb2IkG7sEAUya3nbFE1UFLlX4I00xt/cOAdaHyduv9Rqy81QjG6aX3I+HHwxUzEoH99pOKzYh5qWIFjy+PcQxjBkMLPYVeSoPIhP3ljw2s2dzWblkW7VToYsxTvbUwVvAxC1HILgX+AKyhtg4LkQE="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAED7eiYNhoE9gzmAYz9wYJruB2d+WUqGdU07KilWOdB3dGvi9VfTpSqKTzI7WTGb8uMPz2aROqAmwm70zu8wLBSw=="}'
)
export const claim: Record<string | number, unknown> = {
  cType: '0x39ffc33202410721743e19082986e650b4e847b85bea7eab77',
  contents: {
    id: 9007199254740993,
    picture: {
      URL: 'http://placehold.it/32x32',
      DATA: 'Ox123123123123123123DEADBEeF',
    },
    eyeColor: true,
  },
}
export const disclosedAttributes = [
  'contents.id',
  'contents.picture.DATA',
  'contents.eyeColor',
]
export const numOfClaimKeys = 5

// used in combined requests
export const claimCombined = JSON.stringify({
  cType: '0x39ffc33202410721743e19082986e650b4e847b85bea7eab77',
  contents: {
    ident: 9007199254740993,
    image: {
      URI: 'http://placehold.it/32x32',
      BINARY: 'Ox123123123123123123DEADBEeF',
    },
    eyeColour: true,
  },
})
export const disclosedAttributesCombined = [
  'contents.image.BINARY',
  'contents.ident',
]

export const chainCfg: { URIs: [string, string]; mnemonic: string } = {
  URIs: ['//Alice', '//Bob'],
  mnemonic:
    'receive clutch item involve chaos clutch furnace arrest claw isolate okay together',
}
