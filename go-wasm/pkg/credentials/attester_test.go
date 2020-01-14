package credentials

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/require"
)

var (
	attesterPrivKey         = []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666344,"P":"82RNoU5p0nbTJofyadbTNA+NgLFnb7TrH8rJAwvay+JSvatXsh+bGtYF5petC5xASH8W+8W4sofDNKdAr80Zmw==","Q":"8yy+AX0L3wBSkn2KAJ85qWh7NbMYYksJ39ESqADOummuWd1JsNQOBrO0JrnLQ6hPhWVGRXo/GmM62kWNhZIjzw==","PPrime":"ebIm0Kc06Ttpk0P5NOtpmgfGwFizt9p1j+VkgYXtZfEpXtWr2Q/NjWsC80vWhc4gJD+LfeLcWUPhmlOgV+aMzQ==","QPrime":"eZZfAL6F74ApST7FAE+c1LQ9mtmMMSWE7+iJVABnXTTXLO6k2GoHA1naE1zlodQnwrKjIr0fjTGdbSLGwskR5w==","ECDSA":"MHcCAQEEIIeTtwTR0LbVtIczxUcohFY4fA17Bj5XFGFRZw5sFt8+oAoGCCqGSM49AwEHoUQDQgAEWD6TIb8Eb7noNKT87W1DiiGiXDxD7AdpYzCeuiXqnMmSF56d2S0M6+XG6zXoARHXgFnN0+H+9fpcpzgwk9KiZQ=="}`)
	attesterPubKey          = []byte(`{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1578666344,"N":"5zK/k1ENNgaW0NXjQmWO/v0ODej1H6coPAGNsRbZeAY3LzAfhIEcc31+GYI7LXXZJivomxLs2rVdZ8hL6bOwb6CMDBfhbHhT+v+E+EnNV9qw68ocyrcw4cIx3kMvBXIeOni8lLeuC5ZQ981rvOeBjkxiWSVApvnMEIbH/FK95VU=","Z":"r2Zy+gpFJ44pOTvdjiYbKGYqZAj79JxV0+zFdOj6ZfXRAOa+KOeRBgRDRv/G+8BL0q6+qcgi2xLWmWRKnEI6vrUvkH/+G4Ta7sN1fejDI7MHP4NJavmU6ODs4PUBei9bfJDLAG5Tpe+NPj0VaC61hskyNIRBOjTRTvB48IXbcHY=","S":"QJaP9Yv3RhT6FjHtvPrdx5nAOzxSsiN3G6BxRpprjc35wod7fRtx5tqAlK2SWVeD7M3fq1K/04hZH7CYjgKb3ymn4o0qX+tgTXnNo+u1eCRabfmbdGXisU/lR5z+nllAIY0ENtcTKq0dlmV4jxjPQapw4DnWWCAPSiqeHxqLnE8=","G":"HoVUm3Jjhmn6c4qZQwVrOnw0hy3kTcZF9MXqXSxFeZn/Z6yMZBNk3YY+n8+mqyeRyMTEIq3Ns9SqNKJHvjxztXVxCAE4O2ARjJIgl6pYm0W6h3z9LHhm3NsbBiCFLdNzrFdf8v/EnMBhrf6MiOJ8iJcLU0K8BKoMFuFZtCI6sRw=","H":"1XtFjBT9Tjute9xYivSPf1bAbFlW+HyLvbajEKCWMuSt9QddeKLo63ql5gXS4QCCcC1CMQb8BdoRmuQeYfDIPnfw/cID20+nAmRPJRo6SVnbqTpu70hD+HFEOXSRqtXW7Epfq/7LDKUyuY6R0/s4OKQ4dPsq6SGtmq7UF0JKGoU=","T":"xhJUsnEzwcCexYXFt2xGWIZjCOEQru0rkJk2R2D202ikZajvjZ+/fd26utqV5EUNz2WxroNt6GResjtDsxaNyjRNCVqdB+ykJiRapKTzvP863CLMsFLWZBJa2/Oh3Z7510ARBlfGTaeMT22UTLuJ3Hk8wKzQmFN/K0na8gn/tzs=","R":["5OREh3OP7eqXU49ohCC4cfjGz+SkGfmDQGTN/NJjqK62f/ryyb3GaD9pulSSeq+WE0bAX3Q0Slje0yprWz90ptjK06SKo+IFZvssoIu/kNmi/BT0HQ5+to+91pOePwa8Xtn9K/7Tq82rv2o3UMzUMms8zR0QxrxiLt6I8ctuCso=","IqZnglVClf5B96J0VFMxz/ZNAICV1iyHfunvHUZEqnk5DG4lf06O9S8I+O7GP2vLcorJ5BWVYZUgeFU1HRP8TlQUZeNzvnrlfnV/QE20SwBO4yFK8SscbYfiBrn5XfUP94gpgrv0nQlsfJLeHEA2RYxeQPMskQU1FkR0q7ryUzA=","xwfzpphfDWwVDLS5I3+olFmZgyYAfUitBRCxrDHBzBJITVbke6SRwe6wxmvWYQEJGoxrKwsiAs8hg+MjvOeF6uLHz0qzhYKNJonL73Q2ms9ugb38jL4E5iY7MJpz5HkKGHYusJJThVURpP+SZa6ub/QvcS3asjtxaS0yzOcV8kY=","m9ASIa4oAfv63KP94GiCVG68SMa5PWQ3pfduzGTn8XlxA8RlKm9zj8efhzSXpXOnvmX3CR8KklzDqyXVwghgjWnKUolMTXU1i3dQgfnqZPUV/8gFR3SaVYjghie+AhdP3Rwma23BG9i+57Q6jmJmSJyurzVNNL6jbwCXMpmM+6o=","MfNZ2aN816Fc2GtlEy6mZm+uRjZwd49aLgyyYIVkX/tFmRhgHxOMKgBi7TOskhSZJnwhkpNZ3DvgzU8INcw93Z+1+qbQISseXWUB5anVPz0PvgSucH7/CR3gskPhK9QR8Fk/ewXpjA6YmDabBjVG9IK6T3o/8bSHeBmdYeY/+rs=","1Fwpi4Vd4ixSzZFvx89vtXJLe5WvnDuDEH1TCWOf3e2C98ZBAmICs+EWrunjv/wgCshaSXaljEjTVlD57HgXn6xVJ3uwpJKyyqRJ2iFZM1WS9slO5q3fOYY2uYsY8cgQIoRYMJxL3OHWFpA0u6UY3/bnDYmBXcVXl1U/g3D8YXc=","fpVblrzBLW/WAa2pLNyM5t8iyMy3ktW7fOXWAPXNtm3gfBqHWoogFgMoI6NgfxvdMQ19YXbS6VIZWziOikw7wCLSEhTaR6P5gK2FxOAbWTzee3rZkRbDYW5dDKJXlGUaZLbxfrd7Sz2tzPIQ6yuz0EwJNprR9y96zt+WkhDrtxA=","kLr1qew8lqXMqNX+5KBvLrn4Ot6dj7soUHOXod1A4qdv9261Q6nEQ5WZNxEr7yUjZl1g3VGOhhZlwUO+8CG7pPe70fKUpj/DohSfAnOfJ0mcScl5QZpnRJmD7Okp3DagPTu1HKE76vdniYPCeNfkurUYXypalNt+xklBWd491nM=","UekNkoT+gfrsK5Z+qabHRIfVHhuU6owO3X0ipGZWVxDTVc9Tgt2+Ms94r62sE9GmJDRMXPkptg56LHf+wxz3x+v9lUmBw3hT6XgXIg2yxHpJwntsiFV/Uibk8Ya2+K3YS93GsKBO3Z173TVl2uhwtejWTyX7MT7fBj2hj9k/mzI=","mDAETKs0AHc7mwYxXFRbdPxpKdfnuCJbIXtp7t9JK1Cd5atVdOZTY3HZrV2J1z0Wasuqrh4KNsdazpniKA++D39fDxm6jnT5A5obXAM/hrznH9Myna7cHZoxAGKKuOtOX2pTfqGLZn1zc8Xeki4/FfmUWm8/bQ2cXIIZaB0ORDA="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWD6TIb8Eb7noNKT87W1DiiGiXDxD7AdpYzCeuiXqnMmSF56d2S0M6+XG6zXoARHXgFnN0+H+9fpcpzgwk9KiZQ=="}`)
	attesterSignSession     = []byte(`{"GabiIssuer":{"Sk":{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"P":"j3TUnfX+Ru749PHYyjZfOsQvr6wuuCtcDna1jZiSvNAQiLu9zHbNsH1hOAjfRqhutBSJSN65c0MK1dVqo9K1+w==","Q":"94n5HwmUePijRew9oJ5FoKbMgx9uMAoDzAz3fPo6IbV9326RAsurWg5GKBVppeaYcs5SRMYAJNifUZnfE/nRjw==","PPrime":"R7pqTvr/I3d8enjsZRsvnWIX19YXXBWuBztaxsxJXmgIRF3e5jtm2D6wnARvo1Q3WgpEpG9cuaGFauq1Uela/Q==","QPrime":"e8T8j4TKPHxRovYe0E8i0FNmQY+3GAUB5gZ7vn0dENq+77dIgWXVrQcjFAq00vNMOWcpImMAEmxPqMzvifzoxw=="},"Pk":{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1607775323,"N":"ircKRDgyrbg2L1WZBI9MWjz8QL3Nwwn7baxtz0yhQN8Jg62LHkrFgQOIR9IyvyxIF69Ku1VNFC8AUwm7Ggd9Bzj/YjIUuiQC4osOFLgo86Dbhfs2mXIaY3sbBm6wuvi0wuyUAvO/dgZkLM8rjrgRdSq2D/7jZLdnPErKaitokjU=","Z":"GGvSolZf14GGsMADXL9IWj1A/Ue/RcNz1mt8wldyagfRMIwIjMYv4J5E0sIuHHPaWj3qc7MvJJ6AfzX4zsO2EMunQP+gAU08AOyfhFT+J8udnDx0Fuh2lRCjIoTPti082KrcielCkRmqEYL5BZpAiI37m/dabi0woZ8nIi5U64I=","S":"NfqG8fq9iudU2Bp/w8O5Sv+dJpJY3uOxA1WnF/a80ZRxE83GgckhTf/5/clHD3/k6CbhMnzjqJd0udz0NYjs03D+hlvgLliLhaEuWGTa5BFgjCOuecHPufcFOUNeDoZqXXICg/g+qWeOV6FpBJLOp8WXudIDpk7SLlqY3SRtbrY=","R":["WXPAAtAdx1Y+q1596/T8q/20+kwNpJNc0H3dRgA1H+naCF4J3N9jCTFZjNgnJEZstxCHNhpw/NgyZyqxbk0AsFSUFWsaBAPgZkwHsCc6yKywohrunF3Sahna9ALdcOHl+bHzQyx3uFc1GmDiOPdXuIQUUcYKOoMDdbW2EbRCvqY=","eFPGceT5r70BlIJ14bQ5I5M1zLFKu8okfIfFpyPRhVHWuLciTpe0bhyhhXLv06UVu2TUNeLT0MskB7c16MeQVJ0ToN6O8qpexIAqVOX2VY5eUMPKT88liVNrAu/+lAyj/Sac+v8r+gv3Y4KO3Hiv36rk14sB4TnmTzmKYTf5Zj0=","h245+272Ee/5F8qsMog9U73JGDo8/v0DuKt/QJrSxfuu3Tpf1rvE1pgp+jiPWHfs9PkDAp4HWD4VlNxhiH2uxvjxXocGGE7naFI+M7uWrZ85Vg0ayHL3uoHP9vuwck8j7IzPO+vSQmd/N+v6SRxMYK4kM31EN49BBWzk+Bs+68E=","MDa1U56jhGayP1A7Afk3NL2vKkPzqELiYJmCzGkODgx3BEYuR8jibrsv3qzRwzMTJcldgWy3XJ/4GgL9wK9fg+uyHhezy5+WyKUC79aS7Epo4zE5VEFiCxK6KAI8AYwrnbhmdoc9nfWQlB4PhEhls5t6V8TIzIIbIzzhEUNtuZU=","f0+tsyHtvzMD40JrKU/SGaXe3m+8xMgu8IHJnzjlBZ9VCtsJMtrSpNITyGM6VognWGLQwYy8qQ66LzfPtELi6UuNmzp7NTcPbT4GF+Ho4qszxDXsFFGigZhghSViJvxwQYDw6khjjJT1s5mLMXM4NQiesxeWwN2Zd1zvv//HVwA=","cSq1ohLOaVMEpfRlFvvpYJqOBRgzTnPdmf5KdGRqqabLo/xAL23AX6o7919g4gr6dH+T+1NgX1L8ozPKOKGVJv0rwBdLnvttLK1Ay5RZmQItKiHEM9sr+8t2gpeQFpw1Y2kVN1JDwrjL2ZqKgiatg7Z5NWV594bkkqNEFCB4xV4=","DlT9g64FDgjAT0X0bA7AzZhBR0cgWaQ86HAziyF9/E2uHuM92vDtiOf98pQt6TVoeWjMBSc9PoAL7+yDa7ZWHNdj1GoTcfZdv27ZeactfFgX99DaskPeHdiPHcFgj/x1ViWNZkJ6nYrIuRIsMPL3pWt52IybMYrJASPDelGQik4="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":""},"Context":"7oRPJhpo3V5yvBY6RK7GsI6nAQ2ZN2BSG3VpnDxwxWs="}}`)
	reqForAttestation       = []byte(`{"commitMsg":{"U":"UzwD/Ryn1TxSflS0ftzsM8CJFTbpzvDX/ZAb456o09e6XAxK+FsfzkqaCbsAsoEoN4fDZBhMHZPWw8JUnq76UpnSPoxkJpVoaa3jMzlTlKdJtsIk0KAfS6rdX2qflmB020PIKhCA5Dn+rY486o6z53M+UBkEjq2VqAkugPG5XWU=","n_2":"LGjfQYAmUVPNzA==","combinedProofs":[{"U":"UzwD/Ryn1TxSflS0ftzsM8CJFTbpzvDX/ZAb456o09e6XAxK+FsfzkqaCbsAsoEoN4fDZBhMHZPWw8JUnq76UpnSPoxkJpVoaa3jMzlTlKdJtsIk0KAfS6rdX2qflmB020PIKhCA5Dn+rY486o6z53M+UBkEjq2VqAkugPG5XWU=","c":"1uyxY/DVPQUnIwweMrPKlaZHizU5dJPYfqRDe+I/yCM=","v_prime_response":"m+5u64jZxrE7kZSgzCnfn2m7kP3yqhA2Us7arVs0te4nvIyQKJ1iQzvBctz8+tp6dXqo4lDW0hEGXMCKu4DJUD9zBNVWJl38PR2Sjoz45W6GA+Be799mItD1NUJkLIYekJ1vSs8kyMa8ggy8rGD8gO7g54TBd74V19MKVSVhbtIet0PK+2DFI1AyClsPRNzgOwMgCcQeNTVErwy4F7oORO1GDNWawGy7hcCdXl/2R6hVQuTA","s_response":"AaJYhsB7S94nWhYRpBuSlfVCBv6WB3Hutk94426xlxk+fy/TDBbL5nPaAJYsEXPr5mSDY2cIaWpGdnNUhppS+D2ibudlxdiOTs7l"}],"proofPJwt":"","proofPJwts":null},"values":["QKmzwo9cKPY=","AQ==","MDA2ZWUwZjMtN2VkZC00MDEwLWFiMjEtNDU4ZGY5MWRjMGQ1","Q0AAAAAAAAA=","aHR0cDovL3BsYWNlaG9sZC5pdC8zMngzMg==","MHgzOWZmYzMzMjAyNDEwNzIxNzQzZTE5MDgyOTg2ZTY1MGI0ZTg0N2I4NWJlYTdlYWI3Ny4uLg=="]}`)
	reqForAttestationTooMay = []byte(`{"commitMsg":{"U":"UzwD/Ryn1TxSflS0ftzsM8CJFTbpzvDX/ZAb456o09e6XAxK+FsfzkqaCbsAsoEoN4fDZBhMHZPWw8JUnq76UpnSPoxkJpVoaa3jMzlTlKdJtsIk0KAfS6rdX2qflmB020PIKhCA5Dn+rY486o6z53M+UBkEjq2VqAkugPG5XWU=","n_2":"LGjfQYAmUVPNzA==","combinedProofs":[{"U":"UzwD/Ryn1TxSflS0ftzsM8CJFTbpzvDX/ZAb456o09e6XAxK+FsfzkqaCbsAsoEoN4fDZBhMHZPWw8JUnq76UpnSPoxkJpVoaa3jMzlTlKdJtsIk0KAfS6rdX2qflmB020PIKhCA5Dn+rY486o6z53M+UBkEjq2VqAkugPG5XWU=","c":"1uyxY/DVPQUnIwweMrPKlaZHizU5dJPYfqRDe+I/yCM=","v_prime_response":"m+5u64jZxrE7kZSgzCnfn2m7kP3yqhA2Us7arVs0te4nvIyQKJ1iQzvBctz8+tp6dXqo4lDW0hEGXMCKu4DJUD9zBNVWJl38PR2Sjoz45W6GA+Be799mItD1NUJkLIYekJ1vSs8kyMa8ggy8rGD8gO7g54TBd74V19MKVSVhbtIet0PK+2DFI1AyClsPRNzgOwMgCcQeNTVErwy4F7oORO1GDNWawGy7hcCdXl/2R6hVQuTA","s_response":"AaJYhsB7S94nWhYRpBuSlfVCBv6WB3Hutk94426xlxk+fy/TDBbL5nPaAJYsEXPr5mSDY2cIaWpGdnNUhppS+D2ibudlxdiOTs7l"}],"proofPJwt":"","proofPJwts":null},"values":["QKmzwo9cKPY=","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","AQ==","MDA2ZWUwZjMtN2VkZC00MDEwLWFiMjEtNDU4ZGY5MWRjMGQ1","Q0AAAAAAAAA=","aHR0cDovL3BsYWNlaG9sZC5pdC8zMngzMg==","MHgzOWZmYzMzMjAyNDEwNzIxNzQzZTE5MDgyOTg2ZTY1MGI0ZTg0N2I4NWJlYTdlYWI3Ny4uLg=="]}`)
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

	bts, err := json.Marshal(attester.PrivateKey)
	require.NoError(t, err)
	fmt.Println(string(bts))
	err = json.Unmarshal(bts, privateKey)
	require.NoError(t, err)

	bts, err = json.Marshal(attester.PublicKey)
	require.NoError(t, err)
	fmt.Println(string(bts))
	err = json.Unmarshal(bts, publicKey)
	require.NoError(t, err)

	require.True(t, privateKey.RevocationSupported())
	require.True(t, publicKey.RevocationSupported())
}

func TestSign(t *testing.T) {
	attester := &Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	request := &RequestAttestedClaim{}
	err = json.Unmarshal(reqForAttestation, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(attesterSignSession, session)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)

	_, _, err = attester.AttestClaim(request, session, update)
	require.NoError(t, err)
}

func TestSignAndRevoke(t *testing.T) {
	attester := &Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	// ignore error here, just ensure that revocation keys exists
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	request := &RequestAttestedClaim{}
	err = json.Unmarshal(reqForAttestation, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(attesterSignSession, session)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)

	sig, witness, err := attester.AttestClaim(request, session, update)
	require.NoError(t, err)
	require.NotNil(t, sig)

	revokedUpdate, err := attester.RevokeAttestation(update, witness)
	require.NoError(t, err)
	require.NotNil(t, revokedUpdate)
}

func TestSignTooMany(t *testing.T) {
	attester := &Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	request := &RequestAttestedClaim{}
	err = json.Unmarshal(reqForAttestationTooMay, request)
	require.NoError(t, err)

	session := &AttesterSession{}
	err = json.Unmarshal(attesterSignSession, session)
	require.NoError(t, err)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)

	_, _, err = attester.AttestClaim(request, session, update)
	require.Error(t, err)
}

func TestCreateAccumulator(t *testing.T) {
	attester := &Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	err := json.Unmarshal(attesterPrivKey, attester.PrivateKey)
	require.NoError(t, err)
	err = json.Unmarshal(attesterPubKey, attester.PublicKey)
	require.NoError(t, err)
	gabi.GenerateRevocationKeypair(attester.PrivateKey, attester.PublicKey)

	update, err := attester.CreateAccumulator()
	require.NoError(t, err)
	require.NotNil(t, update)

}
