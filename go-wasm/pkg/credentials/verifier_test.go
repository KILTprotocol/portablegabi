package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSetNestedValue(t *testing.T) {
	testMap := make(map[string]interface{})
	setNestedValue(testMap, "test"+SEPARATOR+"test"+SEPARATOR+"test", 1)

	v1, ok := testMap["test"]
	assert.True(t, ok, "not found")
	m1, ok := v1.(map[string]interface{})
	assert.True(t, ok, "not map")

	v2, ok := m1["test"]
	assert.True(t, ok, "not found")
	m2, ok := v2.(map[string]interface{})
	assert.True(t, ok, "not map")

	v3, ok := m2["test"]
	assert.True(t, ok, "not found")
	assert.Equal(t, 1, v3, "not found")
}

func TestSetNestedValueFailed(t *testing.T) {
	testMap := make(map[string]interface{})
	testMap["1"] = 1
	err := setNestedValue(testMap, "1"+SEPARATOR+"1", 1)
	require.Error(t, err)
}

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
	bytePresentationResponse := []byte(`{"proof":{"c":"kf3pl09twJ8fx0MLNX58jdvmFmL4ztxSx8MLvN0HFVA=","A":"WYxV5bz0BpmkGqQsJC0Est8bzZAWrUYjpLAyfKRedSH1VBc1EQhuPaPh1VWuZ0yO/FPpE9zZ7Hpq+qvgw0dNtEhj2cIKywws9EjsUVObqy6xtnWNujcCRZYPeKTY+kNPjq1t0Nahzcn9BzxPxJowJk/+8fBRneW+rWY4/WgyQPo=","e_response":"lPJali1QK7WyK4Hla8D/8gG6//LObIfyOWYluUgdWkmth2I9s2OirtJz78K6/Tdsy8VI41EhX52u","v_response":"DKOaccyZyo56+uaeg4GQ7RRQzLdgoiu6GG8Uooz0htDtrz+v+Oq+3MUwxXaXrqebwSLGT5gvX9ldOhhh50wFYd+ZfFXGGhqynNjOCPwrgdEnuQ1UWg6m2Z463d8Enx/cFrBM0ZwUdIOyVR6uQFpBDRB5gLbT03nkee5+oDpodRfINa4fb0xT8UPJDd26pjdWcQsQLeOvDC1u9U9ruoGhA8AbZ4jKeWIPQn2qdpI61/o2njo0LXBBluoYrl8W1MCLF1sgmnCzzGMzjJpUnoRh0merv+8v0kWxwLay04lXhhi0kAmFR2bn7WChEpkKGKufxz6OII0ViMr6LtFiYui/","a_responses":{"0":"qSn+GT4h16dJZ/sevwoAEIz0eR81nrqo6Y3fvFrg/shqaRlCYm0uQ0e7DGMoS5L/79xxQNtI23h9i5wZsNhmcM1UNMDXa6LPmW8=","3":"QAkghpgfit7Uh8+ailoCaxgGfJq7NNED5QFUmALSkIHkb/Fc6DKD5E0VckPvYbHI99XfVp5BEMyZ72Z3A4zVcn7yOs8YwRZFhVQ="},"nonrev_response":"BL521nsOaIFZ7MXo1L6W+NKUlwhNcuVO94g65tC7JuO5XjQNGArCXbSFpRAwBH7dXLeHKG/hdDU/J+bycU1PCA4IyHc/JoS2tA==","nonrev_proof":{"C_r":"TSjAWAB1bxySgzwSzeewmVzK4hCaXtndFlMianp2el5hXFf+baKQNCxEP9JdVWg2oXQTHNfHe+uLW7SRMk9haZW5Rtro6+lI989ciadgEg2/Vib6XUd1NJMfaxmdhf9uvfnHVgTdmFrvxmB9iYqjjcbzbc3YnGrJCjBJE56dnpM=","C_u":"U82miDtrU/9cLDm+ppf9pqO02yldnecI9SV4X6+2wJxfgpAwyxnjEa38oMpq1d7EyfP6E9Py+0byFL5Dm1yG2gSLIN+YAr/gd9aq0sL4UbRonnOZnID0kEWfAftrXoM2B6Ko+r0KhPu0ES1jDLT47cpYc811VNrvb2vq+5P2UM0=","responses":{"beta":"BsBTRyxjRucmsESY7tlVtd2yZE0hv698Ukg2X8mc9uI8FLvD66lM9ltmY35t+EJMjn/Jh7hSXSHaMsKWy+yj4zwsm5z+PQVX2EQJEn+MHxZYo2f1E2GqskHIFM+LJG28munHe7mEdU85gEF3BVf7e6YKnvyhSoAitIc23mGyHueZLV0nL3zXdvph80bkMeqQc1eZ45PAYMNZlyRfZ0cTogeuKuKBudvv7Ixa66oenSWDX1EET3tOZRo0YQOV9XANHelwANJnQuM=","delta":"9icr0Vxoi5IKJYRsmaDDzC9oP04ZCVLzKgRtsDpvmLEYo5/wB9q09wN7io8x8jm2LdzCusi5iL+C09YnDgAq1fynloHF8hZrirV5uxDys5Z9ZIVWWMG2ddxPk5Slu2MYEspB3RTJSYjMzWMhyhsZFCblXWYIgeleT8aq0a+x/RKw8SrFE08PLiJA91PFrXgMJmGOX1y9fmAlSLsJltRN/UY2WiI8s9tWppIgkAXL59PvyyGKulF0Fr4t56V5e6SUNzaUD9dicII=","epsilon":"FXblsPWjmMrD4ueCybD1w6GN7H6Ruad7SQAh9JdR1TKi3bGfY7mj+InqGIkvwjD+E/tUmeOLid1+IhkE8Dtk8Yem7CWERYq/YXje3+nXa50cFTd2M1iYnwxpHzECCuMsEAh/3UOy4e9RvnDYGrXio1P4cx4BVLJO6es8HJC5EP3g92mUHheWPcwez37gl43suQcu0Ofw05mBPI+T+3QcRgk7BD1SI5Nzfcr+gspWUZY=","zeta":"INkR5yvDLU+bxEkqA1QSUSllGylsAv2FlZbG4uMB/nz4FhMq7YxAn2TvKNEyoeuYRVWNt2oE4xD7JbQXPKlYIx+AqcfHuNfhlIbmYr8u8QQOeYg1C183w4lmKsbMCKPAg+ip+BE2sApuuNfcs0L++8MK2ToSyO6q0Ye2stgkjVfDXxE3LjzJPeD0uKShWjbsS4LerEv2C1mIWpAIWAOSglnXkJ8msPAF24dQPH+EgDU="},"sacc":{"data":"omNNc2dYu6NiTnVYgFjSjV3ByzqK/iT8ZTHxEKxGEK08yZx/cyzfNlJt602qOoR6xyv+bPzgqv6blx5uVBT7YzVhSxU6cPsHy3bXlIyINQvdwFL9sbyDRFhDmB9kMb5Pu+HQMO4asEZ0AusnEpOgBedhpYFZtdzcDJQYBps/x4V9bYn7J4ePH4nhjyjUZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEYwRAIgaU3LmXXB+2nYzI7+2v+DfmhdKqyusMDp1+kW+ufS35kCIHS/Aof8x/MHE6IG5wFeMyhcFcxROjxv+JUmxG+mI/VH","pk":0}},"a_disclosed":{"1":"QEEAAAAAAAA=","2":"ZmVtYWxl","4":"AQ==","5":"MHhERUFEQkVFRkNPRkVF"}},"attributes":[{"name":"contents.age","typename":"float"},{"name":"contents.gender","typename":"string"},{"name":"contents.name","typename":"string"},{"name":"contents.special","typename":"bool"},{"name":"ctype","typename":"string"}]}`)
	byteVerifierSession := []byte(`{"context":"bj0hhhpmQrGzI41xVvBgnA+etisUIEoEExNiw3FtXj8=","nonce":"GL/XqKTgEIf1OD/W8M6Iea5R11BwufxA6G55rKRQJP4=","reqNonRevocationProof":true,"reqMinIndex":1}`)
	bytePubK := []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610804383,"N":"hyy9ux89jUj7sJnkjcwPndBd0H94G3fJCFRJqC5av4LRmOnGvtgwjmNzMtdmrixLVXjip4VFe/4lC7ov7ZWa2Xyel++j2XhM7sj0ar8TZjLH/Na6Tg7VvA4OSWU8frwE0vn9J3E0mkE7RpFolbLM7P41dgLKx1+mONYoc/fZOd0=","Z":"hxJg4RgWdt2luMgYKkTWpyY9MyqS/IFii+o1ALrIDjFOmDwPD56zjSlWKTlufkMaRfADza9kXvCucqKJLbHAjuBXaGiaY/pwNbjAmvtloquNTlhvWNpNUix2KZrXXZSRtLyQVit3glkUu3Q0Lk/ucT7vD/4HvNOZ7M5r5q8f8io=","S":"JO0OhVzG8Z92TT+x76UaQtQ/IBmip/f2Plb8PKjREf32tZKUzy77md1cmpJN/2NU7itNKiqqwNefeR6t7w3tqIr1alYXL6q9A8xV0tPCaBLgzYQpSrovOyambbHJoMWD2sfulOsWMVfPmQXYOJV0Lxw0Vl+HOjChF65QEtO/ZzM=","G":"INP4YJXCtJePQWHS8UapDXK8j1oNHjUjERofGY/0B1n7suHqghD2e0rxGzHpBlJEAV9RvN2LtLhBS0uVMnVDxxcuVPExvgPJzk+nxiKCKoSRK4FikgYb1AZPW9tJwDKbncgjh0X3ucJBie5Or5enPnhVnHdlxHGZHAUvAbM1Wmk=","H":"MDWb/Ay55ua9GPgGo6HTRfsSVFoXCiQe4GBybV/TmT860AoGEL5JD6ufApq809NLTbHEwwANB7QGytU2kakwllIV0S5oGFpk6UbAkWVJzDPUi4kEmeIwIMHPqJQaXZlHUDpFWBsi61KkHw8dOkFdX30PaJHXDBY3fqqmUzzHeaQ=","T":"hFOyR7CB4f0NwrjA6gb+KoG8DH69yzX15tZDXFkGy8t5mUhGYGmT3E3h02oznWjOd1PmWIaGndDjQMi9d/jPsuNjK0hPApumfq0PIxd7c6ta6rafeomNVMbuFV0XlhcVqEXdf5vxyOAYlYTJi0P/2Ws/J3aFMkQb0eWPeFIimLc=","R":["ak8sHARY/Wiu1xOFgt6IjMzNocZ1qxy7WjXToSUzDSc5RIDNPHu+U6dT4SwPsD16bY309nR31z86AfeZ0vx+bpzhgBGW07mEPvzgEHOk8/ovREqgy9+HhvQkOcELv/9R3d6KCIb/mBw8M24x0ndEP1r2qz9OMAZidp6Nw9bOx4o=","eJc9PwTBzj90idR7fvXgPlcJ1KkQPjIrqVZnWiju441Hy3mBtozfb4RSXB1QBVkb3MvK29zeAKTnx2RuqosPLNFVIgyCFTWM8FvAIPSaUGiOjPV8ekE+wMkiT0UneuJXIzUUNJBR8bCyg1TTsCigIi16Tz5+6iWZrGxxookI990=","BB3VRnOuK5e2hCJNAehpH0PyBqKKOPkZqMgzldhOCTHmWtF0fmy1BxcK/vdwk7n8lTcMjzmm1GXxVcKdhg/+RCRQpSY8n3crz9lu/R/XG+fmo1QiP2dWihHpjvWvYy4NaJc9n8BxIwyTZL+gkceGfhnUQizfYaV3bLOFx7wrJc4=","L1KEHA5DiDCyJCR42X/jdD4zVviNhLqbR06E2xPNR4rHxecNWqsu1NFvBS2AfQ8khjpomvfe6NbqBiAxcmtSr4VOXiJeKlbahuMe+juj/HvcvPivOXtioL6IZ57+UfXO8xlFXW4DDnh5Tsab/xjkzBvQEYfsReM8awITY+kal1k=","Jho8AuI/i+RjbskwCMAWsWGyPLnR/sYt8QcK3/zMdiuaY3KMJ6fdD2NUX+PJgQco8QDVOWwKJ+IHbRkdQkatT8DymtIjMPu4f1DZllgtT/iPTJISX9HcxQyV8Y7EGLSczh/I8jkUuQACxYLygyN43LszNlKao2gObp6WTmrj//s=","KMtJPMTphQKMhzVuIp4CBNsIgJaL+5gV5RTp4MmoI0hZDx7rDcDJySai2T+7DxVsB7osn1JmHqncbTt7bRBbjOGzjq0VBH3RQFH1sQPEtqJ5SvMKHjJMXlJbC0GzgA4OTCBcXZtVxw8gnNglPbBRfQy4RBqndGF7ecLjiBBZv/g="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEQUOW89/yFRGzO2EVegaT5FV6Vb2LQHxmILtW2aLp0IUVi0OnuJjyjW/+zlccqp2U2nopvkPIpFvokOzbWcPvgg=="}`)

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
	require.True(t, ok)
	require.NoError(t, err)
	require.Contains(t, claim, "ctype")
	require.Contains(t, claim, "contents")
	require.Contains(t, claim["contents"], "age")
	require.Contains(t, claim["contents"], "gender")
	content, ok := claim["contents"].(map[string]interface{})
	require.True(t, ok)
	require.Equal(t, content["age"], 34.)
	require.Equal(t, content["gender"], "female")
}
