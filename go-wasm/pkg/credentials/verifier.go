package credentials

import (
	"encoding/binary"
	"encoding/hex"
	"errors"
	"math"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
)

type (
	// VerifierSession stores information which is needed to verify the response of the claimer
	VerifierSession struct {
		Context               *big.Int `json:"context"`
		Nonce                 *big.Int `json:"nonce"`
		ReqNonRevocationProof bool     `json:"reqNonRevocationProof"`
		ReqMinIndex           uint64   `json:"reqMinIndex"`
	}

	CombinedVerifierSession struct {
		Context         *big.Int                     `json:"context"`
		Nonce           *big.Int                     `json:"nonce"`
		PartialRequests []PartialPresentationRequest `json:"partialRequests"`
	}
)

// RequestPresentation builds a message which request the specified attributes from a claimer.
// It returns a VerifierSession which is used to check the claimers response and RequestDiscloseAttributes
// which represents the message which should be send to the claimer
func RequestPresentation(sysParams *gabi.SystemParameters, discloseAttributes []string, requestNonRevProof bool, minIndex uint64) (*VerifierSession, *PresentationRequest) {
	context, _ := common.RandomBigInt(sysParams.Lh)
	nonce, _ := common.RandomBigInt(sysParams.Lh)
	return &VerifierSession{
			Context:               context,
			Nonce:                 nonce,
			ReqNonRevocationProof: requestNonRevProof,
			ReqMinIndex:           minIndex,
		}, &PresentationRequest{
			Context: context,
			PartialPresentationRequest: &PartialPresentationRequest{
				RequestedAttributes:   discloseAttributes,
				ReqNonRevocationProof: requestNonRevProof,
				ReqMinIndex:           minIndex,
			},
			Nonce: nonce,
		}
}

func RequestCombinedPresentation(sysParams *gabi.SystemParameters, partialRequests []PartialPresentationRequest) (*CombinedVerifierSession, *CombinedPresentationRequest) {
	context, _ := common.RandomBigInt(sysParams.Lh)
	nonce, _ := common.RandomBigInt(sysParams.Lh)
	return &CombinedVerifierSession{
			Context:         context,
			Nonce:           nonce,
			PartialRequests: partialRequests,
		}, &CombinedPresentationRequest{
			Context:         context,
			PartialRequests: partialRequests,
			Nonce:           nonce,
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

func checkAccumulatorInProof(issuerPubK *gabi.PublicKey, minIndex uint64, proof *gabi.ProofD) bool {
	if proof.HasNonRevocationProof() {
		revPubKey, err := issuerPubK.RevocationKey()
		if err != nil {
			return false
		}
		acc, err := proof.NonRevocationProof.SignedAccumulator.UnmarshalVerify(revPubKey)
		if err != nil {
			return false
		}
		return minIndex <= acc.Index
	}
	return false
}

func reconstructClaim(disclosedAttributes map[int]*big.Int, attributes []*Attribute) map[string]interface{} {
	claim := make(map[string]interface{})
	for i, v := range disclosedAttributes {
		// 0. attribute is private key of user and should never be disclosed
		attr := attributes[i-1]
		switch attr.Typename {
		case "string":
			setNestedValue(claim, attr.Name, string(v.Bytes()))
		case "float":
			bits := binary.BigEndian.Uint64(v.Bytes())
			setNestedValue(claim, attr.Name, math.Float64frombits(bits))
		case "bool":
			setNestedValue(claim, attr.Name, v.Int64() == 1)
		default:
			setNestedValue(claim, attr.Name, hex.EncodeToString(v.Bytes()))
		}
	}
	return claim

}

// VerifyPresentation verifies the response of a claimer and returns the disclosed attributes.
func VerifyPresentation(issuerPubK *gabi.PublicKey, signedAttributes *PresentationResponse, session *VerifierSession) (bool, map[string]interface{}, error) {
	success := !session.ReqNonRevocationProof || checkAccumulatorInProof(issuerPubK, session.ReqMinIndex, signedAttributes.Proof)
	success = success && signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)
	if success {
		return true, reconstructClaim(signedAttributes.Proof.ADisclosed, signedAttributes.Attributes), nil
	}
	return false, nil, nil
}

func VerifyCombinedPresentation(attesterPubKeys []*gabi.PublicKey, combinedPresentation *CombinedPresentationResponse, session *CombinedVerifierSession) (bool, []map[string]interface{}, error) {
	success := combinedPresentation.Proof.Verify(attesterPubKeys, session.Context, session.Nonce, false, nil)
	claims := make([]map[string]interface{}, len(combinedPresentation.Attributes))
	for i, genericP := range *combinedPresentation.Proof {
		if proofd, ok := genericP.(*gabi.ProofD); ok {
			partialReq := session.PartialRequests[i]
			claims[i] = reconstructClaim(proofd.ADisclosed, combinedPresentation.Attributes[i])
			validRevocationProof := checkAccumulatorInProof(attesterPubKeys[i], partialReq.ReqMinIndex, proofd)
			revocationOK := !partialReq.ReqNonRevocationProof || validRevocationProof
			success = success && revocationOK
		} else {
			return false, nil, errors.New("unsupported proof in prooflist")
		}
	}
	return success, claims, nil
}
