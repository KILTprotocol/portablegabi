// +build wasm

// Package portablegabi is used to wrap the gabi library into a wasm module.
package main

import (
	"syscall/js"

	"github.com/KILTprotocol/portablegabi/go-wasm/pkg/wasm"
)

func main() {

	// expose all methods to the js environment. Use callbacker to transform the
	// return style methods to callback style methods.
	c := make(chan bool)

	methods := make(map[string]js.Func)
	methods["genKeypair"] = js.FuncOf(wasm.Callbacker(wasm.GenKeypair))
	methods["createAccumulator"] = js.FuncOf(wasm.Callbacker(wasm.CreateAccumulator))
	methods["startAttestationSession"] = js.FuncOf(wasm.Callbacker(wasm.StartAttestationSession))
	methods["issueAttestation"] = js.FuncOf(wasm.Callbacker(wasm.IssueAttestation))
	methods["revokeAttestation"] = js.FuncOf(wasm.Callbacker(wasm.RevokeAttestation))

	methods["genKey"] = js.FuncOf(wasm.Callbacker(wasm.GenKey))
	methods["keyFromMnemonic"] = js.FuncOf(wasm.Callbacker(wasm.KeyFromMnemonic))
	methods["requestAttestation"] = js.FuncOf(wasm.Callbacker(wasm.RequestAttestation))
	methods["buildCredential"] = js.FuncOf(wasm.Callbacker(wasm.BuildCredential))
	methods["updateCredential"] = js.FuncOf(wasm.Callbacker(wasm.UpdateCredential))
	methods["buildPresentation"] = js.FuncOf(wasm.Callbacker(wasm.BuildPresentation))
	methods["buildCombinedPresentation"] = js.FuncOf(wasm.Callbacker(wasm.BuildCombinedPresentation))

	methods["requestPresentation"] = js.FuncOf(wasm.Callbacker(wasm.RequestPresentation))
	methods["requestCombinedPresentation"] = js.FuncOf(wasm.Callbacker(wasm.RequestCombinedPresentation))
	methods["verifyPresentation"] = js.FuncOf(wasm.Callbacker(wasm.VerifyPresentation))
	methods["verifyCombinedPresentation"] = js.FuncOf(wasm.Callbacker(wasm.VerifyCombinedPresentation))

	methods["GetAccumulatorIndex"] = js.FuncOf(wasm.Callbacker(wasm.GetAccumulatorIndex))

	for k, v := range methods {
		js.Global().Set(k, v)
		defer v.Release()
	}

	<-c
}
