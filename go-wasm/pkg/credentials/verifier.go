package credentials

import (
	"errors"
	"time"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/privacybydesign/gabi/revocation"
)

type (
	// VerifierSession stores information which is needed to verify the response of the claimer
	VerifierSession struct {
		Context               *big.Int  `json:"context"`
		Nonce                 *big.Int  `json:"nonce"`
		ReqNonRevocationProof bool      `json:"reqNonRevocationProof"`
		ReqUpdateAfter        time.Time `json:"reqUpdateAfter"`
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
func RequestPresentation(sysParams *gabi.SystemParameters, discloseAttributes []string,
	requestNonRevProof bool, updateAfter time.Time) (*VerifierSession, *PresentationRequest) {
	context, _ := common.RandomBigInt(sysParams.Lh)
	nonce, _ := common.RandomBigInt(sysParams.Lh)

	return &VerifierSession{
			Context:               context,
			Nonce:                 nonce,
			ReqNonRevocationProof: requestNonRevProof,
			ReqUpdateAfter:        updateAfter,
		}, &PresentationRequest{
			Context: context,
			PartialPresentationRequest: &PartialPresentationRequest{
				RequestedAttributes:   discloseAttributes,
				ReqNonRevocationProof: requestNonRevProof,
				ReqUpdateAfter:        updateAfter,
			},
			Nonce: nonce,
		}
}

// RequestCombinedPresentation request the disclosure of multiple different credentials from a user.
func RequestCombinedPresentation(sysParams *gabi.SystemParameters,
	partialRequests []PartialPresentationRequest) (*CombinedVerifierSession, *CombinedPresentationRequest) {
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

func checkAccumulatorInProof(issuerPubK *gabi.PublicKey, latestSignAcc *revocation.SignedAccumulator, reqUpdateAfter time.Time,
	proof *gabi.ProofD) (bool, error) {
	if proof.HasNonRevocationProof() {
		revPubKey, err := issuerPubK.RevocationKey()
		if err != nil {
			return false, nil
		}
		acc, err := proof.NonRevocationProof.SignedAccumulator.UnmarshalVerify(revPubKey)
		if err != nil {
			return false, nil
		}
		if acc.Time.Before(reqUpdateAfter) {
			latestAcc, err := latestSignAcc.UnmarshalVerify(revPubKey)
			if err != nil {
				return false, err
			}
			return latestAcc.Index == acc.Index, nil
		}
		return true, nil
	}
	return false, nil
}

func getValues(m map[int]*big.Int) []*big.Int {
	a := make([]*big.Int, len(m))
	i := 0
	for _, v := range m {
		a[i] = v
		i++
	}
	return a
}

// VerifyPresentation verifies the response of a claimer and returns the disclosed attributes.
func VerifyPresentation(issuerPubK *gabi.PublicKey, latestAcc *revocation.SignedAccumulator, signedAttributes *PresentationResponse, session *VerifierSession) (bool, Claim, error) {
	verified, err := checkAccumulatorInProof(issuerPubK, latestAcc, session.ReqUpdateAfter, &signedAttributes.Proof)
	if err != nil {
		return false, nil, err
	}
	success := !session.ReqNonRevocationProof || verified
	success = success && signedAttributes.Proof.Verify(issuerPubK, session.Context, session.Nonce, false)

	if success {
		attributes, err := BigIntsToAttributes(getValues(signedAttributes.Proof.ADisclosed))
		if err != nil {
			return false, nil, err
		}
		claim, err := newClaimFromAttribute(attributes)
		if err != nil {
			return false, nil, err
		}
		return true, claim, nil
	}
	return false, nil, nil
}

// VerifyCombinedPresentation verifies the response of a claimer and returns the presentations provided by the user.
func VerifyCombinedPresentation(attesterPubKeys []*gabi.PublicKey, latestAccs []*revocation.SignedAccumulator, combinedPresentation *CombinedPresentationResponse, session *CombinedVerifierSession) (bool, []Claim, error) {
	success := combinedPresentation.Proof.Verify(attesterPubKeys, session.Context, session.Nonce, false, nil)
	if !success {
		return false, nil, nil
	}
	claims := make([]Claim, len(combinedPresentation.Proof))
	for i, genericP := range combinedPresentation.Proof {
		// check each proof: revocation has to be ok and accumulator fresh enough
		if proofD, ok := genericP.(*gabi.ProofD); ok {
			partialReq := session.PartialRequests[i]
			attributes, err := BigIntsToAttributes(getValues(proofD.ADisclosed))
			if err != nil {
				return false, nil, err
			}
			claim, err := newClaimFromAttribute(attributes)
			if err != nil {
				return false, nil, err
			}
			claims[i] = claim
			if err != nil {
				return false, nil, err
			}
			validRevocationProof, err := checkAccumulatorInProof(attesterPubKeys[i], latestAccs[i], partialReq.ReqUpdateAfter, proofD)
			if err != nil {
				return false, nil, err
			}
			revocationOK := !partialReq.ReqNonRevocationProof || validRevocationProof

			success = success && revocationOK
		} else {
			return false, nil, errors.New("unsupported proof in prooflist")
		}
	}
	return success, claims, nil
}
