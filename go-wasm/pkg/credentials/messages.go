package credentials

import (
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

type (
	// StartSessionMsg is send from the attester to the claimer to start the
	// attestation session
	StartSessionMsg struct {
		Nonce   *big.Int `json:"nonce"`
		Context *big.Int `json:"context"`
	}

	// AttestedClaimRequest is send from the claimer to the attester as a response
	// to the StartSessionMsg. It contains the values which should get attested.
	AttestedClaimRequest struct {
		CommitMsg *gabi.IssueCommitmentMessage `json:"commitMsg"`
		Values    []*big.Int                   `json:"values"`
	}

	// PresentationRequest is send from the verifier to the claimer. The
	// verifier request specific attributes from the claimer.
	PresentationRequest struct {
		PartialPresentationRequest *PartialPresentationRequest `json:"partialPresentationRequest"`
		Context                    *big.Int                    `json:"context"`
		Nonce                      *big.Int                    `json:"nonce"`
	}

	// PartialPresentationRequest contains partial information for a combined disclosure request
	PartialPresentationRequest struct {
		RequestedAttributes   []string `json:"requestedAttributes"`
		ReqNonRevocationProof bool     `json:"reqNonRevocationProof"`
		ReqMinIndex           uint64   `json:"reqMinIndex"`
	}

	// CombinedPresentationRequest request multiple credentials from a claimer
	CombinedPresentationRequest struct {
		PartialRequests []PartialPresentationRequest `json:"partialPresentationRequests"`
		Context         *big.Int                     `json:"context"`
		Nonce           *big.Int                     `json:"nonce"`
	}

	// PartialPresentationResponse contains a description of all disclosed attributes
	PartialPresentationResponse []*Attribute

	// PresentationResponse represents the message that is send from the claimer to the verifier in order to disclose attributes.
	// All disclosed attributes are inside the Proof. There should be no attributes elsewhere.
	PresentationResponse struct {
		Proof      *gabi.ProofD                `json:"proof"`
		Attributes PartialPresentationResponse `json:"attributes"`
	}

	// CombinedPresentationResponse contains a list of proofs and a list of
	// partialPresentationResponses. It can be used to reconstruct multiple
	// claims.
	CombinedPresentationResponse struct {
		Proof      *gabi.ProofList               `json:"prooflist"`
		Attributes []PartialPresentationResponse `json:"partialPresentations"`
	}
)
