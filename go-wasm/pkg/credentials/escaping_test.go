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

	seq := escapedSplit(a+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a, b, c}, seq)

	seq = escapedSplit(a+"\\"+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a + "\\" + Separator + b, c}, seq)

	seq = escapedSplit(a+"\\\\"+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a + "\\\\", b, c}, seq)

	seq = escapedSplit(a+"\\\\\\"+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a + "\\\\\\" + Separator + b, c}, seq)

	seq = escapedSplit(a+"\t\t\t\t"+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a + "\t\t\t\t", b, c}, seq)

	seq = escapedSplit(a+"\\t\\"+Separator+b+Separator+c, rune(Separator[0]))
	assert.Equal(t, []string{a + "\\t\\" + Separator + b, c}, seq)

	seq = escapedSplit(Separator+Separator+c+Separator, rune(Separator[0]))
	assert.Equal(t, []string{"", "", c, ""}, seq)

	seq = escapedSplit(Separator+c+Separator+Separator, rune(Separator[0]))
	assert.Equal(t, []string{"", c, "", ""}, seq)
}

func TestSeparator(t *testing.T) {
	// SEPARATOR must be exactly one char long
	require.Equal(t, 1, len([]rune(Separator)))
}

func TestEscape(t *testing.T) {
	assert.Equal(t, "asdasd\\\\ad\\.asds", escape("asdasd\\ad.asds", []rune(`.`)[0]))
	assert.Equal(t, "asdasd\\\\\\\\\\.adasds", escape("asdasd\\\\.adasds", []rune(`.`)[0]))
}

func TestUnescape(t *testing.T) {
	assert.Equal(t, "asdasd\\ad.asds", unescape("asdasd\\\\ad\\.asds", []rune(`.`)[0]))
	assert.Equal(t, "asdasd\\\\.adasds", unescape("asdasd\\\\\\\\\\.adasds", []rune(`.`)[0]))
}
