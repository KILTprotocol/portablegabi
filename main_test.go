package main

import (
	"fmt"
	"testing"

	"github.com/KILTprotocol/portablegabi/pkg/credentials"
	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
)

// KeyLength sets the length of the used keys. Possible values are 1024, 2048, 4096
const KeyLength = 1024

const OneYear = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000

func TestCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")

	issuer, err := credentials.NewIssuer(sysParams, 6, OneYear)
	assert.NoError(t, err, "Error in attester key generation")

	user, err := credentials.NewUser(sysParams)
	assert.NoError(t, err, "Error in user key generation")

	claim := &credentials.Claim{
		CType: "0xDEADBEEFCOFEE",
		Contents: map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"name":    "Berta",
			"gender":  "female",
			"special": true,
		},
	}

	attributes := claim.ToAttributes()
	assert.Equal(t, len(attributes), 5, "Expected 6 attributes")

	issuerSession, startSignMsg, err := issuer.StartSigningSession()
	assert.NoError(t, err, "Could not start signing session")

	userSession, reqAttestMsg, err := user.RequestSignatureForClaim(issuer.PublicKey, startSignMsg, claim)
	assert.NoError(t, err, "Could not request signature")

	sigMsg, err := issuer.AttestClaim(reqAttestMsg, issuerSession)
	assert.NoError(t, err, "Could not create signature")

	cred, err := user.BuildAttestedClaim(sigMsg, userSession)
	assert.NoError(t, err, "Could not request attributes")

	requestedAttr := [4]string{"ctype", "contents.age", "contents.special", "contents.gender"}
	verifierSession, reqAttrMsg := credentials.RequestAttributes(sysParams, requestedAttr[:])
	disclosedAttr, err := user.RevealAttributes(issuer.PublicKey, cred, reqAttrMsg)
	assert.NoError(t, err, "Could not disclose attributes")

	attr, err := credentials.VerifyPresentation(issuer.PublicKey, disclosedAttr, verifierSession)
	assert.NoError(t, err, "Could not verify attributes")
	assert.Equal(t, claim.Contents["age"], attr["contents.age"])
	assert.Equal(t, claim.CType, attr["ctype"])
	assert.Equal(t, claim.Contents["gender"], attr["contents.gender"])
	assert.Equal(t, claim.Contents["special"], attr["contents.special"])
	assert.Nil(t, attr["contents.name"])
}
