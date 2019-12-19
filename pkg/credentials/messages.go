package credentials

import (
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

type StartSessionMsg struct {
	Nonce   *big.Int `json:"nonce"`
	Context *big.Int `json:"context"`
}

type RequestAttestedClaim struct {
	CommitMsg *gabi.IssueCommitmentMessage `json:"commitMsg"`
	Values    []*big.Int                   `json:"values"`
}

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
