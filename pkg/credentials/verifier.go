package credentials

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

// VerifierSession stores information which is needed to verify the response of the claimer
type VerifierSession struct {
	Context *big.Int `json:"context"`
	Nonce   *big.Int `json:"nonce"`
}

// RequestAttributes builds a message which request the specified attributes from a claimer.
// It returns a VerifierSession which is used to check the claimers response and RequestDiscloseAttributes
// which represents the message which should be send to the claimer
func RequestAttributes(sysParams *gabi.SystemParameters,
	discloseAttributes []string) (*VerifierSession, *RequestDiscloseAttributes) {
	context, _ := gabi.RandomBigInt(sysParams.Lh)
	nonce, _ := gabi.RandomBigInt(sysParams.Lh)
	return &VerifierSession{context, nonce}, &RequestDiscloseAttributes{
		Context:            context,
		DiscloseAttributes: discloseAttributes,
		Nonce:              nonce,
	}
}

// VerifyPresentation verifies the response of a claimer and returns the disclosed attributes.
func VerifyPresentation(issuerPubK *gabi.PublicKey, signedAttributes *DiscloseAttributes, session *VerifierSession) (map[string]interface{}, error) {
	success := signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)
	if success {
		attributes := make(map[string]interface{})
		for i, v := range signedAttributes.Proof.ADisclosed {
			// 0. attribute is private key of user and should never be disclosed
			attr := signedAttributes.Attributes[i-1]
			switch attr.Typename {
			case "string":
				attributes[attr.Name] = string(v.Bytes())
			case "float":
				bits := binary.BigEndian.Uint64(v.Bytes())
				attributes[attr.Name] = math.Float64frombits(bits)
			case "bool":
				attributes[attr.Name] = v.Int64() == 1
			default:
				attributes[attr.Name] = hex.EncodeToString(v.Bytes())
			}
		}
		return attributes, nil
	}
	return nil, fmt.Errorf("could not verify proof")
}
