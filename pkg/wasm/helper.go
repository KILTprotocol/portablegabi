// +build wasm
package wasm

import (
	"encoding/json"
	"syscall/js"

	"github.com/privacybydesign/gabi"
)

// KeyLength sets the length of the used keys. Possible values are 1024, 2048, 4096
const KeyLength = 1024

// SysParams are the currently used system parameters for the cryptographic primitives
var SysParams, _ = gabi.DefaultSystemParameters[KeyLength]

// GoFunction is a function which can be transformit into a JSFunction
type GoFunction func(js.Value, []js.Value) ([]interface{}, error)

// JSFunction is a function which can be used from JS code.
type JSFunction func(js.Value, []js.Value) interface{}

// Callbacker takes a go function and wraps it, so that a callback is
// called. This makes is usable as a js interface function
func Callbacker(function GoFunction) JSFunction {
	return func(this js.Value, inputs []js.Value) interface{} {
		callback := inputs[len(inputs)-1:][0]
		output, err := function(this, inputs)
		if err != nil {
			callback.Invoke(err.Error(), js.Null())
			return nil
		}
		if len(output) > 1 {
			retValues := make([]interface{}, len(output))
			for i, e := range output {
				marshaledV, err := json.Marshal(e)
				if err != nil {
					callback.Invoke(err.Error(), js.Null())
					return nil
				}
				retValues[i] = string(marshaledV)
			}
			callback.Invoke(js.Null(), js.ValueOf(retValues))
		} else {
			marshaledV, err := json.Marshal(output[0])
			if err != nil {
				callback.Invoke(err.Error(), js.Null())
				return nil
			}
			callback.Invoke(js.Null(), string(marshaledV))
		}
		return nil
	}
}
