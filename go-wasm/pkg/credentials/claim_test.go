package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi/big"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSetNestedValue(t *testing.T) {
	testMap := make(map[string]interface{})
	setNestedValue(testMap, "test"+SEPARATOR+"test"+SEPARATOR+"test", 1)

	v1, ok := testMap["test"]
	require.True(t, ok, "not found")
	m1, ok := v1.(map[string]interface{})
	require.True(t, ok, "not map")

	v2, ok := m1["test"]
	require.True(t, ok, "not found")
	m2, ok := v2.(map[string]interface{})
	require.True(t, ok, "not map")

	v3, ok := m2["test"]
	require.True(t, ok, "not found")
	require.Equal(t, 1, v3, "not found")
}

func TestSetNestedValueFailed(t *testing.T) {
	testMap := make(map[string]interface{})
	testMap["1"] = 1
	err := setNestedValue(testMap, "1"+SEPARATOR+"1", 1)
	require.Error(t, err)
}

func TestReconstructClaim(t *testing.T) {
	oldClaim := &Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"a.g\\e":       34., // use float here, json will always parse numbers to float64
			"name":         "Berta",
			"special":      true,
			"likedNumbers": []interface{}{1., 2., 3.},
		},
	}
	disclosedAttr, err := oldClaim.toBigInts()
	require.NoError(t, err)
	attr := make(map[int]*big.Int)
	for i, v := range disclosedAttr {
		attr[i] = v
	}
	claim, err := claimFromBigInts(attr)
	require.NoError(t, err)
	require.Contains(t, claim, "ctype")
	require.Contains(t, claim, "contents")
	require.Contains(t, claim["contents"], "a.g\\e")
	content, ok := claim["contents"].(map[string]interface{})
	require.True(t, ok)
	require.Equal(t, 34., content["a.g\\e"])
	require.Equal(t, true, content["special"])
}

func TestReconstructClaimFailed(t *testing.T) {
	byteDisclosedAttr := []byte(`{"1":"DGNvbnRlbnRzLmFnZQAAAAAAAAAFZmxvYXQAAAAAAAAACEBBAAAAAAAA","2":"D2NvbnRlbnRzLmdlbmRlcgAAAAAAAAAGc3RyaW5nAAAAAAAAAAZmZW1hbGU=","3":"DWNvbnRlbnRzLm5hbWUAAAAAAAAABWFycmF5AAAAAAAAABNbeyJhIjoxLCJiIjoyfSwyLDNd","4":"EGNvbnRlbnRzLnNwZWNpYWwAAAAAAAAABGJvb2wAAAAAAAAAAQE="}`)

	disclosedAttr := make(map[int]*big.Int)
	err := json.Unmarshal(byteDisclosedAttr, &disclosedAttr)
	require.NoError(t, err)

	claim, err := claimFromBigInts(disclosedAttr)
	require.Error(t, err)
	require.Nil(t, claim)
}

func TestReconstructClaimArray(t *testing.T) {
	oldClaim := &Claim{
		"ctype": []interface{}{1., 2., 3.},
	}
	disclosedAttr, err := oldClaim.toBigInts()
	require.NoError(t, err)
	attr := make(map[int]*big.Int)
	for i, v := range disclosedAttr {
		attr[i] = v
	}
	claim, err := claimFromBigInts(attr)
	require.NoError(t, err)
	require.Contains(t, claim, "ctype")
	require.Equal(t, (*oldClaim)["ctype"], claim["ctype"])
}

func TestReconstructClaimFloat(t *testing.T) {
	oldClaim := &Claim{
		"ctype": 9999.9,
	}
	disclosedAttr, err := oldClaim.toBigInts()
	require.NoError(t, err)
	attr := make(map[int]*big.Int)
	for i, v := range disclosedAttr {
		attr[i] = v
	}
	claim, err := claimFromBigInts(attr)
	require.NoError(t, err)
	require.Contains(t, claim, "ctype")
	require.Equal(t, (*oldClaim)["ctype"], claim["ctype"])
}

func TestReconstructClaimString(t *testing.T) {
	oldClaim := &Claim{
		"ctype": "9999.9",
	}
	disclosedAttr, err := oldClaim.toBigInts()
	require.NoError(t, err)
	attr := make(map[int]*big.Int)
	for i, v := range disclosedAttr {
		attr[i] = v
	}
	claim, err := claimFromBigInts(attr)
	require.NoError(t, err)
	require.Contains(t, claim, "ctype")
	require.Equal(t, (*oldClaim)["ctype"], claim["ctype"])
}


func TestGetAttributeIndices(t *testing.T) {
	cred := &AttestedClaim{}
	err := json.Unmarshal(byteCredentials, cred)
	require.NoError(t, err)

	indice, err := cred.getAttributeIndices([]string{
		"ctype",
		"contents.age",
		"contents.gender",
	})
	assert.NoError(t, err)
	assert.Equal(t, []int{1, 2, 5}, indice)
}

func TestMissingAttribute(t *testing.T) {
	req := &PartialPresentationRequest{
		ReqNonRevocationProof: true,
		ReqMinIndex:           1,
		RequestedAttributes: []string{
			"ctype",
			"contents.age",
			"contents.gesdfer",
		},
	}

	cred := &AttestedClaim{}
	err := json.Unmarshal(byteUserSession, cred)
	require.NoError(t, err)

	indice, err := cred.getAttributeIndices(req.RequestedAttributes)
	assert.Error(t, err)
	assert.Nil(t, indice)
}

func TestSortRemoveDuplicates(t *testing.T) {
	sliceA := []string{"a", "c", "b"}
	sorted, unique := sortRemoveDuplicates(sliceA)
	assert.True(t, unique)
	assert.Equal(t, []string{"a", "b", "c"}, sorted)
	sorted, unique = sortRemoveDuplicates(append(sliceA, sliceA...))
	assert.False(t, unique)
	assert.Equal(t, []string{"a", "b", "c"}, sorted)
}

func TestMarshallAttribute(t *testing.T) {
	attr := Attribute{
		Name:     "alsfjölkajsdöf",
		Typename: "界a界世",
		Value:    big.NewInt(8218926378).Bytes(),
	}
	bytes, err := attr.MarshalBinary()
	require.NoError(t, err)
	buildAttr := Attribute{}
	err = buildAttr.UnmarshalBinary(bytes)
	require.NoError(t, err)
	require.Equal(t, attr, buildAttr)
}

func TestMarshallAttributeBigInt(t *testing.T) {
	attr := Attribute{
		Name:     "alsfjölkajsdöf",
		Typename: "界a界世",
		Value:    big.NewInt(8218926378).Bytes(),
	}
	bytes, err := attr.MarshalBinary()
	require.NoError(t, err)
	bInt := new(big.Int).SetBytes(bytes)
	require.Equal(t, bytes, bInt.Bytes())
	buildAttr := Attribute{}
	err = buildAttr.UnmarshalBinary(bInt.Bytes())
	require.NoError(t, err)
	require.Equal(t, attr, buildAttr)
}
