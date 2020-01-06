package credentials

import (
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
)

const mnemonic = "opera initial unknown sign minimum sadness crane worth attract ginger category discover"

func TestClaimerFromMnemonic(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[1024]
	assert.True(t, success, "Error in sysparams")
	secret, err := ClaimerFromMnemonic(sysParams, mnemonic)
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}
