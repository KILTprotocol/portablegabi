package credentials

import (
	"github.com/stretchr/testify/assert"
	"testing"
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
