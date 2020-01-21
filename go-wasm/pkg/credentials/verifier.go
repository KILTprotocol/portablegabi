package credentials

import (
	"errors"
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

	// CombinedVerifierSession stores the information for a combined presentation session.
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

// RequestCombinedPresentation request the disclosure of multiple different credentials from a user.
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

func setNestedValue(m map[string]interface{}, key string, value interface{}) error {
	parts := strings.Split(key, SEPARATOR)
	for _, v := range parts[:len(parts)-1] {
		if acc, ok := m[v]; ok {
			if accMap, ok := acc.(map[string]interface{}); ok {
				m = accMap
			} else {
				return errors.New("Could not set value (not a map)")
			}
		} else {
			old := m
			m = make(map[string]interface{})
			old[v] = m
		}
	}
	m[parts[len(parts)-1]] = value
	return nil
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

// VerifyPresentation verifies the response of a claimer and returns the disclosed attributes.
func VerifyPresentation(issuerPubK *gabi.PublicKey, signedAttributes *PresentationResponse, session *VerifierSession) (bool, map[string]interface{}, error) {
	success := !session.ReqNonRevocationProof || checkAccumulatorInProof(issuerPubK, session.ReqMinIndex, signedAttributes.Proof)
	success = success && signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)
	if success {
		claim, err := reconstructClaim(signedAttributes.Proof.ADisclosed, signedAttributes.Attributes)
		if err != nil {
			return false, nil, err
		}
		return true, claim, nil
	}
	return false, nil, nil
}

// VerifyCombinedPresentation verifies the response of a claimer and returns the presentations provided by the user.
func VerifyCombinedPresentation(attesterPubKeys []*gabi.PublicKey, combinedPresentation *CombinedPresentationResponse, session *CombinedVerifierSession) (bool, []map[string]interface{}, error) {
	success := combinedPresentation.Proof.Verify(attesterPubKeys, session.Context, session.Nonce, false, nil)
	if !success {
		return false, nil, nil
	}
	claims := make([]map[string]interface{}, len(combinedPresentation.Attributes))
	for i, genericP := range *combinedPresentation.Proof {
		// check each proof: revocation has to be ok and accumulator fresh enough
		if proofD, ok := genericP.(*gabi.ProofD); ok {
			partialReq := session.PartialRequests[i]
			claim, err := reconstructClaim(proofD.ADisclosed, combinedPresentation.Attributes[i])
			claims[i] = claim
			if err != nil {
				return false, nil, err
			}
			validRevocationProof := checkAccumulatorInProof(attesterPubKeys[i], partialReq.ReqMinIndex, proofD)
			revocationOK := !partialReq.ReqNonRevocationProof || validRevocationProof

			success = success && revocationOK
		} else {
			return false, nil, errors.New("unsupported proof in prooflist")
		}
	}
	return success, claims, nil
}
