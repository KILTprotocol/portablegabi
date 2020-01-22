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
	byteDisclosedAttr := []byte(`{"1":"QEEAAAAAAAA=","2":"ZmVtYWxl","4":"AQ==","5":"MHhERUFEQkVFRkNPRkVF"}`)
	byteAttr := []byte(`[{"name":"contents.a\\.g\\\\e","typename":"float"},{"name":"contents.gender","typename":"string"},{"name":"contents.name","typename":"string"},{"name":"contents.special","typename":"bool"},{"name":"ctype","typename":"string"}]`)

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
	require.Contains(t, claim["contents"], "a.g\\e")
	require.Contains(t, claim["contents"], "gender")
	content, ok := claim["contents"].(map[string]interface{})
	require.True(t, ok)
	require.Equal(t, content["a.g\\e"], 34.)
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

func TestEscapedSplit(t *testing.T) {
	a := "asdfasdf"
	b := "oipoi23o"
	c := "界a界世" // hopefully not an insult!

	seq := escapedSplit(a+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a, b, c}, seq)

	seq = escapedSplit(a+"\\"+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a + "\\" + SEPARATOR + b, c}, seq)

	seq = escapedSplit(a+"\\\\"+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a + "\\\\", b, c}, seq)

	seq = escapedSplit(a+"\\\\\\"+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a + "\\\\\\" + SEPARATOR + b, c}, seq)

	seq = escapedSplit(a+"\t\t\t\t"+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a + "\t\t\t\t", b, c}, seq)

	seq = escapedSplit(a+"\\t\\"+SEPARATOR+b+SEPARATOR+c, rune(SEPARATOR[0]))
	assert.Equal(t, []string{a + "\\t\\" + SEPARATOR + b, c}, seq)

	seq = escapedSplit(SEPARATOR+SEPARATOR+c+SEPARATOR, rune(SEPARATOR[0]))
	assert.Equal(t, []string{"", "", c, ""}, seq)

	seq = escapedSplit(SEPARATOR+c+SEPARATOR+SEPARATOR, rune(SEPARATOR[0]))
	assert.Equal(t, []string{"", c, "", ""}, seq)
}

func TestSeparator(t *testing.T) {
	// SEPARATOR must be exactly one char long
	require.Equal(t, 1, len([]rune(SEPARATOR)))
}
