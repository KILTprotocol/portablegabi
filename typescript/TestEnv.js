"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testEnv = {
    privKey: '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"P":"j3TUnfX+Ru749PHYyjZfOsQvr6wuuCtcDna1jZiSvNAQiLu9zHbNsH1hOAjfRqhutBSJSN65c0MK1dVqo9K1+w==","Q":"94n5HwmUePijRew9oJ5FoKbMgx9uMAoDzAz3fPo6IbV9326RAsurWg5GKBVppeaYcs5SRMYAJNifUZnfE/nRjw==","PPrime":"R7pqTvr/I3d8enjsZRsvnWIX19YXXBWuBztaxsxJXmgIRF3e5jtm2D6wnARvo1Q3WgpEpG9cuaGFauq1Uela/Q==","QPrime":"e8T8j4TKPHxRovYe0E8i0FNmQY+3GAUB5gZ7vn0dENq+77dIgWXVrQcjFAq00vNMOWcpImMAEmxPqMzvifzoxw=="}',
    pubKey: '{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"N":"ircKRDgyrbg2L1WZBI9MWjz8QL3Nwwn7baxtz0yhQN8Jg62LHkrFgQOIR9IyvyxIF69Ku1VNFC8AUwm7Ggd9Bzj/YjIUuiQC4osOFLgo86Dbhfs2mXIaY3sbBm6wuvi0wuyUAvO/dgZkLM8rjrgRdSq2D/7jZLdnPErKaitokjU=","Z":"GGvSolZf14GGsMADXL9IWj1A/Ue/RcNz1mt8wldyagfRMIwIjMYv4J5E0sIuHHPaWj3qc7MvJJ6AfzX4zsO2EMunQP+gAU08AOyfhFT+J8udnDx0Fuh2lRCjIoTPti082KrcielCkRmqEYL5BZpAiI37m/dabi0woZ8nIi5U64I=","S":"NfqG8fq9iudU2Bp/w8O5Sv+dJpJY3uOxA1WnF/a80ZRxE83GgckhTf/5/clHD3/k6CbhMnzjqJd0udz0NYjs03D+hlvgLliLhaEuWGTa5BFgjCOuecHPufcFOUNeDoZqXXICg/g+qWeOV6FpBJLOp8WXudIDpk7SLlqY3SRtbrY=","R":["WXPAAtAdx1Y+q1596/T8q/20+kwNpJNc0H3dRgA1H+naCF4J3N9jCTFZjNgnJEZstxCHNhpw/NgyZyqxbk0AsFSUFWsaBAPgZkwHsCc6yKywohrunF3Sahna9ALdcOHl+bHzQyx3uFc1GmDiOPdXuIQUUcYKOoMDdbW2EbRCvqY=","eFPGceT5r70BlIJ14bQ5I5M1zLFKu8okfIfFpyPRhVHWuLciTpe0bhyhhXLv06UVu2TUNeLT0MskB7c16MeQVJ0ToN6O8qpexIAqVOX2VY5eUMPKT88liVNrAu/+lAyj/Sac+v8r+gv3Y4KO3Hiv36rk14sB4TnmTzmKYTf5Zj0=","h245+272Ee/5F8qsMog9U73JGDo8/v0DuKt/QJrSxfuu3Tpf1rvE1pgp+jiPWHfs9PkDAp4HWD4VlNxhiH2uxvjxXocGGE7naFI+M7uWrZ85Vg0ayHL3uoHP9vuwck8j7IzPO+vSQmd/N+v6SRxMYK4kM31EN49BBWzk+Bs+68E=","MDa1U56jhGayP1A7Afk3NL2vKkPzqELiYJmCzGkODgx3BEYuR8jibrsv3qzRwzMTJcldgWy3XJ/4GgL9wK9fg+uyHhezy5+WyKUC79aS7Epo4zE5VEFiCxK6KAI8AYwrnbhmdoc9nfWQlB4PhEhls5t6V8TIzIIbIzzhEUNtuZU=","f0+tsyHtvzMD40JrKU/SGaXe3m+8xMgu8IHJnzjlBZ9VCtsJMtrSpNITyGM6VognWGLQwYy8qQ66LzfPtELi6UuNmzp7NTcPbT4GF+Ho4qszxDXsFFGigZhghSViJvxwQYDw6khjjJT1s5mLMXM4NQiesxeWwN2Zd1zvv//HVwA=","cSq1ohLOaVMEpfRlFvvpYJqOBRgzTnPdmf5KdGRqqabLo/xAL23AX6o7919g4gr6dH+T+1NgX1L8ozPKOKGVJv0rwBdLnvttLK1Ay5RZmQItKiHEM9sr+8t2gpeQFpw1Y2kVN1JDwrjL2ZqKgiatg7Z5NWV594bkkqNEFCB4xV4=","DlT9g64FDgjAT0X0bA7AzZhBR0cgWaQ86HAziyF9/E2uHuM92vDtiOf98pQt6TVoeWjMBSc9PoAL7+yDa7ZWHNdj1GoTcfZdv27ZeactfFgX99DaskPeHdiPHcFgj/x1ViWNZkJ6nYrIuRIsMPL3pWt52IybMYrJASPDelGQik4="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":""}',
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
    mnemonic: 'scissors purse again yellow cabbage fat alpha come snack ripple jacket broken',
};
exports.default = testEnv;
//# sourceMappingURL=TestEnv.js.map