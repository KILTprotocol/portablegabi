package credentials

import (
	"container/list"
	"encoding/binary"
	"math"
	"sort"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

type Claim struct {
	CType    string                 `json:"cType"`
	Contents map[string]interface{} `json:"contents"`
}

type Attribute struct {
	Value    *big.Int `json:"value"`
	Name     string   `json:"name"`
	Typename string   `json:"typename"`
}

type nestedObject struct {
	prefix  string
	content map[string]interface{}
}

// ToAttributes transforms a claim struct to a list of attributes
func (claim *Claim) ToAttributes() []Attribute {
	var attributes []Attribute

	// TODO: nested attributes, array might not be a wise choice here (many memcopy ops?)
	attributes = append(attributes, Attribute{
		new(big.Int).SetBytes([]byte(claim.CType)),
		"ctype",
		"string",
	})

	queue := list.New()
	queue.PushBack(&nestedObject{
		prefix:  "contents",
		content: claim.Contents,
	})
	for queue.Len() > 0 {
		elem := queue.Front()
		queue.Remove(elem)
		jsonObj := elem.Value.(*nestedObject)
		for n, v := range jsonObj.content {
			name := jsonObj.prefix + "." + n
			if f, ok := v.(map[string]interface{}); ok {
				queue.PushBack(&nestedObject{
					prefix:  name,
					content: f,
				})
			} else if str, ok := v.(string); ok {
				attributes = append(attributes, Attribute{
					new(big.Int).SetBytes([]byte(str)),
					name,
					"string",
				})
			} else if f, ok := v.(float64); ok {
				var buf [8]byte
				binary.BigEndian.PutUint64(buf[:], math.Float64bits(f))

				attributes = append(attributes, Attribute{
					new(big.Int).SetBytes(buf[:]),
					name,
					"float",
				})
			} else if f, ok := v.(bool); ok {
				var value *big.Int
				if f {
					value = new(big.Int).SetInt64(1)
				} else {
					value = new(big.Int).SetInt64(0)
				}
				attributes = append(attributes, Attribute{
					value,
					name,
					"bool",
				})
			} else {
				panic("Unknown type")
			}
		}
	}
	sort.Slice(attributes[:], func(i, j int) bool {
		return strings.Compare(attributes[i].Name, attributes[j].Name) < 0
	})
	return attributes
}

type AttestedClaim struct {
	Credential *gabi.Credential `json:"credential"`
	Attributes []Attribute      `json:"attributes"`
}
