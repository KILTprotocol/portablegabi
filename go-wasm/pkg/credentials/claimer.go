package credentials

import (
	"fmt"
	"sort"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/privacybydesign/gabi/revocation"
	"github.com/tyler-smith/go-bip39"
)

// UserIssuanceSession stores information which are used only by the user during
// the attestation of claims
type UserIssuanceSession struct {
	Cb    *gabi.CredentialBuilder `json:"cb"`
	Claim *Claim                  `json:"claim"`
}

// Claimer contains information about the claimer.
type Claimer struct {
	MasterSecret *big.Int `json:"MasterSecret"`
}

// NewClaimer generates a new secret and returns a Claimer
func NewClaimer(sysParams *gabi.SystemParameters) (*Claimer, error) {
	masterSecret, err := common.RandomBigInt(sysParams.Lm)
	if err != nil {
		return nil, err
	}
	return &Claimer{masterSecret}, nil
}

// ClaimerFromMnemonic derives a secret from a given mnemonic
func ClaimerFromMnemonic(sysParams *gabi.SystemParameters, mnemonic string, password string) (*Claimer, error) {
	// Generate a Bip39 HD wallet for the mnemonic and a user supplied password
	seed := bip39.NewSeed(mnemonic, password)
	if uint(len(seed)) < sysParams.Lm/8 {
		return nil, fmt.Errorf("seed to small")
	}
	maxKey := new(big.Int).Lsh(big.NewInt(1), sysParams.Lm)
	bigSeed := big.NewInt(0).SetBytes(seed)
	return &Claimer{new(big.Int).Mod(bigSeed, maxKey)}, nil
}

// RequestSignatureForClaim creates a RequestAttestedClaim and a UserIssuanceSession.
// The request should be send to the attester.
func (user *Claimer) RequestSignatureForClaim(attesterPubK *gabi.PublicKey, startMsg *StartSessionMsg, claim *Claim) (*UserIssuanceSession, *RequestAttestedClaim, error) {
	_, values := claim.ToAttributes()

	nonce, err := common.RandomBigInt(attesterPubK.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	cb := gabi.NewCredentialBuilder(attesterPubK, startMsg.Context, user.MasterSecret, nonce)
	commitMsg := cb.CommitToSecretAndProve(startMsg.Nonce)

	return &UserIssuanceSession{
			cb,
			claim,
		}, &RequestAttestedClaim{
			CommitMsg: commitMsg,
			Values:    values,
		}, nil
}

// BuildAttestedClaim uses the signature provided by the attester to build a
// new credential.
func (user *Claimer) BuildAttestedClaim(signature *gabi.IssueSignatureMessage, session *UserIssuanceSession) (*AttestedClaim, error) {
	_, values := session.Claim.ToAttributes()

	cred, err := session.Cb.ConstructCredential(signature, values)
	if err != nil {
		return nil, err
	}
	// TODO: store things which should be stored!? What should be stored?
	return &AttestedClaim{cred, session.Claim}, nil
}

// UpdateCredential updates the non revocation witness using the provided update.
func (user *Claimer) UpdateCredential(attesterPubK *gabi.PublicKey, attestation *AttestedClaim, update *revocation.Update) (*AttestedClaim, error) {
	pubRevKey, err := attesterPubK.RevocationKey()
	if err != nil {
		return nil, err
	}
	witness := attestation.Credential.NonRevocationWitness
	if witness.Accumulator == nil {
		witness.Accumulator, err = witness.SignedAccumulator.UnmarshalVerify(pubRevKey)
		if err != nil {
			return nil, err
		}
	}
	index := witness.Accumulator.Index
	if index < update.Events[0].Index-1 {
		return nil, fmt.Errorf("update to old")
	}
	err = witness.Update(pubRevKey, update)
	if err != nil {
		return nil, err
	}
	return attestation, nil
}

// RevealAttributes reveals the attributes which are requested by the verifier.
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
	proof, err := attestedClaim.Credential.CreateDisclosureProof(attrIndexes, reqAttributes.ReqNonRevocationProof, reqAttributes.Context, reqAttributes.Nonce)
	if err != nil {
		return nil, err
	}
	return &DiscloseAttributes{
		Proof:      proof,
		Attributes: attributes,
	}, nil
}
