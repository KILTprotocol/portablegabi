package credentials

import (
	"time"

	"github.com/privacybydesign/gabi"
)

type AttesterSession struct {
	GabiIssuer *gabi.Issuer `json:"GabiIssuer"`
}

type Attester struct {
	PrivateKey *gabi.PrivateKey   `json:"PrivateKey"`
	PublicKey  *gabi.PublicKey    `json:"PublicKey"`
}

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

func (attester *Attester) StartSigningSession() (*AttesterSession, *StartSessionMsg, error) {
	// why is here a context?
	context, err := gabi.RandomBigInt(attester.PublicKey.Params.Lh)
	if err != nil {
		return nil, nil, err
	}
	gabiIssuer := gabi.NewIssuer(attester.PrivateKey, attester.PublicKey, context)

	nonce, err := gabi.RandomBigInt(attester.PublicKey.Params.Lstatzk)
	if err != nil {
		return nil, nil, err
	}
	// send request attributes to sign
	return &AttesterSession{gabiIssuer}, &StartSessionMsg{
		Context: context,
		Nonce:   nonce,
	}, nil
}

func (attester *Attester) AttestClaim(reqCred *RequestAttestedClaim, session *AttesterSession) (*gabi.IssueSignatureMessage, error) {
	return session.GabiIssuer.IssueSignature(reqCred.CommitMsg.U, reqCred.Values, reqCred.CommitMsg.Nonce2)
}
