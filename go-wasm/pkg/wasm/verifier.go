// +build wasm

package wasm

import (
	"encoding/json"
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/credentials"
	"github.com/privacybydesign/gabi"
)

// RequestPresentation creates a message which request the discloser of
// specific attributes. As input this method takes the names of the requested
// attributes. This message takes a variable number of inputs. If no error
// occurs a session object and a message for the claimer is returned.
func RequestPresentation(this js.Value, inputs []js.Value) (interface{}, error) {

	// ignore the first two values (ReqRevProof-Flag & min Accumulator index)
	attrs := make([]string, len(inputs)-2)
	for i, v := range inputs[2:] {
		attrs[i] = v.String()
	}

	session, msg := credentials.RequestPresentation(SysParams, attrs, inputs[0].Bool(), (uint64)(inputs[1].Int()))

	return map[string]interface{}{
		"session": session,
		"message": msg,
	}, nil
}

func RequestCombinedPresentation(this js.Value, inputs []js.Value) (interface{}, error) {
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
	proof := &credentials.PresentationResponse{}
	session := &credentials.VerifierSession{}
	attesterPubKey := &gabi.PublicKey{}
	if err := json.Unmarshal([]byte(inputs[0].String()), proof); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), attesterPubKey); err != nil {
		return nil, err
	}
	verified, rebuildClaim, err := credentials.VerifyPresentation(attesterPubKey, proof, session)
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
	proof := &credentials.CombinedPresentationResponse{}
	session := &credentials.CombinedVerifierSession{}
	attesterPubKeys := []*gabi.PublicKey{}
	if err := json.Unmarshal([]byte(inputs[0].String()), proof); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), &attesterPubKeys); err != nil {
		return nil, err
	}
	verified, rebuildClaim, err := credentials.VerifyCombinedPresentation(attesterPubKeys, proof, session)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"claim":    rebuildClaim,
		"verified": verified,
	}, nil
}
