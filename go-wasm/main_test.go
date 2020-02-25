package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/credentials"
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	// KeyLength sets the length of the used keys. Possible values are 1024, 2048, 4096
	Mnemonic  = "opera initial unknown sign minimum sadness crane worth attract ginger category discover"
	KeyLength = 1024
	OneYear   = 365 * 24 * 60 * 60 * 1000 * 1000 * 1000
)

var (
	letterRunes     = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	attesterPrivKey = []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666344,"P":"82RNoU5p0nbTJofyadbTNA+NgLFnb7TrH8rJAwvay+JSvatXsh+bGtYF5petC5xASH8W+8W4sofDNKdAr80Zmw==","Q":"8yy+AX0L3wBSkn2KAJ85qWh7NbMYYksJ39ESqADOummuWd1JsNQOBrO0JrnLQ6hPhWVGRXo/GmM62kWNhZIjzw==","PPrime":"ebIm0Kc06Ttpk0P5NOtpmgfGwFizt9p1j+VkgYXtZfEpXtWr2Q/NjWsC80vWhc4gJD+LfeLcWUPhmlOgV+aMzQ==","QPrime":"eZZfAL6F74ApST7FAE+c1LQ9mtmMMSWE7+iJVABnXTTXLO6k2GoHA1naE1zlodQnwrKjIr0fjTGdbSLGwskR5w==","ECDSA":"MHcCAQEEIIeTtwTR0LbVtIczxUcohFY4fA17Bj5XFGFRZw5sFt8+oAoGCCqGSM49AwEHoUQDQgAEWD6TIb8Eb7noNKT87W1DiiGiXDxD7AdpYzCeuiXqnMmSF56d2S0M6+XG6zXoARHXgFnN0+H+9fpcpzgwk9KiZQ=="}`)
	attesterPubKey  = []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666344,"N":"5zK/k1ENNgaW0NXjQmWO/v0ODej1H6coPAGNsRbZeAY3LzAfhIEcc31+GYI7LXXZJivomxLs2rVdZ8hL6bOwb6CMDBfhbHhT+v+E+EnNV9qw68ocyrcw4cIx3kMvBXIeOni8lLeuC5ZQ981rvOeBjkxiWSVApvnMEIbH/FK95VU=","Z":"r2Zy+gpFJ44pOTvdjiYbKGYqZAj79JxV0+zFdOj6ZfXRAOa+KOeRBgRDRv/G+8BL0q6+qcgi2xLWmWRKnEI6vrUvkH/+G4Ta7sN1fejDI7MHP4NJavmU6ODs4PUBei9bfJDLAG5Tpe+NPj0VaC61hskyNIRBOjTRTvB48IXbcHY=","S":"QJaP9Yv3RhT6FjHtvPrdx5nAOzxSsiN3G6BxRpprjc35wod7fRtx5tqAlK2SWVeD7M3fq1K/04hZH7CYjgKb3ymn4o0qX+tgTXnNo+u1eCRabfmbdGXisU/lR5z+nllAIY0ENtcTKq0dlmV4jxjPQapw4DnWWCAPSiqeHxqLnE8=","G":"HoVUm3Jjhmn6c4qZQwVrOnw0hy3kTcZF9MXqXSxFeZn/Z6yMZBNk3YY+n8+mqyeRyMTEIq3Ns9SqNKJHvjxztXVxCAE4O2ARjJIgl6pYm0W6h3z9LHhm3NsbBiCFLdNzrFdf8v/EnMBhrf6MiOJ8iJcLU0K8BKoMFuFZtCI6sRw=","H":"1XtFjBT9Tjute9xYivSPf1bAbFlW+HyLvbajEKCWMuSt9QddeKLo63ql5gXS4QCCcC1CMQb8BdoRmuQeYfDIPnfw/cID20+nAmRPJRo6SVnbqTpu70hD+HFEOXSRqtXW7Epfq/7LDKUyuY6R0/s4OKQ4dPsq6SGtmq7UF0JKGoU=","T":"xhJUsnEzwcCexYXFt2xGWIZjCOEQru0rkJk2R2D202ikZajvjZ+/fd26utqV5EUNz2WxroNt6GResjtDsxaNyjRNCVqdB+ykJiRapKTzvP863CLMsFLWZBJa2/Oh3Z7510ARBlfGTaeMT22UTLuJ3Hk8wKzQmFN/K0na8gn/tzs=","R":["5OREh3OP7eqXU49ohCC4cfjGz+SkGfmDQGTN/NJjqK62f/ryyb3GaD9pulSSeq+WE0bAX3Q0Slje0yprWz90ptjK06SKo+IFZvssoIu/kNmi/BT0HQ5+to+91pOePwa8Xtn9K/7Tq82rv2o3UMzUMms8zR0QxrxiLt6I8ctuCso=","IqZnglVClf5B96J0VFMxz/ZNAICV1iyHfunvHUZEqnk5DG4lf06O9S8I+O7GP2vLcorJ5BWVYZUgeFU1HRP8TlQUZeNzvnrlfnV/QE20SwBO4yFK8SscbYfiBrn5XfUP94gpgrv0nQlsfJLeHEA2RYxeQPMskQU1FkR0q7ryUzA=","xwfzpphfDWwVDLS5I3+olFmZgyYAfUitBRCxrDHBzBJITVbke6SRwe6wxmvWYQEJGoxrKwsiAs8hg+MjvOeF6uLHz0qzhYKNJonL73Q2ms9ugb38jL4E5iY7MJpz5HkKGHYusJJThVURpP+SZa6ub/QvcS3asjtxaS0yzOcV8kY=","m9ASIa4oAfv63KP94GiCVG68SMa5PWQ3pfduzGTn8XlxA8RlKm9zj8efhzSXpXOnvmX3CR8KklzDqyXVwghgjWnKUolMTXU1i3dQgfnqZPUV/8gFR3SaVYjghie+AhdP3Rwma23BG9i+57Q6jmJmSJyurzVNNL6jbwCXMpmM+6o=","MfNZ2aN816Fc2GtlEy6mZm+uRjZwd49aLgyyYIVkX/tFmRhgHxOMKgBi7TOskhSZJnwhkpNZ3DvgzU8INcw93Z+1+qbQISseXWUB5anVPz0PvgSucH7/CR3gskPhK9QR8Fk/ewXpjA6YmDabBjVG9IK6T3o/8bSHeBmdYeY/+rs=","1Fwpi4Vd4ixSzZFvx89vtXJLe5WvnDuDEH1TCWOf3e2C98ZBAmICs+EWrunjv/wgCshaSXaljEjTVlD57HgXn6xVJ3uwpJKyyqRJ2iFZM1WS9slO5q3fOYY2uYsY8cgQIoRYMJxL3OHWFpA0u6UY3/bnDYmBXcVXl1U/g3D8YXc=","fpVblrzBLW/WAa2pLNyM5t8iyMy3ktW7fOXWAPXNtm3gfBqHWoogFgMoI6NgfxvdMQ19YXbS6VIZWziOikw7wCLSEhTaR6P5gK2FxOAbWTzee3rZkRbDYW5dDKJXlGUaZLbxfrd7Sz2tzPIQ6yuz0EwJNprR9y96zt+WkhDrtxA=","kLr1qew8lqXMqNX+5KBvLrn4Ot6dj7soUHOXod1A4qdv9261Q6nEQ5WZNxEr7yUjZl1g3VGOhhZlwUO+8CG7pPe70fKUpj/DohSfAnOfJ0mcScl5QZpnRJmD7Okp3DagPTu1HKE76vdniYPCeNfkurUYXypalNt+xklBWd491nM=","UekNkoT+gfrsK5Z+qabHRIfVHhuU6owO3X0ipGZWVxDTVc9Tgt2+Ms94r62sE9GmJDRMXPkptg56LHf+wxz3x+v9lUmBw3hT6XgXIg2yxHpJwntsiFV/Uibk8Ya2+K3YS93GsKBO3Z173TVl2uhwtejWTyX7MT7fBj2hj9k/mzI=","mDAETKs0AHc7mwYxXFRbdPxpKdfnuCJbIXtp7t9JK1Cd5atVdOZTY3HZrV2J1z0Wasuqrh4KNsdazpniKA++D39fDxm6jnT5A5obXAM/hrznH9Myna7cHZoxAGKKuOtOX2pTfqGLZn1zc8Xeki4/FfmUWm8/bQ2cXIIZaB0ORDA="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWD6TIb8Eb7noNKT87W1DiiGiXDxD7AdpYzCeuiXqnMmSF56d2S0M6+XG6zXoARHXgFnN0+H+9fpcpzgwk9KiZQ=="}`)

	earlier = time.Now().Add(time.Duration(-OneYear))
	future  = time.Now().Add(time.Duration(OneYear))
)

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

func buildCredential(t *testing.T, sysParams *gabi.SystemParameters, attester *credentials.Attester, claimer *credentials.Claimer, update *revocation.Update) (credentials.Claim, *credentials.AttestedClaim) {
	claim := credentials.Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"age":          34., // use float here, json will always parse numbers to float64
			"name":         "Berta",
			"special":      true,
			"likedNumbers": []interface{}{1., 2., 3.},
		},
	}

	attributes := claim.ToAttributes()
	require.Equal(t, 5, len(attributes))

	attesterSession, startSignMsg, err := attester.InitiateAttestation()
	require.NoError(t, err, "Could not start signing session")

	userSession, reqAttestMsg, err := claimer.RequestAttestationForClaim(attester.PublicKey, startSignMsg, claim)
	require.NoError(t, err, "Could not request signature")

	sigMsg, _, err := attester.AttestClaim(reqAttestMsg, attesterSession, update)
	require.NoError(t, err, "Could not create signature")

	cred, err := claimer.BuildCredential(sigMsg, userSession)
	require.NoError(t, err, "Could not request attributes")

	return claim, cred
}

func verify(t *testing.T, attester *credentials.Attester, claimer *credentials.Claimer, cred *credentials.AttestedClaim, claim credentials.Claim, latestAcc *revocation.SignedAccumulator) {
	requestedAttr := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "likedNumbers",
	}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, time.Now())
	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")

	verified, attr, err := credentials.VerifyPresentation(attester.PublicKey, latestAcc, disclosedAttr, verifierSession)
	require.True(t, verified)
	require.NoError(t, err, "Could not verify attributes")
	contents, ok := attr["contents"].(map[string]interface{})
	require.Truef(t, ok, "should be a map got: %T", contents)

	shouldContents, ok := claim["contents"].(map[string]interface{})
	require.Truef(t, ok, "should be a map got: %T", shouldContents)

	require.Equal(t, shouldContents["age"], contents["age"])
	require.Equal(t, claim["ctype"], attr["ctype"])
	require.Equal(t, shouldContents["gender"], contents["gender"])
	require.Equal(t, shouldContents["likedNumbers"], contents["likedNumbers"])
	require.Nil(t, attr["contents.name"])
}

func TestTimeConstants(t *testing.T) {
	require.True(t, earlier.Before(time.Now()))
	require.True(t, time.Now().Before(future))
}

func TestCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	claim, cred := buildCredential(t, sysParams, attester, claimer, update)

	verify(t, attester, claimer, cred, claim, update.SignedAccumulator)

	_, cred2 := buildCredential(t, sysParams, attester, claimer, update)
	verify(t, attester, claimer, cred2, claim, update.SignedAccumulator)

	update, err = attester.RevokeAttestation(update, []*revocation.Witness{cred2.Credential.NonRevocationWitness})
	require.NoError(t, err, "Could not revoke!")

	err = cred2.Update(attester.PublicKey, update)
	assert.Error(t, err, "The revoked credential should not be able to update")

	// marshal credential to ensure that credential changed after update
	btsCred, err := json.Marshal(cred)
	require.NoError(t, err)

	err = cred.Update(attester.PublicKey, update)
	require.NoError(t, err, "Could not update cred!")

	btsUpdatedCred, err := json.Marshal(cred)
	require.NoError(t, err)
	require.NotEqual(t, string(btsCred), string(btsUpdatedCred))

	// increase the accumulator index and ensure that the witness was updates!
	verify(t, attester, claimer, cred, claim, update.SignedAccumulator)
}

func TestCombinedPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester1 := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester1.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester1.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester1.PrivateKey, attester1.PublicKey)

	update1, err := attester1.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	attester2, err := credentials.NewAttester(sysParams, 6, OneYear)
	gabi.GenerateRevocationKeypair(attester2.PrivateKey, attester2.PublicKey)
	require.NoError(t, err, "Error in attester key generation")
	update2, err := attester2.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	claim, cred := buildCredential(t, sysParams, attester1, claimer, update1)
	verify(t, attester1, claimer, cred, claim, update1.SignedAccumulator)

	_, cred2 := buildCredential(t, sysParams, attester2, claimer, update2)
	verify(t, attester2, claimer, cred2, claim, update2.SignedAccumulator)

	requestedAttrs := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "likedNumbers",
	}
	requestPresentation := [2]credentials.PartialPresentationRequest{
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[:2],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[2:],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
	}
	verifierSession, reqAttrMsg := credentials.RequestCombinedPresentation(attester1.PublicKey.Params,
		requestPresentation[:])
	require.NotNil(t, verifierSession)
	require.NotNil(t, reqAttrMsg)

	combinedPresentation, err := claimer.BuildCombinedPresentation([]*gabi.PublicKey{
		attester1.PublicKey,
		attester2.PublicKey,
	}, []*credentials.AttestedClaim{cred, cred2}, reqAttrMsg)
	require.NoError(t, err)
	require.NotNil(t, combinedPresentation)

	verified, disclosedPresentations, err := credentials.VerifyCombinedPresentation(
		[]*gabi.PublicKey{attester1.PublicKey, attester2.PublicKey},
		[]*revocation.SignedAccumulator{
			update1.SignedAccumulator,
			update2.SignedAccumulator,
		}, combinedPresentation, verifierSession)
	require.NoError(t, err)
	require.True(t, verified)
	require.NotNil(t, disclosedPresentations)
	require.Equal(t, 2, len(disclosedPresentations))

	update1, err = attester1.RevokeAttestation(update1, []*revocation.Witness{
		cred.Credential.NonRevocationWitness,
	})
	require.NoError(t, err)
	verified, disclosedPresentations, err = credentials.VerifyCombinedPresentation(
		[]*gabi.PublicKey{attester1.PublicKey, attester2.PublicKey},
		[]*revocation.SignedAccumulator{
			update1.SignedAccumulator,
			update2.SignedAccumulator,
		}, combinedPresentation, verifierSession)
	require.False(t, verified)
}

func TestBigCredential(t *testing.T) {
	rand.Seed(time.Now().UnixNano())

	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create new accumulator")

	user, err := credentials.NewClaimer(sysParams)
	require.NoError(t, err, "Error in user key generation")

	claim := credentials.Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"name":    RandStringRunes(1024 * 1024),
			"gender":  "female",
			"special": true,
		},
	}

	attributes := claim.ToAttributes()
	require.Equal(t, len(attributes), 5, "Expected 6 attributes")

	attesterSession, startSignMsg, err := attester.InitiateAttestation()
	require.NoError(t, err, "Could not start signing session")

	userSession, reqAttestMsg, err := user.RequestAttestationForClaim(attester.PublicKey,
		startSignMsg, claim)
	require.NoError(t, err, "Could not request signature")

	sigMsg, _, err := attester.AttestClaim(reqAttestMsg, attesterSession, update)
	require.NoError(t, err, "Could not create signature")

	cred, err := user.BuildCredential(sigMsg, userSession)
	require.NoError(t, err, "Could not request attributes")

	requestedAttr := [2]string{"ctype", "contents" + credentials.Separator + "name"}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(sysParams, requestedAttr[:],
		true, future)
	disclosedAttr, err := user.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")
	require.NotNil(t, verifierSession, "Session must not be nil")
	require.NotNil(t, disclosedAttr, "there need to be a disclosure proof")

	_, attr, err := credentials.VerifyPresentation(attester.PublicKey, update.SignedAccumulator,
		disclosedAttr, verifierSession)
	require.NoError(t, err, "Could not verify attributes")
	require.Equal(t, claim["ctype"], attr["ctype"], "ctype changed!")

	contents, ok := attr["contents"].(map[string]interface{})
	require.True(t, ok, "should be a map")
	shouldContents, ok := attr["contents"].(map[string]interface{})
	require.True(t, ok, "should be a map")
	require.Equal(t, shouldContents["name"], contents["name"], "name changed!")
	require.Nil(t, contents["age"], "age was unwillingly disclosed")
	require.Nil(t, contents["gender"], "gender was unwillingly disclosed")
	require.Nil(t, contents["special"], "special was unwillingly disclosed")
}

// used to print a new set of json objects
func TestFullWorkflow(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester, err := credentials.NewAttester(sysParams, 6, OneYear)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)
	require.NoError(t, err, "Error in attester key generation")

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	bts, err := json.Marshal(attester)
	require.NoError(t, err)
	fmt.Printf("byteAttester    = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(update)
	require.NoError(t, err)
	fmt.Printf("byteUpdate      = []byte(`%s`)\n", string(bts))

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")
	bts, err = json.Marshal(claimer)
	require.NoError(t, err)
	fmt.Printf("byteClaimer     = []byte(`%s`)\n", string(bts))

	// Attest Claim/Build credential
	claim := credentials.Claim{
		"ctype": "0xDEADBEEFCOFEE",
		"contents": map[string]interface{}{
			"age": 34., // use float here, json will always parse numbers to float64
			"name": []interface{}{map[string]interface{}{
				"a": 1.,
				"b": 2.,
			}, 2., 3.},
			"gender":  "female",
			"special": true,
		},
	}

	attributes := claim.ToAttributes()
	require.Equal(t, len(attributes), 5)

	attesterSession, startSignMsg, err := attester.InitiateAttestation()
	require.NoError(t, err, "Could not start signing session")

	bts, err = json.Marshal(attesterSession)
	require.NoError(t, err)
	fmt.Printf("byteAttesterSession = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(startSignMsg)
	require.NoError(t, err)
	fmt.Printf("byteInitiatAttestation = []byte(`%s`)\n", string(bts))

	userSession, reqAttestMsg, err := claimer.RequestAttestationForClaim(attester.PublicKey, startSignMsg, claim)
	require.NoError(t, err, "Could not request signature")

	bts, err = json.Marshal(reqAttestMsg)
	require.NoError(t, err)
	fmt.Printf("byteAttestationRequest = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(userSession)
	require.NoError(t, err)
	fmt.Printf("byteAttestClaimerSession = []byte(`%s`)\n", string(bts))

	sigMsg, _, err := attester.AttestClaim(reqAttestMsg, attesterSession, update)
	require.NoError(t, err, "Could not create signature")

	bts, err = json.Marshal(sigMsg)
	require.NoError(t, err)
	fmt.Printf("byteAttestationResponse = []byte(`%s`)\n", string(bts))

	cred, err := claimer.BuildCredential(sigMsg, userSession)
	require.NoError(t, err, "Could not request attributes")

	bts, err = json.Marshal(cred)
	require.NoError(t, err)
	fmt.Printf("byteCredential = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(claim)
	require.NoError(t, err)
	fmt.Printf("byteClaim = []byte(`%s`)\n", string(bts))

	// Request Presentation
	requestedAttr := [4]string{
		"contents" + credentials.Separator + "name",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "gender",
	}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, future)
	bts, err = json.Marshal(verifierSession)
	require.NoError(t, err)
	fmt.Printf("byteVerifierSession = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(reqAttrMsg)
	require.NoError(t, err)
	fmt.Printf("bytePresentationRequest = []byte(`%s`)\n", string(bts))

	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")
	bts, err = json.Marshal(disclosedAttr)
	require.NoError(t, err)
	fmt.Printf("bytePresentationResponse = []byte(`%s`)\n", string(bts))

	verified, attr, err := credentials.VerifyPresentation(attester.PublicKey, update.SignedAccumulator,
		disclosedAttr, verifierSession)
	require.True(t, verified)
	bts, err = json.Marshal(attr)
	require.NoError(t, err)
	fmt.Printf("bytePresentation = []byte(`%s`)\n", string(bts))

	require.NoError(t, err, "Could not verify attributes")
	contents, ok := attr["contents"].(map[string]interface{})
	require.Truef(t, ok, "should be a map got: %T full: %+v", attr["contents"], attr)

	shouldContents, ok := claim["contents"].(map[string]interface{})
	require.Truef(t, ok, "should be a map got: %T", claim["contents"])

	require.Equal(t, shouldContents["age"], contents["age"])
	require.Equal(t, shouldContents["gender"], contents["gender"])
	require.Equal(t, shouldContents["name"], contents["name"])
	require.Equal(t, shouldContents["special"], contents["special"])
	require.Nil(t, attr["contents.name"])

	// for combined proof
	fmt.Println("\n//Combined...")
	_, cred2 := buildCredential(t, sysParams, attester, claimer, update)
	bts, err = json.Marshal(cred2)
	require.NoError(t, err)
	fmt.Printf("byteCredential2  = []byte(`%s`)\n", string(bts))

	requestedAttr2 := [2]string{
		"contents" + credentials.Separator + "name",
		"contents" + credentials.Separator + "likedNumbers",
	}
	combVerifierSession, reqCombAttr := credentials.RequestCombinedPresentation(attester.PublicKey.Params, []credentials.PartialPresentationRequest{
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttr[:],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttr2[:],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
	})
	bts, err = json.Marshal(combVerifierSession)
	require.NoError(t, err)
	fmt.Printf("byteCombVerifierSession = []byte(`%s`)\n", string(bts))

	bts, err = json.Marshal(reqCombAttr)
	require.NoError(t, err)
	fmt.Printf("byteCombPresentationRequest = []byte(`%s`)\n", string(bts))

	discloseCombCred, err := claimer.BuildCombinedPresentation([]*gabi.PublicKey{
		attester.PublicKey,
		attester.PublicKey,
	}, []*credentials.AttestedClaim{
		cred,
		cred2,
	}, reqCombAttr)
	require.NoError(t, err, "Could not disclose attributes")
	bts, err = json.Marshal(discloseCombCred)
	require.NoError(t, err)
	fmt.Printf("byteCombPresentationResponse = []byte(`%s`)\n", string(bts))

	_, attrComb, err := credentials.VerifyCombinedPresentation([]*gabi.PublicKey{
		attester.PublicKey,
		attester.PublicKey,
	}, []*revocation.SignedAccumulator{
		update.SignedAccumulator,
		update.SignedAccumulator,
	}, discloseCombCred, combVerifierSession)
	bts, err = json.Marshal(attrComb)
	require.NoError(t, err)
	fmt.Printf("byteCombPresentation = []byte(`%s`)\n", string(bts))

	fmt.Println("\n//Revocation...")
	rUpdate, err := attester.RevokeAttestation(update, []*revocation.Witness{cred2.Credential.NonRevocationWitness})
	require.NoError(t, err)
	require.NotNil(t, rUpdate)
	bts, err = json.Marshal(rUpdate)
	require.NoError(t, err)
	fmt.Printf("byteUpdateRevocation = []byte(`%s`)\n", string(bts))

}

// -------- negative tests --------

func TestMixingVerificationSessions(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	_, cred := buildCredential(t, sysParams, attester, claimer, update)

	requestedAttr := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "likedNumbers",
	}
	_, reqAttrMsg1 := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, future)
	verifierSession2, _ := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, future)
	require.NotEqual(t, reqAttrMsg1.Nonce, verifierSession2.Nonce)

	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg1)
	require.NoError(t, err, "Could not disclose attributes")

	verified, presentation, err := credentials.VerifyPresentation(attester.PublicKey,
		update.SignedAccumulator, disclosedAttr, verifierSession2)
	require.NoError(t, err)
	require.Nil(t, presentation)
	require.False(t, verified)
}

func TestForgedCombinedPresentation(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester1 := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester1.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester1.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester1.PrivateKey, attester1.PublicKey)

	update1, err := attester1.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	attester2, err := credentials.NewAttester(sysParams, 6, OneYear)
	gabi.GenerateRevocationKeypair(attester2.PrivateKey, attester2.PublicKey)
	require.NoError(t, err, "Error in attester key generation")
	update2, err := attester2.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	claim, cred := buildCredential(t, sysParams, attester1, claimer, update1)
	verify(t, attester1, claimer, cred, claim, update1.SignedAccumulator)

	_, cred2 := buildCredential(t, sysParams, attester2, claimer, update2)
	verify(t, attester2, claimer, cred2, claim, update2.SignedAccumulator)

	requestedAttrs := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "likedNumbers",
	}
	requestPresentation := [2]credentials.PartialPresentationRequest{
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[:],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[2:],
			ReqNonRevocationProof: true,
			ReqUpdatedAfter:       future,
		},
	}
	// combined request
	verifierSession, reqAttrMsg := credentials.RequestCombinedPresentation(attester1.PublicKey.Params, requestPresentation[:])
	require.NotNil(t, verifierSession)
	require.NotNil(t, reqAttrMsg)

	// split the request into two
	req1 := &credentials.PresentationRequest{
		PartialPresentationRequest: &reqAttrMsg.PartialRequests[0],
		Context:                    reqAttrMsg.Context,
		Nonce:                      reqAttrMsg.Nonce,
	}

	req2 := &credentials.PresentationRequest{
		PartialPresentationRequest: &reqAttrMsg.PartialRequests[1],
		Context:                    reqAttrMsg.Context,
		Nonce:                      reqAttrMsg.Nonce,
	}

	// create a separate proof for each request
	presentation1, err := claimer.BuildPresentation(attester1.PublicKey, cred, req1)
	require.NoError(t, err)
	require.NotNil(t, presentation1)

	presentation2, err := claimer.BuildPresentation(attester2.PublicKey, cred2, req2)
	require.NoError(t, err)
	require.NotNil(t, presentation2)

	// merge proofs again
	combinedPresentation := &credentials.CombinedPresentationResponse{
		Proof: gabi.ProofList{&presentation1.Proof, &presentation2.Proof},
	}

	// verify
	verified, disclosedPresentations, err := credentials.VerifyCombinedPresentation(
		[]*gabi.PublicKey{
			attester1.PublicKey,
			attester2.PublicKey,
		}, []*revocation.SignedAccumulator{
			update1.SignedAccumulator,
			update2.SignedAccumulator,
		}, combinedPresentation, verifierSession)
	require.False(t, verified)
	require.Nil(t, disclosedPresentations)
}

func TestPresentForgedAttributes(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	_, cred := buildCredential(t, sysParams, attester, claimer, update)

	// change attribute
	cred.Credential.Attributes[1] = (&big.Int{}).Add(cred.Credential.Attributes[1], big.NewInt(666))

	requestedAttr := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "special",
		"contents" + credentials.Separator + "likedNumbers",
	}
	_, reqAttrMsg1 := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, time.Now())
	verifierSession2, _ := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, time.Now())
	require.NotEqual(t, reqAttrMsg1.Nonce, verifierSession2.Nonce)

	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg1)
	require.NoError(t, err, "Could not disclose attributes")

	verified, presentation, err := credentials.VerifyPresentation(attester.PublicKey,
		update.SignedAccumulator, disclosedAttr, verifierSession2)
	require.NoError(t, err)
	require.Nil(t, presentation)
	require.False(t, verified)
}

func TestPresentRequestNonexistent(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	_, cred := buildCredential(t, sysParams, attester, claimer, update)

	// change attribute
	cred.Credential.Attributes[1] = (&big.Int{}).Add(cred.Credential.Attributes[1], big.NewInt(666))

	requestedAttr := [4]string{
		"ctype",
		"contents" + credentials.Separator + "age",
		"contents" + credentials.Separator + "specifghfghal",
		"contents" + credentials.Separator + "likedNumbers",
	}
	_, reqAttrMsg1 := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, time.Now())
	verifierSession2, _ := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, time.Now())
	require.NotEqual(t, reqAttrMsg1.Nonce, verifierSession2.Nonce)

	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg1)
	require.Error(t, err)
	require.Nil(t, disclosedAttr)
}
