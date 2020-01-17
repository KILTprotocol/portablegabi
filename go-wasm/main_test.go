package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/credentials"
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
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
)

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

func buildCredential(t *testing.T, sysParams *gabi.SystemParameters, attester *credentials.Attester, claimer *credentials.Claimer, update *revocation.Update) (*credentials.Claim, *credentials.AttestedClaim) {
	claim := &credentials.Claim{
		CType: "0xDEADBEEFCOFEE",
		Contents: map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"name":    "Berta",
			"gender":  "female",
			"special": true,
		},
	}

	attributes, values := claim.ToAttributes()
	require.Equal(t, len(attributes), 5)
	require.Equal(t, len(values), 5)

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

func verify(t *testing.T, attester *credentials.Attester, claimer *credentials.Claimer, cred *credentials.AttestedClaim, claim *credentials.Claim, accI uint64) {
	requestedAttr := [4]string{"ctype", "contents" + credentials.SEPARATOR + "age", "contents" + credentials.SEPARATOR + "special", "contents" + credentials.SEPARATOR + "gender"}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, accI)
	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")

	_, attr, err := credentials.VerifyPresentation(attester.PublicKey, disclosedAttr, verifierSession)
	require.NoError(t, err, "Could not verify attributes")
	contents, ok := attr["contents"].(map[string]interface{})
	require.True(t, ok, "should be a map")
	require.Equal(t, claim.Contents["age"], contents["age"])
	require.Equal(t, claim.CType, attr["ctype"])
	require.Equal(t, claim.Contents["gender"], contents["gender"])
	require.Equal(t, claim.Contents["special"], contents["special"])
	require.Nil(t, attr["contents.name"])
}

func TestCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester, err := credentials.NewAttester(sysParams, 6, OneYear)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)
	require.NoError(t, err, "Error in attester key generation")
	update, err := attester.CreateAccumulator()
	require.NoError(t, err, "Could not create update")

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")

	claim, cred := buildCredential(t, sysParams, attester, claimer, update)

	verify(t, attester, claimer, cred, claim, 1)

	_, cred2 := buildCredential(t, sysParams, attester, claimer, update)
	verify(t, attester, claimer, cred2, claim, 1)

	update, err = attester.RevokeAttestation(update, cred2.Credential.NonRevocationWitness)
	require.NoError(t, err, "Could not revoke!")
	cred, err = claimer.UpdateCredential(attester.PublicKey, cred, update)
	require.NoError(t, err, "Could not update cred!")
	// increase the accumulator index and ensure that the witness was updates!
	verify(t, attester, claimer, cred, claim, 2)
}

func TestCombinedCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	require.True(t, success, "Error in sysparams")

	attester1, err := credentials.NewAttester(sysParams, 6, OneYear)
	gabi.GenerateRevocationKeypair(attester1.PrivateKey, attester1.PublicKey)
	require.NoError(t, err, "Error in attester key generation")
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
	verify(t, attester1, claimer, cred, claim, 1)

	_, cred2 := buildCredential(t, sysParams, attester2, claimer, update2)
	verify(t, attester2, claimer, cred2, claim, 1)

	requestedAttrs := [4]string{"ctype", "contents" + credentials.SEPARATOR + "age", "contents" + credentials.SEPARATOR + "special", "contents" + credentials.SEPARATOR + "gender"}
	requestPresentation := [2]credentials.PartialPresentationRequest{
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[:],
			ReqNonRevocationProof: true,
			ReqMinIndex:           1,
		},
		credentials.PartialPresentationRequest{
			RequestedAttributes:   requestedAttrs[2:],
			ReqNonRevocationProof: true,
			ReqMinIndex:           1,
		},
	}
	verifierSession, reqAttrMsg := credentials.RequestCombinedPresentation(attester1.PublicKey.Params, requestPresentation[:])
	require.NotNil(t, verifierSession)
	require.NotNil(t, reqAttrMsg)

	combinedPresentation, err := claimer.BuildCombinedPresentation([]*gabi.PublicKey{attester1.PublicKey, attester2.PublicKey}, []*credentials.AttestedClaim{cred, cred2}, reqAttrMsg)
	require.NoError(t, err)
	require.NotNil(t, combinedPresentation)

	verified, disclosedPresentations, err := credentials.VerifyCombinedPresentation([]*gabi.PublicKey{attester1.PublicKey, attester2.PublicKey}, combinedPresentation, verifierSession)
	require.NoError(t, err)
	require.True(t, verified)
	require.NotNil(t, disclosedPresentations)
	require.Equal(t, 2, len(disclosedPresentations))
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

	claim := &credentials.Claim{
		CType: "0xDEADBEEFCOFEE",
		Contents: map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"name":    RandStringRunes(1024 * 1024 * 1024),
			"gender":  "female",
			"special": true,
		},
	}

	attributes, _ := claim.ToAttributes()
	require.Equal(t, len(attributes), 5, "Expected 6 attributes")

	attesterSession, startSignMsg, err := attester.InitiateAttestation()
	require.NoError(t, err, "Could not start signing session")

	userSession, reqAttestMsg, err := user.RequestAttestationForClaim(attester.PublicKey, startSignMsg, claim)
	require.NoError(t, err, "Could not request signature")

	sigMsg, _, err := attester.AttestClaim(reqAttestMsg, attesterSession, update)
	require.NoError(t, err, "Could not create signature")

	cred, err := user.BuildCredential(sigMsg, userSession)
	require.NoError(t, err, "Could not request attributes")

	requestedAttr := [2]string{"ctype", "contents" + credentials.SEPARATOR + "name"}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(sysParams, requestedAttr[:], true, 0)
	disclosedAttr, err := user.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")
	require.NotNil(t, verifierSession, "Session must not be nil")
	require.NotNil(t, disclosedAttr, "there need to be a disclosure proof")

	_, attr, err := credentials.VerifyPresentation(attester.PublicKey, disclosedAttr, verifierSession)
	require.NoError(t, err, "Could not verify attributes")
	require.Equal(t, claim.CType, attr["ctype"], "ctype changed!")

	contents, ok := attr["contents"].(map[string]interface{})
	require.True(t, ok, "should be a map")
	require.Equal(t, claim.Contents["name"], contents["name"], "name changed!")
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
	fmt.Println("Attester:", string(bts))

	bts, err = json.Marshal(update)
	require.NoError(t, err)
	fmt.Println("Update:", string(bts))

	claimer, err := credentials.ClaimerFromMnemonic(sysParams, Mnemonic, "")
	require.NoError(t, err, "Error in claimer key generation")
	bts, err = json.Marshal(claimer)
	require.NoError(t, err)
	fmt.Println("Claimer:", string(bts))

	claim := &credentials.Claim{
		CType: "0xDEADBEEFCOFEE",
		Contents: map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"name":    "Berta",
			"gender":  "female",
			"special": true,
		},
	}

	attributes, values := claim.ToAttributes()
	require.Equal(t, len(attributes), 5)
	require.Equal(t, len(values), 5)

	attesterSession, startSignMsg, err := attester.InitiateAttestation()
	require.NoError(t, err, "Could not start signing session")

	bts, err = json.Marshal(attesterSession)
	require.NoError(t, err)
	fmt.Println("AttesterSession:", string(bts))

	bts, err = json.Marshal(startSignMsg)
	require.NoError(t, err)
	fmt.Println("StartAttestationMessage:", string(bts))

	userSession, reqAttestMsg, err := claimer.RequestAttestationForClaim(attester.PublicKey, startSignMsg, claim)
	require.NoError(t, err, "Could not request signature")

	bts, err = json.Marshal(reqAttestMsg)
	require.NoError(t, err)
	fmt.Println("AttestationRequest:", string(bts))

	bts, err = json.Marshal(userSession)
	require.NoError(t, err)
	fmt.Println("ClaimerSession:", string(bts))

	sigMsg, _, err := attester.AttestClaim(reqAttestMsg, attesterSession, update)
	require.NoError(t, err, "Could not create signature")

	bts, err = json.Marshal(sigMsg)
	require.NoError(t, err)
	fmt.Println("AttestationResponse:", string(bts))

	cred, err := claimer.BuildCredential(sigMsg, userSession)
	require.NoError(t, err, "Could not request attributes")

	bts, err = json.Marshal(cred)
	require.NoError(t, err)
	fmt.Println("Credential:", string(bts))

	bts, err = json.Marshal(claim)
	require.NoError(t, err)
	fmt.Println("claim:", string(bts))

	requestedAttr := [4]string{"ctype", "contents" + credentials.SEPARATOR + "age", "contents" + credentials.SEPARATOR + "special", "contents" + credentials.SEPARATOR + "gender"}
	verifierSession, reqAttrMsg := credentials.RequestPresentation(attester.PublicKey.Params, requestedAttr[:], true, 1)
	bts, err = json.Marshal(verifierSession)
	require.NoError(t, err)
	fmt.Println("verifierSession:", string(bts))
	bts, err = json.Marshal(reqAttrMsg)
	require.NoError(t, err)
	fmt.Println("PresentationRequest:", string(bts))

	disclosedAttr, err := claimer.BuildPresentation(attester.PublicKey, cred, reqAttrMsg)
	require.NoError(t, err, "Could not disclose attributes")
	bts, err = json.Marshal(disclosedAttr)
	require.NoError(t, err)
	fmt.Println("PresentationResponse:", string(bts))

	_, attr, err := credentials.VerifyPresentation(attester.PublicKey, disclosedAttr, verifierSession)
	require.NoError(t, err, "Could not verify attributes")
	contents, ok := attr["contents"].(map[string]interface{})
	require.True(t, ok, "should be a map")
	require.Equal(t, claim.Contents["age"], contents["age"])
	require.Equal(t, claim.CType, attr["ctype"])
	require.Equal(t, claim.Contents["gender"], contents["gender"])
	require.Equal(t, claim.Contents["special"], contents["special"])
	require.Nil(t, attr["contents.name"])

}
