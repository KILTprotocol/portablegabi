// Package portablegabi is used to wrap the gabi library into a wasm module.
package main

import (
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/pkg/wasm"
)

func main() {

	// expose all methods to the js environment. Use callbacker to transform the
	// return style methods to callback style methods.
	c := make(chan bool)
	js.Global().Set("genKeypair", js.FuncOf(wasm.Callbacker(wasm.GenKeypair)))
	js.Global().Set("revokeAttestation", js.FuncOf(wasm.Callbacker(wasm.RevokeAttestation)))
	js.Global().Set("startAttestationSession", js.FuncOf(wasm.Callbacker(wasm.StartAttestationSession)))
	js.Global().Set("issueAttestation", js.FuncOf(wasm.Callbacker(wasm.IssueAttestation)))
	js.Global().Set("genKey", js.FuncOf(wasm.Callbacker(wasm.GenKey)))
	js.Global().Set("requestAttestation", js.FuncOf(wasm.Callbacker(wasm.RequestAttestation)))
	js.Global().Set("buildCredential", js.FuncOf(wasm.Callbacker(wasm.BuildCredential)))
	js.Global().Set("revealAttributes", js.FuncOf(wasm.Callbacker(wasm.RevealAttributes)))
	js.Global().Set("startVerificationSession", js.FuncOf(wasm.Callbacker(wasm.StartVerificationSession)))
	js.Global().Set("verifyAttributes", js.FuncOf(wasm.Callbacker(wasm.VerifyAttributes)))

	<-c
}
