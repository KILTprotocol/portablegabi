package credentials

import (
	"encoding/binary"
	"encoding/hex"
	"math"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
)

// VerifierSession stores information which is needed to verify the response of the claimer
type VerifierSession struct {
	Context               *big.Int `json:"context"`
	Nonce                 *big.Int `json:"nonce"`
	ReqNonRevocationProof bool     `json:"reqNonRevocationProof"`
	ReqMinIndex           uint64   `json:"reqMinIndex"`
}

// RequestAttributes builds a message which request the specified attributes from a claimer.
// It returns a VerifierSession which is used to check the claimers response and RequestDiscloseAttributes
// which represents the message which should be send to the claimer
func RequestAttributes(sysParams *gabi.SystemParameters, discloseAttributes []string, requestNonRevProof bool, minIndex uint64) (*VerifierSession, *RequestDiscloseAttributes) {
	context, _ := common.RandomBigInt(sysParams.Lh)
	nonce, _ := common.RandomBigInt(sysParams.Lh)
	return &VerifierSession{
			Context:               context,
			Nonce:                 nonce,
			ReqNonRevocationProof: requestNonRevProof,
			ReqMinIndex:           minIndex,
		}, &RequestDiscloseAttributes{
			Context:               context,
			DiscloseAttributes:    discloseAttributes,
			Nonce:                 nonce,
			ReqNonRevocationProof: requestNonRevProof,
			ReqMinIndex:           minIndex,
		}
}

func setNestedValue(m map[string]interface{}, key string, value interface{}) {
	parts := strings.Split(key, SEPARATOR)
	if len(parts) == 0 {
		panic("invalid key")
	}
	for _, v := range parts[:len(parts)-1] {
		if acc, ok := m[v]; ok {
			if accMap, ok := acc.(map[string]interface{}); ok {
				m = accMap
			} else {
				panic("Value is not a map!")
			}
		} else {
			old := m
			m = make(map[string]interface{})
			old[v] = m
		}
	}
	m[parts[len(parts)-1]] = value
}

func ensureAccumulator(issuerPubK *gabi.PublicKey, session *VerifierSession, proof *gabi.ProofD) bool {
	if proof.HasNonRevocationProof() {
		revPubKey, err := issuerPubK.RevocationKey()
		if err != nil {
			return false
		}
		acc, err := proof.NonRevocationProof.SignedAccumulator.UnmarshalVerify(revPubKey)
		if err != nil {
			return false
		}
		return session.ReqMinIndex <= acc.Index
	}
	return false
}

// VerifyPresentation verifies the response of a claimer and returns the disclosed attributes.
func VerifyPresentation(issuerPubK *gabi.PublicKey, signedAttributes *DiscloseAttributes, session *VerifierSession) (bool, map[string]interface{}, error) {
	success := !session.ReqNonRevocationProof || ensureAccumulator(issuerPubK, session, signedAttributes.Proof)
	success = success && signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)
	if success {
		attributes := make(map[string]interface{})
		for i, v := range signedAttributes.Proof.ADisclosed {
			// 0. attribute is private key of user and should never be disclosed
			attr := signedAttributes.Attributes[i-1]
			switch attr.Typename {
			case "string":
				setNestedValue(attributes, attr.Name, string(v.Bytes()))
			case "float":
				bits := binary.BigEndian.Uint64(v.Bytes())
				setNestedValue(attributes, attr.Name, math.Float64frombits(bits))
			case "bool":
				setNestedValue(attributes, attr.Name, v.Int64() == 1)
			default:
				setNestedValue(attributes, attr.Name, hex.EncodeToString(v.Bytes()))
			}
		}
		return true, attributes, nil
	}
	return false, nil, nil
}
