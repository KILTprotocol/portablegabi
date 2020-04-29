// +build wasm

package wasm

import (
	"encoding/json"
	"syscall/js"
	"time"
)

// KeyLength sets the length of the used keys. Possible values are 1024, 2048, 4096
const (
	TimeFormat = time.RFC3339Nano
	DefaultKeyLength = 1024
)

// GoFunction is a function which can be transform it into a JSFunction
type GoFunction func(js.Value, []js.Value) (interface{}, error)

// JSFunction is a function which can be used from JS code.
type JSFunction func(js.Value, []js.Value) interface{}

// Callbacker takes a go function and wraps it, so that a callback is
// called. This makes is usable as a js interface function
func Callbacker(function GoFunction) JSFunction {
	return func(this js.Value, inputs []js.Value) interface{} {
		// the callback is the last argument, check that it's there and retrieve it
		if len(inputs) == 0 {
			panic("Callback argument is missing")
		}
		callback := inputs[len(inputs)-1]

		// call the actual function without the callback
		output, err := function(this, inputs[:len(inputs)-1])
		if err != nil {
			callback.Invoke(err.Error(), js.Null())
			return nil
		}
		// if there was no error try to convert some of the return values to js.Values
		switch x := output.(type) {
		case []interface{}:
			retValues := make([]interface{}, len(x))
			for i, e := range x {
				marshaledV, err := json.Marshal(e)
				if err != nil {
					callback.Invoke(err.Error(), js.Null())
					return nil
				}
				retValues[i] = string(marshaledV)
			}
			callback.Invoke(js.Null(), js.ValueOf(retValues))
		case map[string]interface{}:
			retValues := make(map[string]interface{})
			for k, v := range x {
				marshaledV, err := json.Marshal(v)
				if err != nil {
					callback.Invoke(err.Error(), js.Null())
					return nil
				}
				retValues[k] = string(marshaledV)
			}
			callback.Invoke(js.Null(), js.ValueOf(retValues))
		default:
			marshaledV, err := json.Marshal(output)
			if err != nil {
				callback.Invoke(err.Error(), js.Null())
				return nil
			}
			callback.Invoke(js.Null(), string(marshaledV))
		}
		return nil
	}
}
