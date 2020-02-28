// +build wasm

package wasm

import (
	"encoding/json"
	"errors"
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/credentials"
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
)

// GenKeypair generates a keypair for the attester. It takes no inputs and
// returns a list containing the private key as the fist element and the public
// key as the second element. If the key generation fails, an error is returned.
func GenKeypair(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 2 {
		return nil, errors.New("missing inputs")
	}

	attester, err := credentials.NewAttester(SysParams, inputs[0].Int(), int64(inputs[1].Int()))
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"privateKey": attester.PrivateKey,
		"publicKey":  attester.PublicKey,
	}, nil
}

// StartAttestationSession starts the attestation process. It takes the private
// key of the attester as first input and the public key as second input. This
// method returns a session object, which must be used as an argument for
// issueAttestation and a message for the claimer
func StartAttestationSession(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 2 {
		return nil, errors.New("missing inputs")
	}

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	if err := json.Unmarshal([]byte(inputs[0].String()), attester.PrivateKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), attester.PublicKey); err != nil {
		return nil, err
	}

	session, msg, err := attester.InitiateAttestation()
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"session": session,
		"message": msg,
	}, nil
}

// IssueAttestation takes the private key of the attester as first input and the
// public key as second input. As third input the session (created using the
// startAttestationSession method) is expected and the fourth input is the
// request for attestion which is was send to the attester by the claimer.
func IssueAttestation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 5 {
		return nil, errors.New("missing inputs")
	}

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	session := &credentials.AttesterSession{}
	request := &credentials.AttestedClaimRequest{}
	update := &revocation.Update{}
	if err := json.Unmarshal([]byte(inputs[0].String()), attester.PrivateKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), attester.PublicKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[3].String()), request); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[4].String()), update); err != nil {
		return nil, err
	}
	sig, witness, err := attester.AttestClaim(request, session, update)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"attestation": sig,
		"witness":     witness,
	}, nil
}

// CreateAccumulator creates a new accumulator which can be used to revoke
// attestations
func CreateAccumulator(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 2 {
		return nil, errors.New("missing inputs")
	}

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	if err := json.Unmarshal([]byte(inputs[0].String()), attester.PrivateKey); err != nil {
		return nil, errors.New("Error in private key")
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), attester.PublicKey); err != nil {
		return nil, errors.New("Error in private key")
	}
	return attester.CreateAccumulator()
}

// RevokeAttestation removes the attestation witness from the given accumulator.
func RevokeAttestation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 4 {
		return nil, errors.New("missing inputs")
	}

	attester := &credentials.Attester{
		PrivateKey: &gabi.PrivateKey{},
		PublicKey:  &gabi.PublicKey{},
	}
	update := &revocation.Update{}
	witnesses := []*revocation.Witness{}

	if err := json.Unmarshal([]byte(inputs[0].String()), attester.PrivateKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), attester.PublicKey); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), update); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[3].String()), &witnesses); err != nil {
		return nil, err
	}
	return attester.RevokeAttestation(update, witnesses)
}

// GetAccumulatorIndex verifies the update and returns the current accumulator index.
func GetAccumulatorIndex(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 2 {
		return 0, errors.New("missing inputs")
	}

	pubKey := gabi.PublicKey{}
	update := revocation.Update{}

	if err := json.Unmarshal([]byte(inputs[0].String()), &pubKey); err != nil {
		return 0, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), &update); err != nil {
		return 0, err
	}

	revPubKey, err := pubKey.RevocationKey()
	if err != nil {
		return 0, err
	}
	acc, err := update.Verify(revPubKey)
	if err != nil {
		return 0, err
	}

	return acc.Index, nil
}

// GetAccumulatorTimestamp verifies the update and returns the current accumulator Timestamp.
func GetAccumulatorTimestamp(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 2 {
		return 0, errors.New("missing inputs")
	}

	pubKey := gabi.PublicKey{}
	update := revocation.Update{}

	if err := json.Unmarshal([]byte(inputs[0].String()), &pubKey); err != nil {
		return 0, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), &update); err != nil {
		return 0, err
	}

	revPubKey, err := pubKey.RevocationKey()
	if err != nil {
		return 0, err
	}
	acc, err := update.Verify(revPubKey)
	if err != nil {
		return 0, err
	}

	return acc.Time, nil
}
