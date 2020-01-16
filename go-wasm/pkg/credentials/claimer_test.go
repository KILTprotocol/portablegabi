package credentials

import (
	"encoding/json"
	"testing"

	"github.com/privacybydesign/gabi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	mnemonic = "opera initial unknown sign minimum sadness crane worth attract ginger category discover"
)

var (
	byteStartSigMsg = []byte(`{"nonce":"B/dBAFUgR/+gSw==","context":"ZAU6a1vK1dygZ4y0SH6tstYcca4ihmjErvIohfDrIRA="}`)
	byteSigMsg      = []byte(`{"proof":{"c":"sFeQAg0IzbekE3na7JSfMgYwxTVX+Yif/kEuvxY+evo=","e_response":"H4R2ekjx4cmzWXyAmaCjgIV3W/2TKMv4Jnjq/+TnfkZL+Jbenm5j1titwLyvfXVMg5iWfLaQY+6Zy8JjOkzEQZePGUCv9kdE8Cb0JevkNT06uZLIOiqrxAxep5Y3PvYsJd26It7QnKj0PzgPzTH92SiWmT5NcCFENdiqfhC/Sxk="},"signature":{"A":"H9dFcCdCDUBcli/71s3rgO6FRgBcNy7eiqswWeKBbiXhPurkY8brcc7E1oSUVzGtVS270AptxQMp89vfoq3pbgYc6tEllsCyl1QUjPTXCE4CznsMhJ4ZLP8Td+hnSnxSQJ5LxPsYwUdpEL9ZCYBgj/stIeqfEFUdQH/A7v2MnYg=","e":"EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJSSKwFb/fnX7iISyh/x3","v":"DcJee3kpQW7okN/LaxW+0TSS9QKmJN18UpjrMecsD0x3weeChWG9MK7uWh7fSiVlcVq+9VMN4iWcPswWW/1osr++WphbSKYQ2K/uTaOxNnUTGusfUR/V9rAgIOtby4Usyx52oWLqfog9rmu/QiWvHyWJDopcY904BtDsY/u+VXSCxyM27P/5l8e4Lytr3WbZ8cDYsq1W2nCU8A3U64aaiNdm/mtLrmDYHrAQWsMBZp8qMfTb4sSlf8cwu/miNv416vzHxLpSJX152fddgHpH7hPea1N+","KeyshareP":null},"nonrev":{"u":"gTuegDIKu0/8BHr1qdPffxYZQ9fpS0AAvA/kw5qVWEPmo8sGkTq/qcDSOe9n/0EU821x74JFldzTHvMDdWUT1foRj2OoWFM0xp4dVVUYvrKBPVODLtiQWhkFA0Bae2PkYf1CR5eXimlYjjaC/Hn5dYBd04I76hhiVSOTXYcBDa0=","e":"BdKnDbiUuiX8Mumk8A/J/ssBipb5CSt62w==","sacc":{"data":"omNNc2dYu6NiTnVYgHrwj2bAhPb3t+yWIt58k5b6NsZDzQKrQ6mGb1+UvB+6W56mlftjk6ZuhZb6nrfq4qBTbp9nF1thQVYkCDU5+SLZurq6WwTIQmZl3pswb+Eb6AnFNx7jZCSqszgvKAu2rR16BAUoUUxaCwIx9yl+hzLI8ZED35mD1a2JJzxaMqsYZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEcwRQIhANiHeQsy1LDpRMGPv0LmPNrr3dVLyBRrL25CtSFmoSSMAiAtzP1xUPld7HqKK6QhQsZ8LiWCbxyOxcv8XOJ18rHB7A==","pk":0},"Updated":"0001-01-01T00:00:00Z"}}`)
	byteUserSession = []byte(`{"cb":{"Secret":"onIfyirb1JJTKOvFc4qMov6os2UdxyQwdRMkQl0Va5c=","VPrime":"SiJ9Cu4wuykx64vci1l9bC3YZbCO0zar5y7SsabvewuOAnsUCZtmalvA5bDOtp6z5Y5wgz0oDPElZw+fW/OHaNPCiAQYTws4rmvucoCd3BXtmoEAFGl7nwtTwljKgdulIdH8ppmT919etj8OXzUOz3mLj4+LV0wihnQ96KJOySjYDqGWSbgZfXj0","VPrimeCommit":null,"Nonce2":"pSnFoUCW/8M9Pg==","U":"F6KOr5Elsqn4qOKJ2VM8xVb+Q5Rg3jT/7AlFMUiXZdtXkWubATjOeztno3YR1Oxwsy/e3fbSoKKBpzAR5+Pm3e9v5VjDAFGMykFW5wn3DGA3GNQpQaZ3HeSOhpVXRyWOJc5cS4ZI171eXBw/499GuOuf7FA1SlsSTbe2B7HbMPc=","UCommit":"AQ==","SkRandomizer":null,"Pk":{"XMLName":{"Space":"","Local":""},"Counter":0,"ExpiryDate":1610447314,"N":"h0n3+Q8HP84Yq1p3ipJ9FPDKrQN+2GggqY/xfmJiSEN2T08QfJ28BtGMn3BALam4+0u9XtlWWamUFcToQiJDfT1TMklN8/F/zy2gB6mgbX0s2dBlWXn1ZTRF/5OSfYu+DFxG/pOYMaI/KQycNT66GpGL2I1WSLr3XKLvFXEX05U=","Z":"IuKfp+I76MHtzF2X7VGqD056UJpD3VuCzxBlxAfJoXsK2izw7hN61OouhdwycVoN4LI0YsysiFXq1+R7f6RqwDqWgCUh+DHWbkxeKd5UVukhr3gl/NiuosgN4tKoL0eBrgU2YDofgHE/fcQM0IHSeE2O2OzZLuwwGkWvRgcBZhE=","S":"ZXBH0ZMdnARxYL4el/tXUhATm5hKJomMLpkivbpDNGan4J8uWN+0lOZ+DAx1n8BPJ9T2Bk7jUeFQ6X/O9uYDxD36Oz4HeQ04o5jsWbn+mDNNPXFQ7Kaqf346TjRDmgE071qT2QCALgy9i1v46Cae79qaXsYAiCDly0eOjUyVLkw=","G":"GS5St0VQypHuoKLGMfv5x1ZGHtEGkWE/KOEB22Och7mZEesLVW1MdDdmFF7gdf5v1BhfD1abjd081lAdOysbIQPCEWJJIR8QzvSTxdqUDI7J6b5Lhnfqh6FpMp0os1/Yc0eP2D13jAk0KLj8GBv4FKO96F5cmPTHq/PTvtU978M=","H":"VqbykYbNmREOwPP5y/0fF+ZOQdahb7zOeilpIybBroPZPdSprP9iNgq8Fr6czDfz2b8OJ7aGI+6OL4BxqtH8iogYAKW3jrN4yfddYITxUFfHrE1WJVFrs8jgBkdcQs2W1mjfGLbTdKqgxwqPV9UQeG+fQ+pq6ZEtp/KB/8hiEhM=","T":"QTCiAlxrrA5/UGMyf2hiW+jP5Qxqxkj+bi91TlN79deEXD6H9quOYC+P/oJAzAMd+HUiftRGKiUqee6LWhaLXzrwsunpi4+ykzYgKNQiQaD7/F6RkCH+xWP8SKuXwb9mx5Q2Qq0r3Aw4ke04nl2hJHqm9IE1XoJhdJd1mKPisqU=","R":["TtmCGDdSPW9Z9IroRggbohCyLAcXICXktxPoA9Q6ULFQYEdKNzMWn85FnUGC2NCp9UkSSNfKDxk+L4DzPNhpjZu9BhHJhe+U1dN296dqE8AYP2Nzszbmehody8PoHbV10nBuLwh0iMnZaTUYKn/g/yGvkDqYWK8HNyn7v/NaBck=","GPgHyGNEe/HBMgW5mokyMRSaSVlEYs1jFHDxj95857MelNVgE+H3BFVhWP+QKwu9w28LyNInI7YSRZH7qCPZcUc//4pMBeOnSUaXmMzdjV56S+FC1y8UGLhqJ/x0F2zotPxbyQuNr9Gnxnwiqi6DIO80XsimIj7uuXFZi3xI/HY=","YfRHFG+c9g8DvtmfsjMDoG2pp/ipEj2g0HiB0B5bruTwAacFXgOplNGTR94/DmOcshWckagXCHn4rk5fEOr6tevbllYbV2mNI6WWu4TPChqUURmYVeBXYJp2T0TKM/BUvs2mXRY/T2X4Ub5MDKU56WmDHmeyg1ymuSlk2JODEfE=","L6l4Qqb9k7bh9p/0Xs6wiLdVEXv/E+3PF0BPmGLT74tom1kVvY8fb0o8rpgs6ftPLS2D2tqWprO9dtInciegS21u2WoCMe1sxsx65UuqijCYNQSftwWZNcO8+AaMZjTGPUI/N0rOlHk2IwoYFpcVaC7i35RnZcBBa4vI22WohMs=","RGG82/EX3kqD8ckSA2atnGNN0Bv3w4u5+BC0R9WX8ixRY0J4fnhEhrKFKBOcIvKeoHtbZ8RyDMEZHdnLDCNs6rjkVvvmxj6LhKkTSrPc1f8uj7++lANKhUVngnXRdIbBrulFeTWbkB/LGEVk+qtwVn0X6BVcHBsnNy8vrqkRkzI=","H8PH/WIvLynrWexF2W+lkhXhpbxramlMSvGPRTIztUp/I4ibc41AL2LuOYxAWkUkrgVeQGJ5Rc6b61U9OctivOJ+4/MKJab/MAkONeX26bidJowPfc4ogZRibB7oJhyreM8euhYjBL0xssoPEYkF7XeT77lXVNaeMT98aWS/stc="],"EpochLength":432000,"Params":{"LePrime":120,"Lh":256,"Lm":256,"Ln":1024,"Lstatzk":80,"Le":597,"LeCommit":456,"LmCommit":592,"LRA":1104,"LsCommit":593,"Lv":1700,"LvCommit":2036,"LvPrime":1104,"LvPrimeCommit":1440},"Issuer":"","ECDSA":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKUlE002gXKj3n57B+bR3XZQi7t8w1y+PNkev7z0sUiZW9hKrPdrZpydofoVO1yF6t8oxhufpA/BrOKua93VXhw=="},"Context":"MTlUCADHMqDr1DGYzNLL/9WCxJMnZwBQ1wa/t8qtvpU=","ProofPcomm":null},"claim":{"cType":"0xDEADBEEFCOFEE","contents":{"age":34,"gender":"female","name":"Berta","special":true}}}`)
	byteCredentials = []byte(`{"credential":{"signature":{"A":"H9dFcCdCDUBcli/71s3rgO6FRgBcNy7eiqswWeKBbiXhPurkY8brcc7E1oSUVzGtVS270AptxQMp89vfoq3pbgYc6tEllsCyl1QUjPTXCE4CznsMhJ4ZLP8Td+hnSnxSQJ5LxPsYwUdpEL9ZCYBgj/stIeqfEFUdQH/A7v2MnYg=","e":"EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJSSKwFb/fnX7iISyh/x3","v":"DcJee3kpQW7okN/LaxW+0TSS9QKmJN18UpjrMecsD0x3weeChWG9MK7uWh7fSiVlcVq+9VMN4iWcPswWW/1osr++WphbSKYQ2K/ul8YuQWND1hRRPKuyggmdjRk0MTW7nlUiiJG9MC8tKXdNRKDDKMDveOYdSY4GvW+gSYou2LGq1BRcVA+Y87s/l/8uZWryQMwRYRlFTPEyzCPChgeanUDinXafcLmioIu1fJT+DTi+KVQ6mQOz3vw/i3Mtxo3BQkjqSy6QDh/IoyA1jxveN8v36Mxy","KeyshareP":null},"attributes":["onIfyirb1JJTKOvFc4qMov6os2UdxyQwdRMkQl0Va5c=","QEEAAAAAAAA=","ZmVtYWxl","QmVydGE=","AQ==","MHhERUFEQkVFRkNPRkVF"],"nonrevWitness":{"u":"gTuegDIKu0/8BHr1qdPffxYZQ9fpS0AAvA/kw5qVWEPmo8sGkTq/qcDSOe9n/0EU821x74JFldzTHvMDdWUT1foRj2OoWFM0xp4dVVUYvrKBPVODLtiQWhkFA0Bae2PkYf1CR5eXimlYjjaC/Hn5dYBd04I76hhiVSOTXYcBDa0=","e":"BdKnDbiUuiX8Mumk8A/J/ssBipb5CSt62w==","sacc":{"data":"omNNc2dYu6NiTnVYgHrwj2bAhPb3t+yWIt58k5b6NsZDzQKrQ6mGb1+UvB+6W56mlftjk6ZuhZb6nrfq4qBTbp9nF1thQVYkCDU5+SLZurq6WwTIQmZl3pswb+Eb6AnFNx7jZCSqszgvKAu2rR16BAUoUUxaCwIx9yl+hzLI8ZED35mD1a2JJzxaMqsYZUluZGV4AWlFdmVudEhhc2hYIhIg542kR7yDoMEFhYbUEni4Da0kZK3162KvG7Gb79HlbbtjU2lnWEcwRQIhANiHeQsy1LDpRMGPv0LmPNrr3dVLyBRrL25CtSFmoSSMAiAtzP1xUPld7HqKK6QhQsZ8LiWCbxyOxcv8XOJ18rHB7A==","pk":0},"Updated":"0001-01-01T00:00:00Z"}},"claim":{"cType":"0xDEADBEEFCOFEE","contents":{"age":34,"gender":"female","name":"Berta","special":true}}}`)
)

func TestClaimerFromMnemonic(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	secret, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}

func TestCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	secret, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	assert.NoError(t, err, "could not create claimer secret")
	assert.NotNil(t, secret)
	assert.Equal(t, sysParams.Lm, uint(secret.MasterSecret.BitLen()))
}

func TestRequestSignature(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")

	attesterMsg := &StartSessionMsg{}
	err := json.Unmarshal(byteStartSigMsg, attesterMsg)
	require.NoError(t, err)

	publicKey := &gabi.PublicKey{}
	err = json.Unmarshal(attesterPubKey, publicKey)
	require.NoError(t, err)

	claim := &Claim{
		CType: "0xDEADBEEFCOFEE",
		Contents: map[string]interface{}{
			"age":     34., // use float here, json will always parse numbers to float64
			"gender":  "female",
			"special": true,
		},
	}

	claimer, err := NewClaimer(sysParams)
	require.NoError(t, err)
	session, reqMsg, err := claimer.RequestAttestationForClaim(publicKey, attesterMsg, claim)
	require.NoError(t, err)
	require.NotNil(t, reqMsg)
	require.NotNil(t, session)
}

func TestBuildUpdateCredential(t *testing.T) {
	sysParams, success := gabi.DefaultSystemParameters[KeyLength]
	assert.True(t, success, "Error in sysparams")
	claimer, err := ClaimerFromMnemonic(sysParams, mnemonic, "")
	assert.NoError(t, err, "could not create claimer secret")

	publicKey := &gabi.PublicKey{}
	err = json.Unmarshal(attesterPubKey, publicKey)
	require.NoError(t, err)

	sigMsg := &gabi.IssueSignatureMessage{}
	err = json.Unmarshal(byteSigMsg, sigMsg)
	require.NoError(t, err)

	userSession := &UserIssuanceSession{}
	err = json.Unmarshal(byteUserSession, userSession)
	require.NoError(t, err)

	cred, err := claimer.BuildCredential(sigMsg, userSession)
	assert.NoError(t, err, "Could not request attributes")
	require.NotNil(t, cred)
}
