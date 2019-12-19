package credentials

import (
	"time"

	"github.com/privacybydesign/gabi"
)

type IssuerIssuanceSession struct {
	GabiIssuer *gabi.Issuer `json:"GabiIssuer"`
}

type Issuer struct {
	PrivateKey *gabi.PrivateKey   `json:"PrivateKey"`
	PublicKey  *gabi.PublicKey    `json:"PublicKey"`
}

func NewIssuer(sysParams *gabi.SystemParameters, attributeCount int, periodOfValidity int64) (*Issuer, error) {
	parsedExpiryDate := time.Now().Add(time.Duration(periodOfValidity))
	issuerPrivK, issuerPubK, err := gabi.GenerateKeyPair(sysParams, attributeCount, 0, parsedExpiryDate)
	if err != nil {
		return nil, err
	}

	return &Issuer{
		PrivateKey: issuerPrivK,
		PublicKey:  issuerPubK,
	}, nil
}

func (issuer *Issuer) StartSigningSession() (*IssuerIssuanceSession, *StartSessionMsg, error) {
	// why is here a context?
	context, err := gabi.RandomBigInt(issuer.PublicKey.Params.Lh)
	if err != nil {
		return nil, nil, err
	}
	gabiIssuer := gabi.NewIssuer(issuer.PrivateKey, issuer.PublicKey, context)

	nonce, err := gabi.RandomBigInt(issuer.PublicKey.Params.Lstatzk)
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
	return session.GabiIssuer.IssueSignature(reqCred.CommitMsg.U, reqCred.Attributes, reqCred.CommitMsg.Nonce2)
}
