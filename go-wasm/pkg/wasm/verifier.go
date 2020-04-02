// +build wasm

package wasm

import (
	"encoding/json"
	"errors"
	"fmt"
	"syscall/js"
	"time"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/credentials"
	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/revocation"
)

// RequestPresentation creates a message which request the discloser of
// specific attributes. As input this method takes the names of the requested
// attributes. This message takes a variable number of inputs. If no error
// occurs a session object and a message for the claimer is returned.
func RequestPresentation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 3 {
		return nil, errors.New("missing inputs")
	}
	var requestedAttributes []string
	if err := json.Unmarshal([]byte(inputs[2].String()), &requestedAttributes); err != nil {
		return nil, err
	}
	updateAfter, err := time.Parse(TimeFormat, inputs[1].String())
	if err != nil {
		return nil, err
	}
	session, msg := credentials.RequestPresentation(SysParams, requestedAttributes, inputs[0].Bool(), updateAfter)

	return map[string]interface{}{
		"session": session,
		"message": msg,
	}, nil
}

func RequestCombinedPresentation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 1 {
		return nil, errors.New("missing inputs")
	}

	// first two inputs are check-revocation-flag and minimum required revocation index
	var sessionArgs []credentials.PartialPresentationRequest

	if err := json.Unmarshal([]byte(inputs[0].String()), &sessionArgs); err != nil {
		return nil, err
	}

	session, msg := credentials.RequestCombinedPresentation(SysParams, sessionArgs)

	return map[string]interface{}{
		"session": session,
		"message": msg,
	}, nil
}

// VerifyPresentation verifies that the proof of the claimer is valid. As input
// this method takes the proof, a session object (created using
// startVerificationSession) and the public key of the attester which attested
// the claim
func VerifyPresentation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 4 {
		return nil, errors.New("missing inputs")
	}

	proof := &credentials.PresentationResponse{}
	session := &credentials.VerifierSession{}
	attesterPubKey := &gabi.PublicKey{}
	update := &revocation.Update{}
	if err := json.Unmarshal([]byte(inputs[0].String()), proof); err != nil {
		return nil, fmt.Errorf("could not parse string: '%s' into credentials.PresentationResponse", inputs[0].String())
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), session); err != nil {
		return nil, fmt.Errorf("could not parse string: '%s' into credentials.VerifierSession", inputs[1].String())
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), attesterPubKey); err != nil {
		return nil, fmt.Errorf("could not parse string: '%s' into gabi.PublicKey", inputs[2].String())
	}
	if err := json.Unmarshal([]byte(inputs[3].String()), update); err != nil {
		return nil, fmt.Errorf("could not parse string: '%s' into revocation.Update", inputs[2].String())
	}
	verified, rebuildClaim, err := credentials.VerifyPresentation(attesterPubKey, update.SignedAccumulator, proof, session)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"claim":    rebuildClaim,
		"verified": verified,
	}, nil
}

// VerifyCombinedPresentation verifies that the proof of the claimer is valid. As input
// this method takes the proof, a session object (created using
// startVerificationSession) and the public key of the attester which attested
// the claim
func VerifyCombinedPresentation(this js.Value, inputs []js.Value) (interface{}, error) {
	if len(inputs) < 4 {
		return nil, errors.New("missing inputs")
	}

	proof := &credentials.CombinedPresentationResponse{}
	session := &credentials.CombinedVerifierSession{}
	attesterPubKeys := []*gabi.PublicKey{}
	updates := []*revocation.Update{}
	if err := json.Unmarshal([]byte(inputs[0].String()), proof); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), &attesterPubKeys); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[3].String()), &updates); err != nil {
		return nil, err
	}
	signedAccs := make([]*revocation.SignedAccumulator, len(updates))
	for i, u := range updates {
		signedAccs[i] = u.SignedAccumulator
	}

	verified, rebuildClaims, err := credentials.VerifyCombinedPresentation(attesterPubKeys,
		signedAccs, proof, session)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"claims":   rebuildClaims,
		"verified": verified,
	}, nil
}
