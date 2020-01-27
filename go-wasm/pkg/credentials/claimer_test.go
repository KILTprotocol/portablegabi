package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestClaimerFromMnemonic(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")
	secret, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}

func TestRequestSignature(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attesterMsg := &StartSessionMsg{}
	err := json.Unmarshal(byteStartSigMsg, attesterMsg)
	require.NoError(t, err)

	publicKey := &gabi.PublicKey{}
	err = json.Unmarshal(attesterPubKey, publicKey)
	require.NoError(t, err)

	claim := Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": Claim{
			"age":     34., // use float here, json will always parse numbers to float64
			"gender":  "female",
			"special": true,
		},
	}

	claimer, err := NewClaimer(sysParams)
	require.NoError(t, err)
	session, reqMsg, err := claimer.RequestAttestationForClaim(publicKey, attesterMsg, claim)
	assert.NoError(t, err)
	assert.NotNil(t, reqMsg)
	assert.NotNil(t, session)
}

func TestBuildCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attestation := &gabi.IssueSignatureMessage{}
	err := json.Unmarshal(byteSigMsg, attestation)
	require.NoError(t, err)

	session := &UserIssuanceSession{}
	err = json.Unmarshal(byteUserSession, session)
	require.NoError(t, err)

	claimer, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	require.NoError(t, err)
	cred, err := claimer.BuildCredential(attestation, session)
	assert.NoError(t, err)
	assert.NotNil(t, cred)
}

func TestUpdateCredential(t *testing.T) {
	publicKey := &gabi.PublicKey{}
	err := json.Unmarshal(bytePublicKey, publicKey)
	require.NoError(t, err)

	sigMsg := &gabi.IssueSignatureMessage{}
	err = json.Unmarshal(byteSigMsg, sigMsg)
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

	credR, err := claimer.UpdateCredential(publicKey, cred, update)
	assert.NoError(t, err, "Could not request attributes")
	assert.NotNil(t, credR)
}

func TestEnsureAccumulator(t *testing.T) {
	// TODO: ...
}

func TestBuildPresentation(t *testing.T) {
	// TODO: ...
}

func TestBuildCombinedPresentation(t *testing.T) {
	// TODO: ...
}
