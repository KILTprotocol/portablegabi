package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRequestPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	disclosedAttr := []string{"contents.special", "ctype"}
	session1, msg1 := RequestPresentation(sysParams, disclosedAttr, true, 1)
	require.NotNil(t, msg1)
	require.NotNil(t, session1)
	require.Equal(t, msg1.Nonce, session1.Nonce)
	require.Equal(t, msg1.Context, session1.Context)
	require.Equal(t, msg1.PartialPresentationRequest.RequestedAttributes, disclosedAttr)

	// nonce should be random
	_, msg2 := RequestPresentation(sysParams, disclosedAttr, true, 1)
	require.NotEqual(t, msg1.Nonce, msg2.Nonce)
}

func TestRequestCombinedPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	disclosedAttrs := []PartialPresentationRequest{
		PartialPresentationRequest{
			RequestedAttributes:   []string{"contents.special", "ctype"},
			ReqNonRevocationProof: true,
			ReqMinIndex:           1,
		},
		PartialPresentationRequest{
			RequestedAttributes:   []string{"contents.age", "ctype"},
			ReqNonRevocationProof: false,
			ReqMinIndex:           1,
		},
	}
	session1, msg1 := RequestCombinedPresentation(sysParams, disclosedAttrs)
	require.NotNil(t, msg1)
	require.NotNil(t, session1)
	require.Equal(t, msg1.Nonce, session1.Nonce)
	require.Equal(t, msg1.Context, session1.Context)

	// nonce should be random
	_, msg2 := RequestCombinedPresentation(sysParams, disclosedAttrs)
	require.NotEqual(t, msg1.Nonce, msg2.Nonce)
}

func TestVerifyPresentation(t *testing.T) {
	bytePresentationResponse := []byte(`{"proof":{"c":"fKzT10A8L3TxppRUYA466RwszPbpPTefkWHmlDTSWms=","A":"eA6WqGi1UsfDdpAg4A2Y3FGF8oChS/S5h08liiRa8FcwZhKmeOnyapo4ynNexNqqEJx2oF6rSwHpgCsu9vWvobOcQzF+86BCgl+PPYuXYa+eW+W/7Ebl0/rnQvcAagJmuvvYcos+Y1FAsCARsHtdXWGXAZ8B0NhiI35gXc86nRE=","e_response":"UHYkCaPC+estNJJm7RDPnpRWm0f+BN0mWllLtdoniQZjdrG8n6PFbawlP5Ip5cRmgwqx40G633PE","v_response":"DFwaLUnmXi1iooy/z/AIHExSZsTromKSMS5phblBilCOmrITPt+OFjSF3766R1EMmBtCXBAoKBD4dc7MsysVo7cX4wrbBzn/sqzPX8uVAz+rREqitwLYtSaHYMaD6A614qopdZ+StRMpFo25JYZSCibcPCaEpK3nGwFvz/PHhvt/am5ZxBLpQdtO3grOpm5NEGQlDIe7XZYnQuRRUYZU6UWAsEX6QvH6BaJCBiqn1Q9CdMiAWlrzUCFHGVqSfSECm/czp9l+cOwrqaK5ZWwqox6oWgn0OebUQ+ICCt0y+NrowXMfg5FZ/dDEzV+V728mSmFP72RzSLe3cwjrSHdb","a_responses":{"0":"2TxsQxP9oK3gyjN4/bTxNUEJwNrKsHeJGISDzjp3l8oYs2/TOho+SbA4TXSXAKYdHCfRutl7ZfruS1Znh3O02DJ9KCrgkfg5CQo=","5":"ZnGJ9nxFJspJhcREhJjzSL60z58Gr7WU0tP0nEpPL8t+jkGRCIrW9JhqQWt6mRb2qQSQvZNNY4lSU1swzxVMp6TY4/kK3sZzN6Q="},"nonrev_response":"A7PWtLUjYz6eVj5ls5UMT2jzPGPx2hBqfGk3JZmPCcwSzDPmVbYDt+LIzWruHkmCCB+cOZProwXyYjlTqgHXii6iTemxJjx0/A==","nonrev_proof":{"C_r":"WniQjSIfNAXrTF2k95eD84pl0DM9uMRmowcx7UiawMSALm9/VSqL5GBtlecLP18LrTJN8sR6tPL0TEhLt3QRaPTehD9grJn1rqu3XNGUE16CrzM8Wabl5F5Vt2qxNpteG35tyKFihwwN5TIN035OEg39cgIfc//eHrTBlapsrKE=","C_u":"U/DhHaT7wfdF0MhlxNAJ+BwJaE/LAJENXw+IK35E/mym/LcY4+2HplndyR4rZikbKASIOycVZ15sBE1CLR12E+D7uGOtc77PjJsmYpgudTPWNfutZJEQfkw3Tqk+hk6JAgJhITwsdSsJ6Iq6op+v2b8bRYCw8p5xBh88w1qOYu4=","responses":{"beta":"Xgi4R2keUAV3u7aOLaZsknO1AUlhekSnn064IzrkR8VfGaiFhHEEWGvrre3lCvH2UAZlZaiJZ0IAax38A80i0zHeKEdXnAcEQv+s6pl1rHyVKiECdtP3EuYzt8Ka+SfHNrmOAfPviZMHMUjT/9o8xXgc12PJHSv1hyTGVPxxq0lSQoCJrwjmOJ3EP9TfEXyEdjTgHhS/yr8dM1zq6KQuih7WMALUIvpKL9hd80RuQdDls/efNfWX3+Kzq2SaVPlbDWXVWRRneHg=","delta":"MV0+grQTScslaWZDIX0tW/37QTLuKtU7siATnV2KO37qAUd89SsMJ7j74wz8EWQibpvsVhi4XDY1ZYxeiwNKyGplXg6lvONTohEDzc1+m3gzDk/PK14TPWK+ApyJGLilhF8mXaNVLoe/hN+AsDVU7IV9EuWslstVHMbC+xKZWwKxVxKWp4hrW48cURxgI5itKbZsuEHBZ1xQqv2/yRfw9wzcSREf+UBS7K6V6dCy/53Iv46u6y4xqiEiNaj4ZC8Ibw6KK15Dnxk=","epsilon":"Dqd1U6lZcejzeu6DWNFaUbwPzNeqdL+6OrFq27tuQ3GIaiO+yvJ1rlNp/Zm3BnyWZUhKjY4t8qdjbwh69ZiUeooAMbQ4o3TEKlgaOrImRbjUU1QK68bVTXHYZG6UKuK62tbqO4atYn2/KsMdVVKRfbwej27d83OiLycMoJ4r62EeMky8+9vdQnCzxmMBDXERBJnPh0uVgbucWZrc3ZpL733iVgT6/H9HMO/cCmebfi0=","zeta":"BhhxQuPSMRz5yi7c2Wscoqsqfs0PpL/rPxn60ye05YPK+Fni5aF6v0ofSbwXkMWCF4ds13VQT7cQr0UOOVWwgN8UobMcHy+etGL4QgNN85W7AvRTyBVo/ICYm/hDe/XuUxa6Z6cDCaYtq307ZzwpUy6nN6+rJmuAkASMTXEMFm1JvrVF5GndQDmnYo3uf3WzWwFThhQvabLWD7dx4s+2tpHYjVN4XzSvdgbh2evkZRI="},"sacc":{"data":"omNNc2dYu6NiTnVYgClRGy6x9OmGxC4znH5G5prZK3sfFOylRkBn2DOuxlTY9y2eDqdg3T5oKJrk9VavK4BqJ+JFTGwl+fb+hLeD9FTjBQWJPy+pDNly78LiKCqJPtWxu9IG2cjo1ujH/XQVuqReDQNiFRCSpChvALFukU3c2nyfuY9pWX6QtcUGYKQOZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEYwRAIgSpr8tfgCxwiX1lu6yL3y9bWFDCYoVs9YXWpKoeGwruECIFw4hBtgWBC6iiMpFdJ12IL1uoLtLPDG+E6HKwYoM3Cp","pk":0}},"a_disclosed":{"1":"/wAAAAAAAAAMY29udGVudHMuYWdlAAAAAAAAAAVmbG9hdAAAAAAAAAAIQEEAAAAAAAA=","2":"/wAAAAAAAAAPY29udGVudHMuZ2VuZGVyAAAAAAAAAAZzdHJpbmcAAAAAAAAABmZlbWFsZQ==","3":"/wAAAAAAAAANY29udGVudHMubmFtZQAAAAAAAAAFYXJyYXkAAAAAAAAAFP9beyJhIjoxLCJiIjoyfSwyLDNd","4":"/wAAAAAAAAAQY29udGVudHMuc3BlY2lhbAAAAAAAAAAEYm9vbAAAAAAAAAABAQ=="}}}`)
	byteVerifierSession := []byte(`{"context":"9IdX3lew9qN2aBxlZysRUf9ydTxS1Gv7A8ZAF1bEXpA=","nonce":"TgcBir4IGCBnn13fqDRyPaSKKkB3MAmvcu+N7gYF3z0=","reqNonRevocationProof":true,"reqMinIndex":1}`)
	bytePubK := []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1611327166,"N":"g3gmc0wLonnGSU/7F/gjm3nlPk3zOXQUKsPLlgqW6nQmp/oa6UHkP4NFROHPm8Jk80rKGlWx/hfaRElDSzBVSQ+vv3v9oTsC4AE/2dTZ2EzhS3DVPfARfuFsPphv20tUQXqmXiECxiL20+ZR8iK/A54evnXHtScJchdM88QnJ1U=","Z":"dLm4b8HFf9yRCZcycHeISsht74QFWWd2Fcq8ndf5KWzlCPnHOuIpwGWa7G5ioPkJOFKSSG+9WW1EL+kTVnqd4bZEV/QC8kzY7HcbnE+8YThDde1tj+Uh/erV4ejPav2B/8Iwx7pWrNyY6srhZcAnJ3ct4pZxjpWsidYWeBeMZLE=","S":"Z5QqW4NMZvgG3+KgfsCJNxHM1w+uQzOHTWa91I25wkPdL/Kl9+lVOM0/U5l7BYDGDmPIe4O3vimZsgWggmFTbJqmVEZR1SkCONQqoDvB1CZby4G2NvrNbD5LwhUaqyjaoyxnjzSQeLp51EtvVSK5g+bXjWxxXnuMawjKLNLGpaw=","G":"dXTJQ1fKPXL6CvOkc/0bLLOx4tJbJ2QJXW4lav/b8efoYUsgIEZvxpt0ffPSK2gMpuIY/hknkvpVkyeovQyKG5R72W1dQj1OVTLe8JaZuULPOu1XSU7xShTb9pCXXDyAFVrnHO9NiCLb1SHpROTZXAbP2+IIVITYxisjmzEhkis=","H":"Wjj/mNb3yqkPlC6ctdlXCCsIK7tYrqQTTwqeK6RReZj28OqmyMHGW/qMBxzZQ96J63dlDDk02DJ9VtOfvj3/ZctlRdKdm0hlqc1v3FNgS2/jxM61xYKPn03tXAstBmSUk8urZO1jwyhUcpBiofLYVVcdq/fvbX4vk3Q6wFWthUE=","T":"djPZ8N+1iQh3rgOrRuFh9SmRRGPs3Wb8s21570rLPxq3tXVqD6rEet+cbeavZmaN9TCj+jJO3XH7G1gWdCR8G+CimJh4qolJ1N5BO13CX814KM5uzAxA8sK8fWMevsCzUOJtSVP/p1CXBd7m30xWfnF35uSL01WnnywaF+k0VQw=","R":["ZachH9LVzrV9ynbJbx4yCndGUuIPC946xqKHw6lUqc3AIm9AcezZlsb29Z4hkG/t/N6h1dsLFLCZXos0NkvEKUd5FhUQ2RL0Gq8l/mAK/bOUv0Om3blzWmkOZLp2W00sIxblNSGV0WxzgLsu6gIUIwTzr9XNulNIkPNJ9BDJo8g=","CPqrlPcnGN8zdGETlaGeElXCjzG9+Z9FJ2BJI+f+5Vgky3IHUDnVTmqmaZkKi6Fwxa/DJE9F3WF2RaEqXtzoBerp5CH95IMYyFY2ONkFGzExdbj5TCaZqJ4i/hM/ecozXUHpQRG0/LTd8dieLXMqDwUxSGOnrw6ws4Gq/8IuWt4=","IYc66imeom1EA9x+lLt0DVMfkF3RvuC2mIyCF3WopkufdWhs/lc/USrkPBEg3kA6aROAXMDwb4tS/64RIe5u3Qh8K2n5wDTXxNGdj4N/dTwueRty20dq+XR8zyzJC5FcMrvEYSshG+wQ1Ske1BQZ8khncxE+omXoWIbsgQkFxKE=","dpeCKLimn5s+cRe6bGZmlgFhiql3rsd4EIN3N1NPUjHm+1oIKa6P0XVbZKY23PyLKIYxf8bLZ97AS/J76TKYExvXOPJYa0G8OEUCf31fUDg9VneHGAceRIO0z8oE7uZvd0q/IFhfcgoh8b1zN14QXAj7UKQJrAUUFPBXlJ4DhDs=","PviypJdPCQ07lMh8OpLPQxC4Z4IdDmqSBxr/nBaz+q1a1wTYGbNMcZ0dq/IPqAlu9lgW0v79NBWqpwppZobcouzd30Zjx9FUjeWpDlI+Q2MsLWCiINHC1sXl/GpbNDY+F+Skv3blwrxB+kkbWsBmUNv4BrN2QhUl6cNu4iUefuw=","JHLa92U8y3XeuKB+sscDgmuXGi141BhLEKYR7uaUszUzjmawizVAiJ94Q0oDkdw99HTndIdx6G5CAFxhXZltq5h/f34UbysIxxoL98GqucWcMrx3EqqpvQTZNaLsbegVZr6sr0dx45MlOCuxXPiLdz/i5X4bxfWxWmm2p7jFLDw="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIZD3jGh+Zmh8FkY81att8iDrqgqx0b4i8rvh7NxQGarcXknN4Qv6MDTs2SgwKHyoKeX+FADbmLb98FGoV1iGHQ=="}`)

	pubK := &gabi.PublicKey{}
	err := json.Unmarshal(bytePubK, pubK)
	require.NoError(t, err)

	presentationResponse := &PresentationResponse{}
	err = json.Unmarshal(bytePresentationResponse, presentationResponse)
	require.NoError(t, err)

	verifierSession := &VerifierSession{}
	err = json.Unmarshal(byteVerifierSession, verifierSession)
	require.NoError(t, err)

	ok, claim, err := VerifyPresentation(pubK, presentationResponse, verifierSession)
	assert.True(t, ok)
	require.NoError(t, err)
	require.NotNil(t, claim)
	require.Contains(t, claim, "contents")
	content, ok := claim["contents"].(map[string]interface{})
	require.True(t, ok)
	assert.Contains(t, content, "age")
	assert.Contains(t, content, "gender")
	assert.Equal(t, content["age"], 34.)
	assert.Equal(t, content["gender"], "female")
}
