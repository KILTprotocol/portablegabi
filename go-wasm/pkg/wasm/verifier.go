// +build wasm

package wasm

import (
	"encoding/json"
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/pkg/credentials"
	"github.com/privacybydesign/gabi"
)

// StartVerificationSession creates a message which request the discloser of
// specific attributes. As input this method takes the names of the requested
// attributes. This message takes a variable number of inputs. If no error
// occurres a session object and a message for the claimer is returned.
func StartVerificationSession(this js.Value, inputs []js.Value) (interface{}, error) {
	// ignore last value
	attrs := make([]string, len(inputs)-1)
	for i, v := range inputs {
		if i < len(attrs) {
			attrs[i] = v.String()
		}
	}
	session, msg := credentials.RequestAttributes(SysParams, attrs)

	return map[string]interface{}{
		"session": session,
		"message": msg,
	}, nil
}

// VerifyAttributes verifies that the proof of the claimer is valid. As input
// this method takes the proof, a session object (created using
// startVerificationSession) and the public key of the attester which attested
// the claim
func VerifyAttributes(this js.Value, inputs []js.Value) (interface{}, error) {
	proof := &credentials.DiscloseAttributes{}
	session := &credentials.VerifierSession{}
	issuerPubKey := &gabi.PublicKey{}
	if err := json.Unmarshal([]byte(inputs[0].String()), proof); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[1].String()), session); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(inputs[2].String()), issuerPubKey); err != nil {
		return nil, err
	}
	rebuildClaim, err := credentials.VerifyPresentation(issuerPubKey, proof, session)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"claim":    rebuildClaim,
		"verified": true,
	}, nil
}
