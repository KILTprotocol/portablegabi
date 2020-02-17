package credentials

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdateAttestedClaim(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	sigMsg := &gabi.IssueSignatureMessage{}
	err = json.Unmarshal(byteAttestationResponse, sigMsg)
	require.NoError(t, err)

	claimer := &Claimer{}
	err = json.Unmarshal(byteClaimer, claimer)
	require.NoError(t, err)

	cred := &AttestedClaim{}
	err = json.Unmarshal(byteCredential, cred)
	require.NoError(t, err)

	update := &revocation.Update{}
	err = json.Unmarshal(byteUpdate, update)
	require.NoError(t, err)

	err = cred.Update(attester.PublicKey, update)
	assert.NoError(t, err, "Could not request attributes")
}

func TestGetAttributeIndices(t *testing.T) {
	cred := &AttestedClaim{}
	err := json.Unmarshal(byteCredential, cred)
	require.NoError(t, err)

	indice, err := cred.getAttributeIndices([]string{
		"ctype",
		"contents.age",
		"contents.gender",
	})
	assert.NoError(t, err)
	assert.Equal(t, []int{1, 2, 5}, indice)
}

func TestGetMissingAttribute(t *testing.T) {
	req := &PartialPresentationRequest{
		ReqNonRevocationProof: true,
		ReqUpdateAfter:        time.Now().Add(time.Duration(-10000)),
		RequestedAttributes: []string{
			"ctype",
			"contents.age",
			"contents.gesdfer",
		},
	}

	cred := &AttestedClaim{}
	err := json.Unmarshal(byteCredential, cred)
	require.NoError(t, err)

	indice, err := cred.getAttributeIndices(req.RequestedAttributes)
	assert.Error(t, err)
	assert.Nil(t, indice)
}

func TestReconstructClaim(t *testing.T) {
	oldClaim := Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"a.g\\e":       34., // use float here, json will always parse numbers to float64
			"name":         "Berta",
			"special":      true,
			"likedNumbers": []interface{}{1., 2., 3.},
		},
	}
	attributes := oldClaim.ToAttributes()

	claim, err := newClaimFromAttribute(attributes)
	require.NoError(t, err)
	require.Equal(t, oldClaim, claim)
}

func TestReconstructClaimFull(t *testing.T) {
	oldClaim := Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"a.g\\e":       34., // use float here, json will always parse numbers to float64
			"name":         "Berta",
			"special":      true,
			"likedNumbers": []interface{}{1., 2., 3.},
		},
	}
	oldAttributes := oldClaim.ToAttributes()
	bigInts, err := attributesToBigInts(oldAttributes)
	require.NoError(t, err)

	attributes, err := BigIntsToAttributes(bigInts)
	require.NoError(t, err)
	claim, err := newClaimFromAttribute(attributes)
	require.NoError(t, err)
	require.Equal(t, oldClaim, claim)
}

func TestReconstructFail(t *testing.T) {
	// should fail becaise Peter is set to strange type and peter.name will try
	// to handle peter as a map[string]interface{}
	attributes := []*Attribute{
		&Attribute{
			Name:     "Peter.name",
			Typename: "string",
			Value:    []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17},
		},
		&Attribute{
			Name:     "Peter",
			Typename: "float",
			Value:    []byte{0, 1, 2, 3, 4, 5, 6, 7},
		},
		&Attribute{
			Name:     "界a界.世",
			Typename: "string",
			Value:    make([]byte, 1024*1024),
		},
	}

	claim, err := newClaimFromAttribute(attributes)
	require.Error(t, err)
	require.Nil(t, claim)
}

func TestAttributesToInts(t *testing.T) {
	attributes := []*Attribute{
		&Attribute{
			Name:     "Peter",
			Typename: "string",
			Value:    []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17},
		},
		&Attribute{
			Name:     "Peter",
			Typename: "界a界世",
			Value:    []byte{},
		},
		&Attribute{
			Name:     "界a界世",
			Typename: "string",
			Value:    make([]byte, 1024*1024),
		},
	}
	ints, err := attributesToBigInts(attributes)
	require.NoError(t, err)
	backAttributes, err := BigIntsToAttributes(ints)
	require.NoError(t, err)
	require.Equal(t, attributes, backAttributes)
}

func TestIntsToAttributeFailed(t *testing.T) {
	attributes, err := BigIntsToAttributes([]*big.Int{
		new(big.Int).SetInt64(928347502983475),
		new(big.Int).SetInt64(234),
		new(big.Int).SetInt64(928347502983475),
	})
	require.Error(t, err)
	require.Nil(t, attributes)
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

func TestUnarshallAttributeFail(t *testing.T) {
	bytes := []byte{0, 0, 0, 0, 0, 0, 0, 1, 12, 123, 123, 123, 123, 122}
	buildAttr := Attribute{}
	err := buildAttr.UnmarshalBinary(bytes)
	require.Error(t, err)
}

func TestSetNestedValue(t *testing.T) {
	testMap := make(map[string]interface{})
	setNestedValue(testMap, "test"+Separator+"test"+Separator+"test", 1)

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
	err := setNestedValue(testMap, "1"+Separator+"1", 1)
	require.Error(t, err)
}

func TestSortRemoveDuplicates(t *testing.T) {
	sliceEmpty := []string{}
	sorted, unique := sortRemoveDuplicates((sliceEmpty))
	assert.True(t, unique)
	assert.Equal(t, sliceEmpty, sorted)
	sliceA := []string{"a", "c", "b"}
	sorted, unique = sortRemoveDuplicates(sliceA)
	assert.True(t, unique)
	assert.Equal(t, []string{"a", "b", "c"}, sorted)
	sorted, unique = sortRemoveDuplicates(append(sliceA, sliceA...))
	assert.False(t, unique)
	assert.Equal(t, []string{"a", "b", "c"}, sorted)
}
