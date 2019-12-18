package credentials

import (
	"time"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/pkg/common"
	"github.com/privacybydesign/gabi/revocation"
)

type IssuerIssuanceSession struct {
	GabiIssuer *gabi.Issuer `json:"GabiIssuer"`
}

type Issuer struct {
	PrivateKey *gabi.PrivateKey   `json:"PrivateKey"`
	PublicKey  *gabi.PublicKey    `json:"PublicKey"`
	Acc        *revocation.Update `json:"Acc"`
}

func NewIssuer(sysParams *gabi.SystemParameters, attributeCount int, periodOfValidity int64) (*Issuer, error) {
	parsedExpiryDate := time.Now().Add(time.Duration(periodOfValidity))
	issuerPrivK, issuerPubK, err := gabi.GenerateKeyPair(sysParams, attributeCount, 0, parsedExpiryDate)
	if err != nil {
		return nil, err
	}

	// create new accumulator
	revkey, err := issuerPrivK.RevocationKey()
	if err != nil {
		return nil, err
	}
	update, err := revocation.NewAccumulator(revkey)
	if err != nil {
		return nil, err
	}
	return &Issuer{
		PrivateKey: issuerPrivK,
		PublicKey:  issuerPubK,
		Acc:        update,
	}, nil
}

func (issuer *Issuer) StartSigningSession() (*IssuerIssuanceSession, *StartSessionMsg, error) {
	// why is here a context?
	context, err := common.RandomBigInt(issuer.PublicKey.Params.Lh)
	if err != nil {
		return nil, nil, err
	}
	gabiIssuer := gabi.NewIssuer(issuer.PrivateKey, issuer.PublicKey, context)

	nonce, err := common.RandomBigInt(issuer.PublicKey.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	// send request attributes to sign
	return &IssuerIssuanceSession{gabiIssuer}, &StartSessionMsg{
		Context: context,
		Nonce:   nonce,
	}, nil
}

func (issuer *Issuer) AttestClaim(reqCred *RequestAttestedClaim, session *IssuerIssuanceSession) (*gabi.IssueSignatureMessage, error) {
	revK, err := issuer.PublicKey.RevocationKey()
	if err != nil {
		return nil, err
	}
	acc, err := issuer.Acc.SignedAccumulator.UnmarshalVerify(revK)
	if err != nil {
		return nil, err
	}
	witness, err := issuer.PrivateKey.RevocationGenerateWitness(acc)
	if err != nil {
		return nil, err
	}
	return session.GabiIssuer.IssueSignature(reqCred.CommitMsg.U, reqCred.Attributes, witness.E, reqCred.CommitMsg.Nonce2)
}
