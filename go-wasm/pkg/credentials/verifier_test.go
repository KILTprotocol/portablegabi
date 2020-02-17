package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRequestPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	disclosedAttr := []string{"contents.special", "ctype"}
	session1, msg1 := RequestPresentation(sysParams, disclosedAttr, true, earlier)
	require.NotNil(t, msg1)
	require.NotNil(t, session1)
	require.Equal(t, msg1.Nonce, session1.Nonce)
	require.Equal(t, msg1.Context, session1.Context)
	require.Equal(t, msg1.PartialPresentationRequest.RequestedAttributes, disclosedAttr)

	// nonce should be random
	_, msg2 := RequestPresentation(sysParams, disclosedAttr, true, earlier)
	require.NotEqual(t, msg1.Nonce, msg2.Nonce)
}

func TestRequestCombinedPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	disclosedAttrs := []PartialPresentationRequest{
		PartialPresentationRequest{
			RequestedAttributes:   []string{"contents.special", "ctype"},
			ReqNonRevocationProof: true,
			ReqUpdateAfter:        earlier,
		},
		PartialPresentationRequest{
			RequestedAttributes:   []string{"contents.age", "ctype"},
			ReqNonRevocationProof: false,
			ReqUpdateAfter:        earlier,
		},
	}
	session1, msg1 := RequestCombinedPresentation(sysParams, disclosedAttrs)
	require.NotNil(t, msg1)
	require.NotNil(t, session1)
	require.Equal(t, msg1.Nonce, session1.Nonce)
	require.Equal(t, msg1.Context, session1.Context)

	// nonce should be random
	_, msg2 := RequestCombinedPresentation(sysParams, disclosedAttrs)
	require.NotEqual(t, msg1.Nonce, msg2.Nonce)
}

func TestVerifyPresentation(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	update := &revocation.Update{}
	err = json.Unmarshal(byteUpdate, update)
	require.NoError(t, err)

	presentationResponse := &PresentationResponse{}
	err = json.Unmarshal(bytePresentationResponse, presentationResponse)
	require.NoError(t, err)

	verifierSession := &VerifierSession{}
	err = json.Unmarshal(byteVerifierSession, verifierSession)
	require.NoError(t, err)

	ok, claim, err := VerifyPresentation(attester.PublicKey, update.SignedAccumulator,
		presentationResponse, verifierSession)
	assert.True(t, ok)
	require.NoError(t, err)
	require.NotNil(t, claim)
	require.Contains(t, claim, "contents")
	content, ok := claim["contents"].(map[string]interface{})
	require.True(t, ok)
	assert.Contains(t, content, "age")
	assert.Contains(t, content, "gender")
	assert.Equal(t, content["age"], 34.)
	assert.Equal(t, content["gender"], "female")
}

func TestVerifyCombinedPresentation(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	update := &revocation.Update{}
	err = json.Unmarshal(byteUpdate, update)
	require.NoError(t, err)

	presentationResponse := &CombinedPresentationResponse{}
	err = json.Unmarshal(byteCombPresentationResponse, presentationResponse)
	require.NoError(t, err)

	verifierSession := &CombinedVerifierSession{}
	err = json.Unmarshal(byteCombVerifierSession, verifierSession)
	require.NoError(t, err)

	ok, claims, err := VerifyCombinedPresentation([]*gabi.PublicKey{
		attester.PublicKey,
		attester.PublicKey,
	}, []*revocation.SignedAccumulator{
		update.SignedAccumulator,
		update.SignedAccumulator,
	}, presentationResponse, verifierSession)
	assert.True(t, ok)
	require.NoError(t, err)
	require.NotNil(t, claims)
}

func TestVerifyCombinedPresentationLessKeys(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	update := &revocation.Update{}
	err = json.Unmarshal(byteUpdate, update)
	require.NoError(t, err)

	presentationResponse := &CombinedPresentationResponse{}
	err = json.Unmarshal(byteCombPresentationResponse, presentationResponse)
	require.NoError(t, err)

	verifierSession := &CombinedVerifierSession{}
	err = json.Unmarshal(byteCombVerifierSession, verifierSession)
	require.NoError(t, err)

	ok, claims, err := VerifyCombinedPresentation([]*gabi.PublicKey{attester.PublicKey},
		[]*revocation.SignedAccumulator{
			update.SignedAccumulator,
		}, presentationResponse, verifierSession)
	assert.False(t, ok)
	require.NoError(t, err)
	require.Nil(t, claims)
}
