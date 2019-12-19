package credentials

import (
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

// StartSessionMsg is send from the attester to the claimer to start the
// attestation session
type StartSessionMsg struct {
	Nonce   *big.Int `json:"nonce"`
	Context *big.Int `json:"context"`
}

// RequestAttestedClaim is send from the claimer to the attester as a response
// to the StartSessionMsg. It contains the values which should get attested.
type RequestAttestedClaim struct {
	CommitMsg *gabi.IssueCommitmentMessage `json:"commitMsg"`
	Values    []*big.Int                   `json:"values"`
}

// RequestDiscloseAttributes is send from the verifier to the claimer. The
// verifier request specific attributes from the claimer.
type RequestDiscloseAttributes struct {
	DiscloseAttributes []string `json:"discloseAttributes"`
	Context            *big.Int `json:"context"`
	Nonce              *big.Int `json:"nonce"`
}

// DiscloseAttributes represents the message that is send from the claimer to the verifier in order to disclose attributes.
// All disclosed attributes are inside the Proof. There should be no attributes elsewhere.
type DiscloseAttributes struct {
	Proof      *gabi.ProofD `json:"proof"`
	Attributes []*Attribute `json:"attributes"`
}
