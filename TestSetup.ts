import GabiClaimer from './src/claim/GabiClaimer'
import GabiAttester from './src/attestation/GabiAttester'
import { IGabiContextNonce } from './src/types/Attestation'

export const privKey =
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"P":"j3TUnfX+Ru749PHYyjZfOsQvr6wuuCtcDna1jZiSvNAQiLu9zHbNsH1hOAjfRqhutBSJSN65c0MK1dVqo9K1+w==","Q":"94n5HwmUePijRew9oJ5FoKbMgx9uMAoDzAz3fPo6IbV9326RAsurWg5GKBVppeaYcs5SRMYAJNifUZnfE/nRjw==","PPrime":"R7pqTvr/I3d8enjsZRsvnWIX19YXXBWuBztaxsxJXmgIRF3e5jtm2D6wnARvo1Q3WgpEpG9cuaGFauq1Uela/Q==","QPrime":"e8T8j4TKPHxRovYe0E8i0FNmQY+3GAUB5gZ7vn0dENq+77dIgWXVrQcjFAq00vNMOWcpImMAEmxPqMzvifzoxw=="}'
export const pubKey =
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"N":"ircKRDgyrbg2L1WZBI9MWjz8QL3Nwwn7baxtz0yhQN8Jg62LHkrFgQOIR9IyvyxIF69Ku1VNFC8AUwm7Ggd9Bzj/YjIUuiQC4osOFLgo86Dbhfs2mXIaY3sbBm6wuvi0wuyUAvO/dgZkLM8rjrgRdSq2D/7jZLdnPErKaitokjU=","Z":"GGvSolZf14GGsMADXL9IWj1A/Ue/RcNz1mt8wldyagfRMIwIjMYv4J5E0sIuHHPaWj3qc7MvJJ6AfzX4zsO2EMunQP+gAU08AOyfhFT+J8udnDx0Fuh2lRCjIoTPti082KrcielCkRmqEYL5BZpAiI37m/dabi0woZ8nIi5U64I=","S":"NfqG8fq9iudU2Bp/w8O5Sv+dJpJY3uOxA1WnF/a80ZRxE83GgckhTf/5/clHD3/k6CbhMnzjqJd0udz0NYjs03D+hlvgLliLhaEuWGTa5BFgjCOuecHPufcFOUNeDoZqXXICg/g+qWeOV6FpBJLOp8WXudIDpk7SLlqY3SRtbrY=","R":["WXPAAtAdx1Y+q1596/T8q/20+kwNpJNc0H3dRgA1H+naCF4J3N9jCTFZjNgnJEZstxCHNhpw/NgyZyqxbk0AsFSUFWsaBAPgZkwHsCc6yKywohrunF3Sahna9ALdcOHl+bHzQyx3uFc1GmDiOPdXuIQUUcYKOoMDdbW2EbRCvqY=","eFPGceT5r70BlIJ14bQ5I5M1zLFKu8okfIfFpyPRhVHWuLciTpe0bhyhhXLv06UVu2TUNeLT0MskB7c16MeQVJ0ToN6O8qpexIAqVOX2VY5eUMPKT88liVNrAu/+lAyj/Sac+v8r+gv3Y4KO3Hiv36rk14sB4TnmTzmKYTf5Zj0=","h245+272Ee/5F8qsMog9U73JGDo8/v0DuKt/QJrSxfuu3Tpf1rvE1pgp+jiPWHfs9PkDAp4HWD4VlNxhiH2uxvjxXocGGE7naFI+M7uWrZ85Vg0ayHL3uoHP9vuwck8j7IzPO+vSQmd/N+v6SRxMYK4kM31EN49BBWzk+Bs+68E=","MDa1U56jhGayP1A7Afk3NL2vKkPzqELiYJmCzGkODgx3BEYuR8jibrsv3qzRwzMTJcldgWy3XJ/4GgL9wK9fg+uyHhezy5+WyKUC79aS7Epo4zE5VEFiCxK6KAI8AYwrnbhmdoc9nfWQlB4PhEhls5t6V8TIzIIbIzzhEUNtuZU=","f0+tsyHtvzMD40JrKU/SGaXe3m+8xMgu8IHJnzjlBZ9VCtsJMtrSpNITyGM6VognWGLQwYy8qQ66LzfPtELi6UuNmzp7NTcPbT4GF+Ho4qszxDXsFFGigZhghSViJvxwQYDw6khjjJT1s5mLMXM4NQiesxeWwN2Zd1zvv//HVwA=","cSq1ohLOaVMEpfRlFvvpYJqOBRgzTnPdmf5KdGRqqabLo/xAL23AX6o7919g4gr6dH+T+1NgX1L8ozPKOKGVJv0rwBdLnvttLK1Ay5RZmQItKiHEM9sr+8t2gpeQFpw1Y2kVN1JDwrjL2ZqKgiatg7Z5NWV594bkkqNEFCB4xV4=","DlT9g64FDgjAT0X0bA7AzZhBR0cgWaQ86HAziyF9/E2uHuM92vDtiOf98pQt6TVoeWjMBSc9PoAL7+yDa7ZWHNdj1GoTcfZdv27ZeactfFgX99DaskPeHdiPHcFgj/x1ViWNZkJ6nYrIuRIsMPL3pWt52IybMYrJASPDelGQik4="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":""}'
export const privKey2 =
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666085,"P":"kQk0UZyNT30I2LEan0DzTb5aePYmBoKV/TArXVkoC307xfEN/2bAojmDq9DJW0t60LI/eZh3u3tOwY2e13JBpw==","Q":"85ZUe1z+OW0wBF/Ro9EG9dHa8X6/VpLPeb9+71euYvPAebh6QYbjY0MaqdXieMUqY8e0ZTtGjHAKKg4uuQSSew==","PPrime":"SISaKM5Gp76EbFiNT6B5pt8tPHsTA0FK/pgVrqyUBb6d4viG/7NgURzB1ehkraW9aFkfvMw73b2nYMbPa7kg0w==","QPrime":"ecsqPa5/HLaYAi/o0eiDeujteL9fq0lnvN+/d6vXMXngPNw9IMNxsaGNVOrxPGKVMePaMp2jRjgFFQcXXIJJPQ==","ECDSA":"MHcCAQEEIAVWu6pFqs8vXmHmQwrx2e+/DqeyBmFm0iJU3C89De7NoAoGCCqGSM49AwEHoUQDQgAE2kthhJFP0rBZLklBz0Ae3yYCFlr6rqHJEKtiFA7q9F7bjCWFu9X1v1+IhAj1+xs31aiXJDmBXvcs8eP4Sx0p7Q=="}'
export const pubKey2 =
  '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666085,"N":"igDn6wiyHkz+pNqsn3ZagpVV5WT5ESNSp/pPF3nIdeFjvdI98HZc452L27mHZC+GmZgaCVv2qYdwPkyxGyRubKSFnwdWUR5GBEYmqgDpfcrb35t92yumBo+urNIsBAcMWp3Grfr0GMAdErdsLRw7LedFDw7v2IA5e3V/bWLyyT0=","Z":"LlMzqdfmhEo5HIXnHHBu0yWGEF33KeWvzgQ7SNnna8270gw/FLZzsd0RgehUWiqN8GOhyeMKGW2aDINZs1fll4PMIprikl6GQ4qGNR0/63xZ+v/crNV7lbgQwlDlWV0vktJLwa141U2o4zqtqksEauKBXIq2by/1DgaeIwFMks4=","S":"OfpACzfoninHn7P90FPiPVvLVr/Wx3pOuo6j0LrCyd4IKOGODGAdcAjc2u3wP1S1TjXsrls1U64hgYmah77c2E36KKxfjh8pGxEux/3iITdd9lC4dILi8FJb8KTrnYuBRHWpS+LFc++o4x298F/Nnz0TzCEygLfNV6NL+KI4ROs=","G":"cskuWp8FneoTT1b+3cqegyDMvIUkbxy//RdewJ1MbHOthYNwRpPbLYZ/Zp9JRGQhod22Jc7riqsYGFxNSKjXPkS/YBNyc+ZZmAayiTfyTNCevsXkEAhn7U0qcxhM54sGJOkly8NCuhCbm6yCHaKAu/I3VmpjbV5jETYXQewx9Hk=","H":"GeITlSj/S6mTuCFTMfsS38LKntR/Ax22Trr3i1X6SwN+tmhn1W2iWkctaLBt5KETc0shJCP0iVZIh8ZHJkaCPJ00N615PIXwmEvxMdTnE5a9Fjo8qQKFR71QAnHydDf84/U1LKZTpUM3tYfk2z+dTo1weoS0/4/lBU+b7QSTJBE=","T":"eUKoASDQchP3K/A7JqbiPF0jF6viNRKSVjh4VMWr1C9KKsAoJn3CtqfydUE5O9gy+DV0WaViU00SSY3FRWV9DLNl4F4TY76kTCbsvx+IwaxKQFslAKlHTQTxeenEhY0wMmvRbo3zg9Fck5BmHyxmimPX5ngYQ6iyZZb8/SPFnB0=","R":["hjyQn9+XPOKGzHzBDuzSFrcMl22MtmQn9yM4i4pbcfh0GMb0l1teRrqICMgGtbGX2jp/LFh/EoVsL3YSaeaGO8ylpu1WBOA+CQwkrNxQfaCQrIyZ2NIUCeymemC5SA5cdvH8ek4abENvUv1qoMFPZNqi54qOvNOQ2UKB9EZGLT4=","aWrd4qekwymDB7rn5vq8+rPcsl0QpM1bmKy/5q2lKug6i2TNRtvBFf/+85Ru2/IqGvWUGpAhDKSTspgy3gi1hH02Z7tgVSLMO3DhJk8X8rHkAMO+GgmHTNZJ8gwrtG/x89aPKzvFT/3w6JdNBCOhV7DM1L0U1GfneO3DANhaz7E=","A3G9vfAKofFnqyB7zF8hNH1yzCGt+UJF11QWAm5NT1LtXkyS4VRMXEuopQLhXZzYOBqSQ0KEv73RIoC8BR/FCMZJl99/ob/hgNA0UrOKGSsSU3ewdizYHIEiU39Jrg6xsFsMgUreOQnt4Cg6GwtMfP0+FDp8W7LySw/OQV81Imc=","R1boQd3kBteqFyHVxE0EkDVIdpxkKlu9s3D83gcWkaDKH5NDkkTmzEATndN0abXIYbT1hmcXfFyqO2TJw94i4Rvr3Zaq74keIIpifJfzbtR2XD/4eBuVOEnuXoMmoaWq05bN8Y+vMmmYYmR/YWOyM87tMdzv2lWLUKPgULJ4XUw=","ODhzHCu1CStLlFpuzdqR1ojixvm5jn7ZXeY4oa4fFSA7OF7MDgfC3VzheJaXt2X3OkpeIC88ihOTc/7GEDuI7jbD56ej7SaosdqRyyJD0VfJtzYE7I/LNPmhyyN9NpsuHnh7WAvgOp22OAHdyYGZH3eLN8kAI70g2j0Enov3Pec=","KdVAVzHxpJAnlzOGjieHG6v0ucbV+Kxje9Eta0BqsJ6U9ayNnCRqblTR6H8rYU33SD1XlUL3IEBnsyXdPGBa+xAYnTn5osJh1P76tI0YS+sgKqXezkGSpMdwAK+4OcaJ7gpj9DF5pzGLD0MCzfqP3DwNCI/V6/6q6mQjEihnbq8=","fXJBA5vik4yyhzuDQhMIGtxpMiEwlMA9uVDsAiq47q+fNkJ5GieCiQsH/+xQ9dDPT5zX8tko71qoRVD6zFgltGJGdGtqz6eBvJDom+ng3gUu2ajOZ0dqN0dLsMn25k9quWmhYg9UvUuJkjR7hixQVZ4Ae+l800nZCVtYnN5Cv4Q=","HxtVYMIjzD49moGkdne64F+y3j+PC+84tqV8jO+BobMFnY/mM4ktUgBy56xGXsgl5Mv4GTPONdeDwF4HmkZBmI3BCs3rnywXr3T8UxIO4Y1Ebuk+ehqE/TFkQsGlPif+lNSUoYd+zCFstxO9eBf53I6/7Ze2AmMfhTycJQEwtpc=","YanTtUe3pjF8GNTMMPdWfUxvp9drpEHEmT1uHgvHYtQqjQHEucHfu3fNHuMZ91k2zrODKz2E9r+XYRY7wnIx/Apn8bJSZlhYKS75YnIjNFZgg3de21CoIcCkvKaSrtY+fkIDzmHkoyOC691EYlhb7Cl5ZdpzceC+5tozmU/7axw=","Ca+aok3RlqCZXz+lrgv6q1EL7vi43cQ4rmcRC3QADuTgYkuZBk39U08uU+6qn2yZFgXna8OC7oZQWDvneResoOj/YsxQI+AladT4CDfe1kSHxGIFUzbl9tvWPNwWHdRrrhWN/DJpPBP+jzV/wzQgQE1Ei4LMAOCXqET7UPDtU6A="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2kthhJFP0rBZLklBz0Ae3yYCFlr6rqHJEKtiFA7q9F7bjCWFu9X1v1+IhAj1+xs31aiXJDmBXvcs8eP4Sx0p7Q=="}'
export const claim = {
  cType: '0x39ffc33202410721743e19082986e650b4e847b85bea7eab77...',
  contents: {
    id: 9007199254740993,
    picture: {
      URL: 'http://placehold.it/32x32',
      DATA: 'Ox123123123123123123DEADBEeF',
    },
    eyeColor: true,
  },
}
// const disclosedAttributes = ['contents.picture.DATA', 'contents.id']

export type ReqSignMsg = {
  commitMsg: {
    U: string
    n_2: string
    combinedProofs: any[]
    proofPJwt: string
    proofPJwts: string | null
  }
  values: string[]
}

export type AttesterSignSession = {
  GabiIssuer: {
    Sk: {
      XMLName: { Space: string; Local: string }
      Counter: number
      ExpiryDate: number
      P: string
      Q: string
      PPrime: string
      QPrime: string
    }
    Pk: {
      XMLName: { Space: string; Local: string }
      Counter: number
      ExpiryDate: number
      N: string
      Z: string
      S: string
      R: string[]
      EpochLength: number
      Params: { [publicParam: string]: number }
      Issuer: string
    }
    Context: string
  }
}

// interface IX extends Pick<IGabiAttestationRequest, 'session'>
export interface IClaimerSignSession {
  cb: {
    Secret: string
    VPrime: string
    VPrimeCommit: string | null
    Nonce2: string
    U: string
    UCommit: string
    SkRandomizer: string | null
    Pk: AttesterSignSession['GabiIssuer']['Pk']
    Context: string
    ProofPcomm: string | null
  }
  claim: {
    cType: string
    contents: any
  }
}

const TestSetup = async (): Promise<{
  gabiClaimer: GabiClaimer
  gabiAttester: GabiAttester
  gabiAttester2: GabiAttester
  startAttestationMsg: IGabiContextNonce
  attesterSignSession: AttesterSignSession
  reqSignMsg: ReqSignMsg
  aSignature: string
  aSignature2: string
  claimerSignSession: any // IClaimerSignSession
  startAttestationMsg2: IGabiContextNonce
  attesterSignSession2: AttesterSignSession
  reqSignMsg2: ReqSignMsg
  reqSignMsgE12: ReqSignMsg
  reqSignMsgE21: ReqSignMsg
  claimerSignSession2: any // IClaimerSignSession
  claimerSignSessionE12: any // IClaimerSignSession
  claimerSignSessionE21: any // IClaimerSignSession
  invalidSignatures: { [key: number]: string }
  invalidSigs: string[]
}> => {
  const gabiAttester = new GabiAttester(pubKey, privKey)
  const gabiAttester2 = new GabiAttester(pubKey2, privKey2)
  const gabiClaimer = await GabiClaimer.buildFromScratch()

  const {
    message: startAttestationMsg,
    session: attesterSignSession,
  } = await gabiAttester.startAttestation()
  // Claimer requests attestation
  console.warn(
    'Claimer requests attestation',
    new Date().toLocaleTimeString(),
    process.memoryUsage()
  )
  const {
    message: reqSignMsg,
    session: claimerSignSession,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })
  // Attester issues claim
  console.warn(
    'Attester issues claim',
    new Date().toLocaleTimeString(),
    process.memoryUsage()
  )
  const aSignature = await gabiAttester.issueAttestation({
    attesterSignSession,
    reqSignMsg,
  })

  // (1) Start attestation
  // Start1: Correct data (already defined in beforeEach)
  // Start2: Correct data
  console.warn(
    'Start attestation',
    new Date().toLocaleTimeString(),
    process.memoryUsage()
  )
  const {
    message: startAttestationMsg2,
    session: attesterSignSession2,
  } = await gabiAttester.startAttestation()

  // (2) Request attestation
  // Attester1: Correct (already defined in beforeEach)
  // Attester2: Correct
  console.warn(
    'Request attestation',
    new Date().toLocaleTimeString(),
    process.memoryUsage()
  )
  const {
    message: reqSignMsg2,
    session: claimerSignSession2,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E12: Incorrect data, should use startAttestationMsg2
  console.warn('E12', new Date().toLocaleTimeString(), process.memoryUsage())
  const {
    message: reqSignMsgE12,
    session: claimerSignSessionE12,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester2.getPubKey(),
  })
  // E21: Incorrect data, should use gabiAttester2.getPubKey()
  console.warn('E21', new Date().toLocaleTimeString(), process.memoryUsage())
  const {
    message: reqSignMsgE21,
    session: claimerSignSessionE21,
  } = await gabiClaimer.requestAttestation({
    startAttestationMsg: startAttestationMsg2,
    claim: JSON.stringify(claim),
    attesterPubKey: gabiAttester.getPubKey(),
  })

  console.warn(
    'Issue attestation',
    new Date().toLocaleTimeString(),
    process.memoryUsage()
  )
  // (3) Issue attestation
  const aSignature2 = await gabiAttester.issueAttestation({
    attesterSignSession: attesterSignSession2,
    reqSignMsg: reqSignMsg2,
  })
  const invalidSignatures = {
    1112_2221: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsgE12, // 12
    }),
    1122_2211: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsg2, // 22
    }),
    1222_2111: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 2
      reqSignMsg: reqSignMsg2, // 22
    }),
    1211_2122: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 1
      reqSignMsg, // 11
    }),
    1121_2212: await gabiAttester.issueAttestation({
      attesterSignSession, // 1
      reqSignMsg: reqSignMsgE21, // 21
    }),
    1221_2112: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 1
      reqSignMsg: reqSignMsgE21, // 21
    }),
    1212_2121: await gabiAttester.issueAttestation({
      attesterSignSession: attesterSignSession2, // 2
      reqSignMsg: reqSignMsgE12, // 12
    }),
  }
  console.log('SETUP DONE')
  const invalidSigs = Object.values(invalidSignatures)
  return {
    gabiClaimer,
    gabiAttester,
    gabiAttester2,
    startAttestationMsg,
    attesterSignSession,
    reqSignMsg,
    aSignature,
    aSignature2,
    claimerSignSession,
    startAttestationMsg2,
    attesterSignSession2,
    reqSignMsg2,
    reqSignMsgE12,
    reqSignMsgE21,
    claimerSignSession2,
    claimerSignSessionE12,
    claimerSignSessionE21,
    invalidSignatures,
    invalidSigs,
  }
}
export default TestSetup

export const TestSetup2 = async (): Promise<any> => {
  return new Promise(resolve => {
    return TestSetup().then(data => resolve(data))
  }).catch(e => console.error('Testsetup2: ', e))
}

async function wrapper() {
  const result = await TestSetup()
  console.log('1', new Date().toLocaleTimeString())
  await TestSetup()
  console.log('2', new Date().toLocaleTimeString())
  await TestSetup()
  console.log('3', new Date().toLocaleTimeString())
  console.log(result)
  return result
}
try {
  wrapper()
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Error ', e)
}
