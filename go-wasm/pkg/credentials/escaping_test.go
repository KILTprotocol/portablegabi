package credentials

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

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

func TestEscape(t *testing.T) {
	assert.Equal(t, "asdasd\\\\ad\\.asds", escape("asdasd\\ad.asds", []rune(`.`)[0]))
	assert.Equal(t, "asdasd\\\\\\\\\\.adasds", escape("asdasd\\\\.adasds", []rune(`.`)[0]))
}

func TestUnescape(t *testing.T) {
	assert.Equal(t, "asdasd\\ad.asds", unescape("asdasd\\\\ad\\.asds", []rune(`.`)[0]))
	assert.Equal(t, "asdasd\\\\.adasds", unescape("asdasd\\\\\\\\\\.adasds", []rune(`.`)[0]))
}
