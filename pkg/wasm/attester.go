package wasm

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/pkg/credentials"
	"github.com/privacybydesign/gabi"
)

// GenKeypair generates a keypair for the attester. It takes no inputs and
// returns a list containing the private key as the fist element and the public
// key as the second element. If the key generation fails, an error is returned.
func GenKeypair(this js.Value, inputs []js.Value) ([]interface{}, error) {
	issuer, err := credentials.NewIssuer(SysParams, inputs[0].Int(), int64(inputs[1].Int()))
	return []interface{}{
		issuer.PrivateKey,
		issuer.PublicKey,
	}, err
}

// RevokeAttestation revokes an attestation and is not implemented yet.
func RevokeAttestation(this js.Value, inputs []js.Value) ([]interface{}, error) {
	return nil, fmt.Errorf("Not implemented")
}

// StartAttestationSession starts the attestation process. It takes the private
// key of the attester as first input and the public key as second input. This
// method returns a session object, which must be used as an argument for
// issueAttestation and a message for the claimer
func StartAttestationSession(this js.Value, inputs []js.Value) ([]interface{}, error) {
	issuer := &credentials.Issuer{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	if err := json.Unmarshal([]byte(inputs[0].String()), issuer.PrivateKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), issuer.PublicKey); err != nil {
		return nil, err
	}

	session, msg, err := issuer.StartSigningSession()
	if err != nil {
		return nil, err
	}
	return []interface{}{
		session,
		msg,
	}, nil
}

// IssueAttestation takes the private key of the attester as first input and the
// public key as second input. As third input the session (created using the
// startAttestationSession method) is expected and the fourth input is the
// request for attestion which is was send to the attester by the claimer.
func IssueAttestation(this js.Value, inputs []js.Value) ([]interface{}, error) {
	issuer := &credentials.Issuer{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	session := &credentials.IssuerIssuanceSession{}
	request := &credentials.RequestAttestedClaim{}
	if err := json.Unmarshal([]byte(inputs[0].String()), issuer.PrivateKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), issuer.PublicKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[3].String()), request); err != nil {
		return nil, err
	}
	attest, err := issuer.AttestClaim(request, session)
	return []interface{}{attest}, err
}
