package credentials

import (
	"errors"
	"time"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/privacybydesign/gabi/revocation"
)

// AttesterSession contains information needed by the attester to create an
// attestation
type AttesterSession struct {
	GabiIssuer *gabi.Issuer `json:"GabiIssuer"`
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
	// why is here a context?
	context, err := common.RandomBigInt(attester.PublicKey.Params.Lh)
	if err != nil {
		return nil, nil, err
	}
	gabiIssuer := gabi.NewIssuer(attester.PrivateKey, attester.PublicKey, context)

	nonce, err := common.RandomBigInt(attester.PublicKey.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	// send request attributes to sign
	return &AttesterSession{gabiIssuer}, &StartSessionMsg{
		Context: context,
		Nonce:   nonce,
	}, nil
}

// AttestClaim issues an attestation for the given claim. It takes the
// RequestAttestedClaim which was send by the claimer and an AttesterSession.
// It returns an gabi.IssueSignatureMessage which should be send to the claimer.
func (attester *Attester) AttestClaim(reqCred *RequestAttestedClaim, session *AttesterSession, update *revocation.Update) (*gabi.IssueSignatureMessage, error) {
	if len(attester.PublicKey.R) < len(reqCred.Values) {
		return nil, errors.New("got too many attributes to sign")
	}
	revpk, err := attester.PublicKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	acc, err := update.SignedAccumulator.UnmarshalVerify(revpk)
	if err != nil {
		return nil, err
	}
	witness, err := attester.PrivateKey.RevocationGenerateWitness(acc)
	if err != nil {
		return nil, err
	}
	witness.Accumulator = acc
	witness.SignedAccumulator = update.SignedAccumulator

	return session.GabiIssuer.IssueSignature(reqCred.CommitMsg.U, reqCred.Values, witness, reqCred.CommitMsg.Nonce2)
}

// CreateAccumulator creates a new accumulator which can be used to revoke
// attestations
func (attester *Attester) CreateAccumulator() (*revocation.Update, error) {
	revKey, err := attester.PrivateKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	accUpdate, err := revocation.NewAccumulator(revKey)
	if err != nil {
		return nil, err
	}
	return accUpdate, nil
}

// RevokeAttestation removes the attestation witness from the given accumulator.
func (attester *Attester) RevokeAttestation(update *revocation.Update, witness *revocation.Witness) (*revocation.Update, error) {
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

	return acc.Remove(privK, witness.E, update.Events[0])
}
