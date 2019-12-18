package credentials

import (
	"encoding/json"
	"io/ioutil"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

type StartSessionMsg struct {
	Nonce   *big.Int `json:"nonce"`
	Context *big.Int `json:"context"`
}

type RequestAttestedClaim struct {
	CommitMsg  *gabi.IssueCommitmentMessage `json:"commitMsg"`
	Attributes []*big.Int                   `json:"attributes"`
}

type RequestDiscloseAttributes struct {
	DiscloseAttributes []string `json:"discloseAttributes"`
	Context            *big.Int `json:"context"`
	Nonce              *big.Int `json:"nonce"`
}

type DiscloseAttributes struct {
	Proof *gabi.ProofD `json:"proof"`
	Names []string     `json:"names"`
	Types []string     `json:"types"`
}

func NewDisclosedAttributesFromFile(file string) *DiscloseAttributes {
	jsonData, err := ioutil.ReadFile(file)
	if err != nil {
		panic(err)
	}
	disclosedAttr := DiscloseAttributes{}

	err = json.Unmarshal([]byte(jsonData), &disclosedAttr)
	if err != nil {
		panic(err)
	}
	return &disclosedAttr
}
