package credentials

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

type VerifierSession struct {
	Context *big.Int `json:"context"`
	Nonce   *big.Int `json:"nonce"`
}

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

func VerifyPresentation(issuerPubK *gabi.PublicKey,
	signedAttributes *DiscloseAttributes, session *VerifierSession) (map[string]interface{}, error) {
	success := signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)
	if success {
		attributes := make(map[string]interface{})
		for i, v := range signedAttributes.Proof.ADisclosed {
			// 0. attribute is private key of user and should never be disclosed
			readIndex := i - 1
			switch signedAttributes.Types[readIndex] {
			case "string":
				attributes[signedAttributes.Names[readIndex]] = string(v.Bytes())
			case "float":
				bits := binary.BigEndian.Uint64(v.Bytes())
				attributes[signedAttributes.Names[readIndex]] = math.Float64frombits(bits)
			case "bool":
				attributes[signedAttributes.Names[readIndex]] = v.Int64() == 1
			default:
				attributes[signedAttributes.Names[readIndex]] = hex.EncodeToString(v.Bytes())
			}
		}
		return attributes, nil
	}
	return nil, fmt.Errorf("could not verify proof")
}
