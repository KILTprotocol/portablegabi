package credentials

import (
	"fmt"
	"sort"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
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
	Cb    *gabi.CredentialBuilder `json:"cb"`
	Claim *Claim                  `json:"claim"`
}

type Claimer struct {
	MasterSecret *big.Int `json:"MasterSecret"`
}

func NewUser(sysParams *gabi.SystemParameters) (*Claimer, error) {
	masterSecret, err := gabi.RandomBigInt(sysParams.Lm)
	if err != nil {
		return nil, err
	}
	return &Claimer{masterSecret}, nil
}

func (user *Claimer) RequestSignatureForClaim(issuerPubK *gabi.PublicKey, startMsg *StartSessionMsg, claim *Claim) (*UserIssuanceSession, *RequestAttestedClaim, error) {
	_, values := claim.ToAttributes()

	nonce, err := gabi.RandomBigInt(issuerPubK.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	cb := gabi.NewCredentialBuilder(issuerPubK, startMsg.Context, user.MasterSecret, nonce)
	commitMsg := cb.CommitToSecretAndProve(startMsg.Nonce)

	return &UserIssuanceSession{
			cb,
			claim,
		}, &RequestAttestedClaim{
			CommitMsg: commitMsg,
			Values:    values,
		}, nil
}

func (user *Claimer) BuildAttestedClaim(signature *gabi.IssueSignatureMessage, session *UserIssuanceSession) (*AttestedClaim, error) {
	_, values := session.Claim.ToAttributes()

	cred, err := session.Cb.ConstructCredential(signature, values)
	if err != nil {
		return nil, err
	}
	// TODO: store things which should be stored!? What should be stored?
	return &AttestedClaim{cred, session.Claim}, nil
}

func (user *Claimer) RevealAttributes(pk *gabi.PublicKey, attestedClaim *AttestedClaim, reqAttributes *RequestDiscloseAttributes) (*DiscloseAttributes, error) {
	attestedClaim.Credential.Pk = pk
	sort.Slice(reqAttributes.DiscloseAttributes[:], func(i, j int) bool {
		return strings.Compare(reqAttributes.DiscloseAttributes[i], reqAttributes.DiscloseAttributes[j]) < 0
	})

	attrIndexes := make([]int, len(reqAttributes.DiscloseAttributes))
	attributes, _ := attestedClaim.Claim.ToAttributes()
	i := 0

	// assert: attestedClaim.Attributes and reqAttributes.DiscloseAttributes are sorted!
	for attrI, v := range attributes {
		if i < len(reqAttributes.DiscloseAttributes) && strings.Compare(reqAttributes.DiscloseAttributes[i], v.Name) == 0 {
			attrIndexes[i] = attrI + 1
			i++
		}
		attributes[attrI] = v
	}
	if i == 0 {
		return nil, fmt.Errorf("attribute not found")
	}
	proof := attestedClaim.Credential.CreateDisclosureProof(attrIndexes, reqAttributes.Context, reqAttributes.Nonce)
	return &DiscloseAttributes{
		Proof:      proof,
		Attributes: attributes,
	}, nil
}
