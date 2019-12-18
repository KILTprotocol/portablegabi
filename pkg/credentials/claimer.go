package credentials

import (
	"fmt"
	"sort"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
)

func Find(slice []interface{}, val interface{}) (int, bool) {
	for i, item := range slice {
		if item == val {
			return i, true
		}
	}
	return -1, false
}

type UserIssuanceSession struct {
	Cb         *gabi.CredentialBuilder `json:"cb"`
	Attributes []Attribute             `json:"attributes"`
}

type Claimer struct {
	MasterSecret *big.Int `json:"MasterSecret"`
}

func NewUser(sysParams *gabi.SystemParameters) (*Claimer, error) {
	masterSecret, err := common.RandomBigInt(sysParams.Lm)
	if err != nil {
		return nil, err
	}
	return &Claimer{masterSecret}, nil
}

func (user *Claimer) RequestSignatureForClaim(issuerPubK *gabi.PublicKey, startMsg *StartSessionMsg, claim *Claim) (*UserIssuanceSession, *RequestAttestedClaim, error) {
	attributes := claim.ToAttributes()

	nonce, err := common.RandomBigInt(issuerPubK.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	cb := gabi.NewCredentialBuilder(issuerPubK, startMsg.Context, user.MasterSecret, nonce)
	commitMsg := cb.CommitToSecretAndProve(startMsg.Nonce)

	strippedAttrs := make([]*big.Int, len(attributes))
	for i, v := range attributes {
		strippedAttrs[i] = v.Value
	}

	return &UserIssuanceSession{
			cb,
			attributes,
		}, &RequestAttestedClaim{
			CommitMsg:  commitMsg,
			Attributes: strippedAttrs,
		}, nil
}

func (user *Claimer) BuildAttestedClaim(signature *gabi.IssueSignatureMessage, session *UserIssuanceSession) (*AttestedClaim, error) {
	strippedAttrs := make([]*big.Int, len(session.Attributes))
	for i, v := range session.Attributes {
		strippedAttrs[i] = v.Value
	}
	cred, err := session.Cb.ConstructCredential(signature, strippedAttrs)
	if err != nil {
		return nil, err
	}
	// TODO: store things which should be stored!? What should be stored?
	return &AttestedClaim{cred, session.Attributes}, nil
}

func (user *Claimer) RevealAttributes(pk *gabi.PublicKey, attestedClaim *AttestedClaim, reqAttributes *RequestDiscloseAttributes) (*DiscloseAttributes, error) {
	attestedClaim.Credential.Pk = pk
	sort.Slice(reqAttributes.DiscloseAttributes[:], func(i, j int) bool {
		return strings.Compare(reqAttributes.DiscloseAttributes[i], reqAttributes.DiscloseAttributes[j]) < 0
	})
	sort.Slice(attestedClaim.Attributes[:], func(i, j int) bool {
		return strings.Compare(attestedClaim.Attributes[i].Name, attestedClaim.Attributes[j].Name) < 0
	})
	attrIndexes := make([]int, len(reqAttributes.DiscloseAttributes))
	names := make([]string, len(attestedClaim.Attributes))
	types := make([]string, len(attestedClaim.Attributes))
	i := 0

	// assert: attestedClaim.Attributes and reqAttributes.DiscloseAttributes are sorted!
	for attrI, v := range attestedClaim.Attributes {
		if i < len(reqAttributes.DiscloseAttributes) && strings.Compare(reqAttributes.DiscloseAttributes[i], v.Name) == 0 {
			attrIndexes[i] = attrI + 1
			i++
		}
		names[attrI] = v.Name
		types[attrI] = v.Typename
	}
	if i == 0 {
		return nil, fmt.Errorf("attribute not found")
	}
	proof := attestedClaim.Credential.CreateDisclosureProof(attrIndexes, reqAttributes.Context, reqAttributes.Nonce)
	return &DiscloseAttributes{
		Proof: proof,
		Names: names,
		Types: types,
	}, nil
}
