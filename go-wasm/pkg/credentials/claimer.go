package credentials

import (
	"errors"
	"fmt"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/tyler-smith/go-bip39"
)

// UserIssuanceSession stores information which are used only by the user during
// the attestation of claims
type UserIssuanceSession struct {
	Cb    *gabi.CredentialBuilder `json:"cb"`
	Claim Claim                   `json:"claim"`
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
		return nil, errors.New("seed to small")
	}
	maxKey := new(big.Int).Lsh(big.NewInt(1), sysParams.Lm)
	bigSeed := big.NewInt(0).SetBytes(seed)
	return &Claimer{new(big.Int).Mod(bigSeed, maxKey)}, nil
}

// RequestAttestationForClaim creates a RequestAttestedClaim and a UserIssuanceSession.
// The request should be sent to the attester.
func (user *Claimer) RequestAttestationForClaim(attesterPubK *gabi.PublicKey, startMsg *StartSessionMsg, claim Claim) (*UserIssuanceSession, *AttestedClaimRequest, error) {
	nonce, err := common.RandomBigInt(attesterPubK.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	cb := gabi.NewCredentialBuilder(attesterPubK, startMsg.Context, user.MasterSecret, nonce)
	commitMsg := cb.CommitToSecretAndProve(startMsg.Nonce)

	return &UserIssuanceSession{
			cb,
			claim,
		}, &AttestedClaimRequest{
			CommitMsg: commitMsg,
			Claim:     claim,
		}, nil
}

// BuildCredential uses the signature provided by the attester to build a
// new credential.
func (user *Claimer) BuildCredential(signature *gabi.IssueSignatureMessage, session *UserIssuanceSession) (*AttestedClaim, error) {
	attributes := session.Claim.ToAttributes()

	return NewAttestedClaim(session.Cb, attributes, signature)
}

// BuildPresentation reveals the attributes which are requested by the verifier.
func (user *Claimer) BuildPresentation(pk *gabi.PublicKey, attestedClaim *AttestedClaim, reqAttributes *PresentationRequest) (*PresentationResponse, error) {
	partialReq := reqAttributes.PartialPresentationRequest
	if len(partialReq.RequestedAttributes) < 1 {
		return nil, errors.New("requested attributes should not be empty")
	}
	if partialReq.ReqNonRevocationProof {
		witness := attestedClaim.Credential.NonRevocationWitness
		revKey, err := pk.RevocationKey()
		if err != nil {
			return nil, err
		}
		err = witness.Verify(revKey)
		if err != nil {
			return nil, err
		}
	}
	attrIndices, err := attestedClaim.getAttributeIndices(partialReq.RequestedAttributes)
	if err != nil {
		return nil, err
	}
	attestedClaim.Credential.Pk = pk
	proof, err := attestedClaim.Credential.CreateDisclosureProof(attrIndices,
		partialReq.ReqNonRevocationProof, reqAttributes.Context, reqAttributes.Nonce)
	if err != nil {
		return nil, err
	}
	return &PresentationResponse{Proof: *proof}, nil
}

// BuildCombinedPresentation combines multiple credentials and builds a combined
// proof for all credentials. Only credentials which contain the same secret can
// be combined.
func (user *Claimer) BuildCombinedPresentation(pubKs []*gabi.PublicKey, credentials []*AttestedClaim,
	reqAttributes *CombinedPresentationRequest) (*CombinedPresentationResponse, error) {
	if len(pubKs) != len(reqAttributes.PartialRequests) {
		return nil, fmt.Errorf("expected %d public keys, got %d", len(reqAttributes.PartialRequests), len(pubKs))
	} else if len(credentials) != len(reqAttributes.PartialRequests) {
		return nil, fmt.Errorf("expected %d attested claims, got %d", len(reqAttributes.PartialRequests), len(credentials))
	}
	proofBuilder := make([]gabi.ProofBuilder, len(reqAttributes.PartialRequests))

	for i, partialReq := range reqAttributes.PartialRequests {
		if len(partialReq.RequestedAttributes) < 1 {
			return nil, fmt.Errorf("requested attributes should not be empty for the %d. credential", i+1)
		}
		cred := credentials[i].Credential
		cred.Pk = pubKs[i]
		if partialReq.ReqNonRevocationProof {
			witness := cred.NonRevocationWitness
			revKey, err := pubKs[i].RevocationKey()
			if err != nil {
				return nil, err
			}
			err = witness.Verify(revKey)
			if err != nil {
				return nil, err
			}
		}
		attrIndices, err := credentials[i].getAttributeIndices(partialReq.RequestedAttributes)
		if err != nil {
			return nil, err
		}
		proofBuilder[i], err = cred.CreateDisclosureProofBuilder(attrIndices, partialReq.ReqNonRevocationProof)
		if err != nil {
			return nil, err
		}
	}
	builders := gabi.ProofBuilderList(proofBuilder)
	prooflist := builders.BuildProofList(reqAttributes.Context, reqAttributes.Nonce, false)

	return &CombinedPresentationResponse{Proof: prooflist}, nil
}
