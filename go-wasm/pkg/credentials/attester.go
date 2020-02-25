package credentials

import (
	"errors"
	"time"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/privacybydesign/gabi/revocation"
)

// AttesterSession contains information needed by the attester to create an
// attestation
type AttesterSession struct {
	Context *big.Int `json:"context"`
	Nonce   *big.Int `json:"nonce"`
}

// Attester can attest claims.
type Attester struct {
	PrivateKey *gabi.PrivateKey `json:"PrivateKey"`
	PublicKey  *gabi.PublicKey  `json:"PublicKey"`
}

// NewAttester creates a new key pair for an attester
func NewAttester(sysParams *gabi.SystemParameters, attributeCount int, periodOfValidity int64) (*Attester, error) {
	parsedExpiryDate := time.Now().Add(time.Duration(periodOfValidity))
	attesterPrivK, attesterPubK, err := gabi.GenerateKeyPair(sysParams, attributeCount, 0, parsedExpiryDate)
	if err != nil {
		return nil, err
	}

	return &Attester{
		PrivateKey: attesterPrivK,
		PublicKey:  attesterPubK,
	}, nil
}

// InitiateAttestation starts the attestation process. It returns an
// AttesterSession, which contains information the attester needs for creating
// the attestation and StartSessionMsg which represents the message for the claimer
func (attester *Attester) InitiateAttestation() (*AttesterSession, *StartSessionMsg, error) {
	// TODO: Calculate correct context
	context, err := common.RandomBigInt(attester.PublicKey.Params.Lh)
	if err != nil {
		return nil, nil, err
	}

	nonce, err := common.RandomBigInt(attester.PublicKey.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	// send request attributes to sign
	return &AttesterSession{
			Context: context,
			Nonce:   nonce,
		}, &StartSessionMsg{
			Context: context,
			Nonce:   nonce,
		}, nil
}

// AttestClaim issues an attestation for the given claim. It takes the
// RequestAttestedClaim which was send by the claimer and an AttesterSession.
// It returns an gabi.IssueSignatureMessage which should be sent to the claimer.
func (attester *Attester) AttestClaim(reqCred *AttestedClaimRequest, session *AttesterSession, update *revocation.Update) (*gabi.IssueSignatureMessage, *revocation.Witness, error) {
	ok := reqCred.CommitMsg.Proofs.Verify([]*gabi.PublicKey{attester.PublicKey}, session.Context, session.Nonce, false, nil)
	if !ok {
		return nil, nil, errors.New("commit message could not be verified")
	}

	attributes := reqCred.Claim.ToAttributes()
	marshaledAttr, err := attributesToBigInts(attributes)
	if err != nil {
		return nil, nil, err
	}
	if len(attester.PublicKey.R) < len(marshaledAttr) {
		return nil, nil, errors.New("got too many attributes to sign")
	}
	revpk, err := attester.PublicKey.RevocationKey()
	if err != nil {
		return nil, nil, err
	}
	acc, err := update.SignedAccumulator.UnmarshalVerify(revpk)
	if err != nil {
		return nil, nil, err
	}
	witness, err := attester.PrivateKey.RevocationGenerateWitness(acc)
	if err != nil {
		return nil, nil, err
	}
	witness.SignedAccumulator = update.SignedAccumulator
	gabiIssuer := &gabi.Issuer{Pk: attester.PublicKey, Sk: attester.PrivateKey, Context: session.Context}
	sig, err := gabiIssuer.IssueSignature(reqCred.CommitMsg.U, marshaledAttr, witness, reqCred.CommitMsg.Nonce2)
	if err != nil {
		return nil, nil, err
	}
	return sig, witness, nil
}

// CreateAccumulator creates a new accumulator which can be used to revoke
// attestations
func (attester *Attester) CreateAccumulator() (*revocation.Update, error) {
	revKey, err := attester.PrivateKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	return revocation.NewAccumulator(revKey)
}

// RevokeAttestation removes the attestation witness from the given accumulator.
func (attester *Attester) RevokeAttestation(update *revocation.Update, witnesses []*revocation.Witness) (*revocation.Update, error) {
	// get key pair and accumulator
	pubK, err := attester.PublicKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	privK, err := attester.PrivateKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	acc, err := update.SignedAccumulator.UnmarshalVerify(pubK)
	if err != nil {
		return nil, err
	}

	// calculate new accumulator which does not contain the witness
	previousEvent := update.Events[len(update.Events)-1]
	newAcc := acc
	events := make([]*revocation.Event, len(witnesses))
	for i, w := range witnesses {
		newAcc, previousEvent, err = newAcc.Remove(privK, w.E, previousEvent)
		if err != nil {
			return nil, err
		}
		events[i] = previousEvent
	}

	// build update
	signNewAcc, err := newAcc.Sign(privK)
	if err != nil {
		return nil, err
	}
	return &revocation.Update{
		SignedAccumulator: signNewAcc,
		Events:            events,
	}, nil
}
