package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi/big"
	"github.com/stretchr/testify/require"
)

func TestReconstructClaim(t *testing.T) {
	byteDisclosedAttr := []byte(`{"1":"QEEAAAAAAAA=","2":"ZmVtYWxl","4":"AQ==","5":"MHhERUFEQkVFRkNPRkVF"}`)
	byteAttr := []byte(`[{"name":"contents.age","typename":"float"},{"name":"contents.gender","typename":"string"},{"name":"contents.name","typename":"string"},{"name":"contents.special","typename":"bool"},{"name":"ctype","typename":"string"}]`)

	disclosedAttr := make(map[int]*big.Int)
	err := json.Unmarshal(byteDisclosedAttr, &disclosedAttr)
	require.NoError(t, err)

	attr := []*Attribute{}
	err = json.Unmarshal(byteAttr, &attr)
	require.NoError(t, err)

	claim, err := reconstructClaim(disclosedAttr, attr)
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

func TestReconstructClaimFailed(t *testing.T) {
	byteDisclosedAttr := []byte(`{"1":"QEEAAAA=","2":"ZmVtYWxl","4":"AQ==","5":"MHhERUFEQkVFRkNPRkVF"}`)
	byteAttr := []byte(`[{"name":"contents.age","typename":"float"},{"name":"contents.gender","typename":"string"},{"name":"contents.name","typename":"string"},{"name":"contents.special","typename":"bool"},{"name":"ctype","typename":"string"}]`)

	disclosedAttr := make(map[int]*big.Int)
	err := json.Unmarshal(byteDisclosedAttr, &disclosedAttr)
	require.NoError(t, err)

	attr := []*Attribute{}
	err = json.Unmarshal(byteAttr, &attr)
	require.NoError(t, err)

	claim, err := reconstructClaim(disclosedAttr, attr)
	require.Error(t, err)
	require.Nil(t, claim)
}
