package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	mnemonic = "opera initial unknown sign minimum sadness crane worth attract ginger category discover"
)

var (
	byteStartSigMsg = []byte(`{"nonce":"s7eGM8Eoq1Sc3Q==","context":"6yW3tSZsLyk1SdA9sprLq4yvWDUFQvtjjg+JnfCo6HQ="}`)
	byteSigMsg      = []byte(`{"proof":{"c":"1I9bdATX3oEzsYpAZNE3xWwVOoJAPO6O32bBEjEteLk=","e_response":"BJmGvoArp14C1lyfBtHLW7uxxfkIJgsasJ5T6Kx3ktWphRvMiu/KG70QLeau0u07MTCuQT484T1CCiYcYQ4OKx2CLW3+xL1rkFPXVYRgBkpWdDNjKxoRQ5ZyH0+f+dxEizBsFaXtqBahfFuCEfPJjD9Y6hqsudWucweF8f41eaI="},"signature":{"A":"Ydw/3I3kfZ7NUbeYbb3Kvps7tGjA+QaMeaCUT0htd7Qi+hSi3qWjR6jTKq3U0awTRiATCxhv3vqHrjs0tlqCBZV5ZEsylmSNmmRz/ThGy4c7LE0pWoPH1x/94YQHESo6MrMpxwTXZQjIhp7dyd8fSLVB+UOhZL4HrGQw45abzP4=","e":"EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALzKFQAfsYxzM4MJj7fqR","v":"CP1QqrK9Q2ajC9EZ0i8PXCSF6zZuUyHgh3lFMPELbKOsEkKNR5HYBksSMFxM41ruPXf0YC9ePg0lhe6EcoFBgtYvgMwSwTz3FCrBS/m8rsVMsr85ggyUlBLWmSveksgN7jcYPhgfEn6ba8YFanLc0o7p6zqaRHLuVvlIgwIYEaT5J/OlmAnZNz6tRcjM44lAFqpq15aU86WetIZ/1aNEZmbG5oxhErpejm/v2bP4p2xL73P+Wjet4bIqtKAsgIPnA4NIpXKU48NxjDcLJ1E99Ceci87w","KeyshareP":null},"nonrev":{"u":"AanIHtZZseJD2un75NT1SWKR0ee0cjg+iEMNEjR6kTwJ7SFh2ovf3YYYYHD0S8Uw4ByVbF6rR4B2y3KhLLgKHFb0OTAT8w6G2yi56cey7bKq1B4/XuAODSXlPqqXWc6jD/VC9dMgcDtHoYZUxQaGdHgnrL34h/qYCWc2/vfuln0=","e":"Af/Z74K//6MobnbB5xRylwzrRedQ3H6PvQ==","sacc":{"data":"omNNc2dYu6NiTnVYgClRGy6x9OmGxC4znH5G5prZK3sfFOylRkBn2DOuxlTY9y2eDqdg3T5oKJrk9VavK4BqJ+JFTGwl+fb+hLeD9FTjBQWJPy+pDNly78LiKCqJPtWxu9IG2cjo1ujH/XQVuqReDQNiFRCSpChvALFukU3c2nyfuY9pWX6QtcUGYKQOZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEYwRAIgSpr8tfgCxwiX1lu6yL3y9bWFDCYoVs9YXWpKoeGwruECIFw4hBtgWBC6iiMpFdJ12IL1uoLtLPDG+E6HKwYoM3Cp","pk":0},"Updated":"0001-01-01T00:00:00Z"}}`)
	byteUserSession = []byte(`{"cb":{"Secret":"onIfyirb1JJTKOvFc4qMov6os2UdxyQwdRMkQl0Va5c=","VPrime":"Mj33SpWqiiX8nystJgrGUE3yKnzsTNbl2Ew5LGFvmw3J7aekC3/vE4P6HqlCJLBPCi3ksRlb1UY1EzIPEd6hQtgz4JAU0tl1i/lzLntvkBLnXd+aMXtMXQJbOrG0sU8IGVijikWdQ42AQ91XjlA5CNbazSDtQBKkx7m0h0KHWudSYJrArLs2iRm/","VPrimeCommit":null,"Nonce2":"nTqsoSLjxwzGfg==","U":"gCSi91WURh6LaTPZKcYXfVzcrUM1mrVgP2HhxdHBQnVka9/7IPHmLG9IqHTNLIWQjwbfNSNRc0Qrv4gQEsbfHMROWFXFaXO6oXNlUyJsZJ1yHE7ChXccxpI8LOlGWyPBPAsU/MG2NTDZR4FhscE71p9su1MCK5vC8dF2Lp3gWJ0=","UCommit":"AQ==","SkRandomizer":null,"Pk":{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1611327166,"N":"g3gmc0wLonnGSU/7F/gjm3nlPk3zOXQUKsPLlgqW6nQmp/oa6UHkP4NFROHPm8Jk80rKGlWx/hfaRElDSzBVSQ+vv3v9oTsC4AE/2dTZ2EzhS3DVPfARfuFsPphv20tUQXqmXiECxiL20+ZR8iK/A54evnXHtScJchdM88QnJ1U=","Z":"dLm4b8HFf9yRCZcycHeISsht74QFWWd2Fcq8ndf5KWzlCPnHOuIpwGWa7G5ioPkJOFKSSG+9WW1EL+kTVnqd4bZEV/QC8kzY7HcbnE+8YThDde1tj+Uh/erV4ejPav2B/8Iwx7pWrNyY6srhZcAnJ3ct4pZxjpWsidYWeBeMZLE=","S":"Z5QqW4NMZvgG3+KgfsCJNxHM1w+uQzOHTWa91I25wkPdL/Kl9+lVOM0/U5l7BYDGDmPIe4O3vimZsgWggmFTbJqmVEZR1SkCONQqoDvB1CZby4G2NvrNbD5LwhUaqyjaoyxnjzSQeLp51EtvVSK5g+bXjWxxXnuMawjKLNLGpaw=","G":"dXTJQ1fKPXL6CvOkc/0bLLOx4tJbJ2QJXW4lav/b8efoYUsgIEZvxpt0ffPSK2gMpuIY/hknkvpVkyeovQyKG5R72W1dQj1OVTLe8JaZuULPOu1XSU7xShTb9pCXXDyAFVrnHO9NiCLb1SHpROTZXAbP2+IIVITYxisjmzEhkis=","H":"Wjj/mNb3yqkPlC6ctdlXCCsIK7tYrqQTTwqeK6RReZj28OqmyMHGW/qMBxzZQ96J63dlDDk02DJ9VtOfvj3/ZctlRdKdm0hlqc1v3FNgS2/jxM61xYKPn03tXAstBmSUk8urZO1jwyhUcpBiofLYVVcdq/fvbX4vk3Q6wFWthUE=","T":"djPZ8N+1iQh3rgOrRuFh9SmRRGPs3Wb8s21570rLPxq3tXVqD6rEet+cbeavZmaN9TCj+jJO3XH7G1gWdCR8G+CimJh4qolJ1N5BO13CX814KM5uzAxA8sK8fWMevsCzUOJtSVP/p1CXBd7m30xWfnF35uSL01WnnywaF+k0VQw=","R":["ZachH9LVzrV9ynbJbx4yCndGUuIPC946xqKHw6lUqc3AIm9AcezZlsb29Z4hkG/t/N6h1dsLFLCZXos0NkvEKUd5FhUQ2RL0Gq8l/mAK/bOUv0Om3blzWmkOZLp2W00sIxblNSGV0WxzgLsu6gIUIwTzr9XNulNIkPNJ9BDJo8g=","CPqrlPcnGN8zdGETlaGeElXCjzG9+Z9FJ2BJI+f+5Vgky3IHUDnVTmqmaZkKi6Fwxa/DJE9F3WF2RaEqXtzoBerp5CH95IMYyFY2ONkFGzExdbj5TCaZqJ4i/hM/ecozXUHpQRG0/LTd8dieLXMqDwUxSGOnrw6ws4Gq/8IuWt4=","IYc66imeom1EA9x+lLt0DVMfkF3RvuC2mIyCF3WopkufdWhs/lc/USrkPBEg3kA6aROAXMDwb4tS/64RIe5u3Qh8K2n5wDTXxNGdj4N/dTwueRty20dq+XR8zyzJC5FcMrvEYSshG+wQ1Ske1BQZ8khncxE+omXoWIbsgQkFxKE=","dpeCKLimn5s+cRe6bGZmlgFhiql3rsd4EIN3N1NPUjHm+1oIKa6P0XVbZKY23PyLKIYxf8bLZ97AS/J76TKYExvXOPJYa0G8OEUCf31fUDg9VneHGAceRIO0z8oE7uZvd0q/IFhfcgoh8b1zN14QXAj7UKQJrAUUFPBXlJ4DhDs=","PviypJdPCQ07lMh8OpLPQxC4Z4IdDmqSBxr/nBaz+q1a1wTYGbNMcZ0dq/IPqAlu9lgW0v79NBWqpwppZobcouzd30Zjx9FUjeWpDlI+Q2MsLWCiINHC1sXl/GpbNDY+F+Skv3blwrxB+kkbWsBmUNv4BrN2QhUl6cNu4iUefuw=","JHLa92U8y3XeuKB+sscDgmuXGi141BhLEKYR7uaUszUzjmawizVAiJ94Q0oDkdw99HTndIdx6G5CAFxhXZltq5h/f34UbysIxxoL98GqucWcMrx3EqqpvQTZNaLsbegVZr6sr0dx45MlOCuxXPiLdz/i5X4bxfWxWmm2p7jFLDw="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIZD3jGh+Zmh8FkY81att8iDrqgqx0b4i8rvh7NxQGarcXknN4Qv6MDTs2SgwKHyoKeX+FADbmLb98FGoV1iGHQ=="},"Context":"6yW3tSZsLyk1SdA9sprLq4yvWDUFQvtjjg+JnfCo6HQ=","ProofPcomm":null},"claim":{"contents":{"age":34,"gender":"female","name":[{"a":1,"b":2},2,3],"special":true},"ctype":"0xDEADBEEFCOFEE"}}`)
	byteCredentials = []byte(`{"credential":{"signature":{"A":"Ydw/3I3kfZ7NUbeYbb3Kvps7tGjA+QaMeaCUT0htd7Qi+hSi3qWjR6jTKq3U0awTRiATCxhv3vqHrjs0tlqCBZV5ZEsylmSNmmRz/ThGy4c7LE0pWoPH1x/94YQHESo6MrMpxwTXZQjIhp7dyd8fSLVB+UOhZL4HrGQw45abzP4=","e":"EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALzKFQAfsYxzM4MJj7fqR","v":"CP1QqrK9Q2ajC9EZ0i8PXCSF6zZuUyHgh3lFMPELbKOsEkKNR5HYBksSMFxM41ruPXf0YC9ePg0lhe6EcoFBgtYvgMwSwTz3FCrBfjez+Vr3POU2ITfBuh2c6XnQvUT6Ow3+FmRYPuALBtPPWBqA3g7Y/r6UYxwwe6mXjS/8wr5U/TnaqzvoSR1OiKEAxBlU6YPgY5AIIiEORJlnM4Lel+ITQ468TWwTP7738wycMbHpMwF+nhUFcAJjvXcHTaTUQ5XtbSxJawX45x5dh+v+oOLTFOiv","KeyshareP":null},"attributes":["onIfyirb1JJTKOvFc4qMov6os2UdxyQwdRMkQl0Va5c=","/wAAAAAAAAAMY29udGVudHMuYWdlAAAAAAAAAAVmbG9hdAAAAAAAAAAIQEEAAAAAAAA=","/wAAAAAAAAAPY29udGVudHMuZ2VuZGVyAAAAAAAAAAZzdHJpbmcAAAAAAAAABmZlbWFsZQ==","/wAAAAAAAAANY29udGVudHMubmFtZQAAAAAAAAAFYXJyYXkAAAAAAAAAFP9beyJhIjoxLCJiIjoyfSwyLDNd","/wAAAAAAAAAQY29udGVudHMuc3BlY2lhbAAAAAAAAAAEYm9vbAAAAAAAAAABAQ==","/wAAAAAAAAAFY3R5cGUAAAAAAAAABnN0cmluZwAAAAAAAAAPMHhERUFEQkVFRkNPRkVF"],"nonrevWitness":{"u":"AanIHtZZseJD2un75NT1SWKR0ee0cjg+iEMNEjR6kTwJ7SFh2ovf3YYYYHD0S8Uw4ByVbF6rR4B2y3KhLLgKHFb0OTAT8w6G2yi56cey7bKq1B4/XuAODSXlPqqXWc6jD/VC9dMgcDtHoYZUxQaGdHgnrL34h/qYCWc2/vfuln0=","e":"Af/Z74K//6MobnbB5xRylwzrRedQ3H6PvQ==","sacc":{"data":"omNNc2dYu6NiTnVYgClRGy6x9OmGxC4znH5G5prZK3sfFOylRkBn2DOuxlTY9y2eDqdg3T5oKJrk9VavK4BqJ+JFTGwl+fb+hLeD9FTjBQWJPy+pDNly78LiKCqJPtWxu9IG2cjo1ujH/XQVuqReDQNiFRCSpChvALFukU3c2nyfuY9pWX6QtcUGYKQOZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEYwRAIgSpr8tfgCxwiX1lu6yL3y9bWFDCYoVs9YXWpKoeGwruECIFw4hBtgWBC6iiMpFdJ12IL1uoLtLPDG+E6HKwYoM3Cp","pk":0},"Updated":"0001-01-01T00:00:00Z"}},"claim":{"contents":{"age":34,"gender":"female","name":[{"a":1,"b":2},2,3],"special":true},"ctype":"0xDEADBEEFCOFEE"}}`)
)

func TestClaimerFromMnemonic(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")
	secret, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}

func TestRequestSignature(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attesterMsg := &StartSessionMsg{}
	err := json.Unmarshal(byteStartSigMsg, attesterMsg)
	require.NoError(t, err)

	publicKey := &gabi.PublicKey{}
	err = json.Unmarshal(attesterPubKey, publicKey)
	require.NoError(t, err)

	claim := &Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"gender":  "female",
			"special": true,
		},
	}

	claimer, err := NewClaimer(sysParams)
	require.NoError(t, err)
	session, reqMsg, err := claimer.RequestAttestationForClaim(publicKey, attesterMsg, claim)
	assert.NoError(t, err)
	assert.NotNil(t, reqMsg)
	assert.NotNil(t, session)
}

func TestBuildCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attestation := &gabi.IssueSignatureMessage{}
	err := json.Unmarshal(byteSigMsg, attestation)
	require.NoError(t, err)

	session := &UserIssuanceSession{}
	err = json.Unmarshal(byteUserSession, session)
	require.NoError(t, err)

	claimer, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	require.NoError(t, err)
	cred, err := claimer.BuildCredential(attestation, session)
	assert.NoError(t, err)
	assert.NotNil(t, cred)
}

func TestBuildUpdateCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")
	claimer, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	require.NoError(t, err, "could not create claimer secret")

	publicKey := &gabi.PublicKey{}
	err = json.Unmarshal(attesterPubKey, publicKey)
	require.NoError(t, err)

	sigMsg := &gabi.IssueSignatureMessage{}
	err = json.Unmarshal(byteSigMsg, sigMsg)
	require.NoError(t, err)

	userSession := &UserIssuanceSession{}
	err = json.Unmarshal(byteUserSession, userSession)
	require.NoError(t, err)

	cred, err := claimer.BuildCredential(sigMsg, userSession)
	assert.NoError(t, err, "Could not request attributes")
	assert.NotNil(t, cred)
}
