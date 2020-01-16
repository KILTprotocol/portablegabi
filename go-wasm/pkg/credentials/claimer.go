package credentials

import (
	"errors"
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
		return nil, errors.New("seed to small")
	}
	maxKey := new(big.Int).Lsh(big.NewInt(1), sysParams.Lm)
	bigSeed := big.NewInt(0).SetBytes(seed)
	return &Claimer{new(big.Int).Mod(bigSeed, maxKey)}, nil
}

// RequestAttestationForClaim creates a RequestAttestedClaim and a UserIssuanceSession.
// The request should be send to the attester.
func (user *Claimer) RequestAttestationForClaim(attesterPubK *gabi.PublicKey, startMsg *StartSessionMsg, claim *Claim) (*UserIssuanceSession, *AttestedClaimRequest, error) {
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
		}, &AttestedClaimRequest{
			CommitMsg: commitMsg,
			Values:    values,
		}, nil
}

// BuildCredential uses the signature provided by the attester to build a
// new credential.
func (user *Claimer) BuildCredential(signature *gabi.IssueSignatureMessage, session *UserIssuanceSession) (*AttestedClaim, error) {
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
		return nil, errors.New("update to old")
	}
	err = witness.Update(pubRevKey, update)
	if err != nil {
		return nil, err
	}
	return attestation, nil
}

func ensureAccumulator(pk *gabi.PublicKey, witness *revocation.Witness) error {
	revPK, err := pk.RevocationKey()
	if err != nil {
		return err
	}
	acc, err := witness.SignedAccumulator.UnmarshalVerify(revPK)
	if err != nil {
		return err
	}
	witness.Accumulator = acc
	return nil
}

func attributeIndicesFromPresentationRequest(req *PartialPresentationRequest,
	credential *AttestedClaim) ([]int, []*Attribute, error) {
	sort.Slice(req.RequestedAttributes[:], func(i, j int) bool {
		return strings.Compare(req.RequestedAttributes[i], req.RequestedAttributes[j]) < 0
	})

	attrIndexes := make([]int, len(req.RequestedAttributes))
	attributes, _ := credential.Claim.ToAttributes()
	i := 0

	// assert: attestedClaim.Attributes and req.RequestedAttributes are sorted!
	for attrI, v := range attributes {
		if i < len(req.RequestedAttributes) && strings.Compare(req.RequestedAttributes[i], v.Name) == 0 {
			attrIndexes[i] = attrI + 1
			i++
		}
		attributes[attrI] = v
	}
	if i == 0 {
		return nil, nil, errors.New("attribute not found")
	}
	return attrIndexes, attributes, nil
}

// BuildPresentation reveals the attributes which are requested by the verifier.
func (user *Claimer) BuildPresentation(pk *gabi.PublicKey, attestedClaim *AttestedClaim, reqAttributes *PresentationRequest) (*PresentationResponse, error) {
	partialReq := reqAttributes.PartialPresentationRequest
	if partialReq.ReqNonRevocationProof {
		witness := attestedClaim.Credential.NonRevocationWitness
		err := ensureAccumulator(pk, witness)
		if err != nil {
			return nil, err
		}
	}
	attrIndices, attributes, err := attributeIndicesFromPresentationRequest(partialReq, attestedClaim)
	if err != nil {
		return nil, err
	}
	attestedClaim.Credential.Pk = pk
	proof, err := attestedClaim.Credential.CreateDisclosureProof(attrIndices,
		partialReq.ReqNonRevocationProof, reqAttributes.Context, reqAttributes.Nonce)
	if err != nil {
		return nil, err
	}
	return &PresentationResponse{
		Proof:      proof,
		Attributes: attributes,
	}, nil
}

func (user *Claimer) BuildCombinedPresentation(pubKs []*gabi.PublicKey, credentials []*AttestedClaim,
	reqAttributes *CombinedPresentationRequest) (*CombinedPresentationResponse, error) {
	if len(pubKs) != len(reqAttributes.PartialRequests) {
		return nil, errors.New("wrong amount of public keys")
	} else if len(credentials) != len(reqAttributes.PartialRequests) {
		return nil, errors.New("wrong amount of attested claims")
	}
	proofBuilder := make([]gabi.ProofBuilder, len(reqAttributes.PartialRequests))
	partialResponses := make([]PartialPresentationResponse, len(reqAttributes.PartialRequests))
	for i, partialReq := range reqAttributes.PartialRequests {
		cred := credentials[i].Credential
		cred.Pk = pubKs[i]
		if partialReq.ReqNonRevocationProof {
			witness := cred.NonRevocationWitness
			err := ensureAccumulator(pubKs[i], witness)
			if err != nil {
				return nil, err
			}
		}
		attrIndices, attributes, err := attributeIndicesFromPresentationRequest(&partialReq, credentials[i])
		if err != nil {
			return nil, err
		}
		proofBuilder[i], err = cred.CreateDisclosureProofBuilder(attrIndices, partialReq.ReqNonRevocationProof)
		if err != nil {
			return nil, err
		}
		partialResponses[i] = attributes
	}
	builders := gabi.ProofBuilderList(proofBuilder)
	prooflist := builders.BuildProofList(reqAttributes.Context, reqAttributes.Nonce, false)

	return &CombinedPresentationResponse{
		Proof:      &prooflist,
		Attributes: partialResponses,
	}, nil
}
