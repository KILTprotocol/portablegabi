package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	KeyLength = 1024
	OneYear   = (int64)(365 * 24 * 60 * 60 * 1000 * 1000 * 1000)
)

func TestNewAttester(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success)
	attester, err := NewAttester(sysParams, 10, OneYear)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)
	require.NoError(t, err)
	require.NotNil(t, attester)
	require.True(t, attester.PublicKey.RevocationSupported())
	require.True(t, attester.PrivateKey.RevocationSupported())

	privateKey := &gabi.PrivateKey{}
	publicKey := &gabi.PublicKey{}

	// Marshall and unmarshall
	bts, err := json.Marshal(attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(bts, privateKey)
	require.NoError(t, err)

	bts, err = json.Marshal(attester.PublicKey)
	require.NoError(t, err)
	err = json.Unmarshal(bts, publicKey)
	require.NoError(t, err)

	require.True(t, privateKey.RevocationSupported())
	require.True(t, publicKey.RevocationSupported())
}

func TestInitiateAttestation(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	session, message, err := attester.InitiateAttestation()
	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.NotNil(t, message)
	assert.Equal(t, session.Context, message.Context)
	assert.Equal(t, session.Nonce, message.Nonce)
}

func TestSign(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	request := &AttestedClaimRequest{}
	err = json.Unmarshal(byteAttestationRequest, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(byteAttesterSession, session)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)

	_, _, err = attester.AttestClaim(request, session, update)
	require.NoError(t, err)
}

func TestSignInvalid(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	request := &AttestedClaimRequest{}
	err = json.Unmarshal(byteAttestationRequest, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(byteAttesterSession, session)
	require.NoError(t, err)

	update := &revocation.Update{}
	err = json.Unmarshal(byteUpdate, update)
	require.NoError(t, err)

	// attester expects a different nonce, AttestationRequest should now become invalid
	session.Nonce = session.Nonce.SetUint64(999999)

	attested, witness, err := attester.AttestClaim(request, session, update)
	assert.Error(t, err)
	assert.Nil(t, attested)
	assert.Nil(t, witness)
}

func TestSignAndRevoke(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	request := &AttestedClaimRequest{}
	err = json.Unmarshal(byteAttestationRequest, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(byteAttesterSession, session)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)

	sig, witness, err := attester.AttestClaim(request, session, update)
	require.NoError(t, err)
	require.NotNil(t, sig)

	revokedUpdate, err := attester.RevokeAttestation(update, []*revocation.Witness{witness})
	require.NoError(t, err)
	require.NotNil(t, revokedUpdate)
}

func TestCreateAccumulator(t *testing.T) {
	attester := &Attester{}
	err := json.Unmarshal(byteAttester, attester)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)
	require.NotNil(t, update)

}
