package credentials

import (
	"encoding/hex"
	"encoding/json"
	"errors"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestClaimerFromSeed(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")
	bSeed, err := hex.DecodeString(seed[2:])
	require.NoError(t, err)
	secret, err := NewClaimerFromBytes(sysParams, bSeed)
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}

func TestRequestSignature(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attesterMsg := &StartSessionMsg{}
	err := json.Unmarshal(byteInitiatAttestation, attesterMsg)
	require.NoError(t, err)

	attester := &Attester{}
	err = json.Unmarshal(byteAttester, attester)
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
	session, reqMsg, err := claimer.RequestAttestationForClaim(attester.PublicKey, attesterMsg, claim)
	assert.NoError(t, err)
	assert.NotNil(t, reqMsg)
	assert.NotNil(t, session)
}

func TestBuildCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attestation := &gabi.IssueSignatureMessage{}
	err := json.Unmarshal(byteAttestationResponse, attestation)
	require.NoError(t, err)

	session := &UserIssuanceSession{}
	err = json.Unmarshal(byteAttestClaimerSession, session)
	require.NoError(t, err)

	claimer, err := NewClaimerFromBytes(sysParams, binSeed)
	require.NoError(t, err)
	cred, err := claimer.BuildCredential(attestation, session)
	assert.NoError(t, err)
	assert.NotNil(t, cred)
}

func TestBuildPresentation(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	cred := &AttestedClaim{}
	err = json.Unmarshal(byteCredential, cred)
	require.NoError(t, err)

	claimer := &Claimer{}
	err = json.Unmarshal(byteClaimer, cred)
	require.NoError(t, err)

	reqPresentation := &PresentationRequest{}
	err = json.Unmarshal(bytePresentationRequest, reqPresentation)
	require.NoError(t, err)

	presentation, err := claimer.BuildPresentation(attester.PublicKey, cred, reqPresentation)
	assert.NotNil(t, presentation)
	assert.NoError(t, err)
	assert.NotNil(t, presentation)

	emptyAttributes := []string{}
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")
	_, reqPresentation = RequestPresentation(sysParams, emptyAttributes, true, future)
	_, err = claimer.BuildPresentation(attester.PublicKey, cred, reqPresentation)
	assert.Equal(t, err, errors.New("requested attributes should not be empty"))
}

func TestBuildCombinedPresentation(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	cred := &AttestedClaim{}
	err = json.Unmarshal(byteCredential, cred)
	require.NoError(t, err)

	cred2 := &AttestedClaim{}
	err = json.Unmarshal(byteCredential2, cred2)
	require.NoError(t, err)

	claimer := &Claimer{}
	err = json.Unmarshal(byteClaimer, cred)
	require.NoError(t, err)

	reqPresentation := &CombinedPresentationRequest{}
	err = json.Unmarshal(byteCombPresentationRequest, reqPresentation)
	require.NoError(t, err)

	presentation, err := claimer.BuildCombinedPresentation(
		[]*gabi.PublicKey{attester.PublicKey, attester.PublicKey},
		[]*AttestedClaim{cred, cred2},
		reqPresentation)
	assert.NotNil(t, presentation)
	assert.NoError(t, err)
	assert.NotNil(t, presentation)
}
