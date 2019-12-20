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

// Claim contains the attributes the claimer claims to possess. Contents should
// be structures according to the specified CType.
type Claim struct {
	CType    string                 `json:"cType"`
	Contents map[string]interface{} `json:"contents"`
}

// Attribute describes an attribute. It specifies the name and the type of the
// attribute. It should not contain the specific value of the attribute since
// this struct will be send to the verifier.
type Attribute struct {
	Name     string `json:"name"`
	Typename string `json:"typename"`
}

// byName can be used to sort one array based on values of the second array
// specifically the Values are sorted by the attribute names.
type byName struct {
	Attributes []*Attribute
	Values     []*big.Int
}

func (av byName) Len() int { return len(av.Values) }
func (av byName) Less(i, j int) bool {
	return strings.Compare(av.Attributes[i].Name, av.Attributes[j].Name) < 0
}
func (av byName) Swap(i, j int) {
	av.Attributes[i], av.Attributes[j] = av.Attributes[j], av.Attributes[i]
	av.Values[i], av.Values[j] = av.Values[j], av.Values[i]
}

type nestedObject struct {
	prefix  string
	content map[string]interface{}
}

// ToAttributes transforms a claim struct to a list of attributes
func (claim *Claim) ToAttributes() ([]*Attribute, []*big.Int) {
	var attributes []*Attribute
	var values []*big.Int

	// TODO: nested attributes, array might not be a wise choice here (many memcopy ops?)
	attributes = append(attributes, &Attribute{
		"ctype",
		"string",
	})
	values = append(values, new(big.Int).SetBytes([]byte(claim.CType)))

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
				attributes = append(attributes, &Attribute{
					name,
					"string",
				})
				values = append(values, new(big.Int).SetBytes([]byte(str)))
			} else if f, ok := v.(float64); ok {
				var buf [8]byte
				binary.BigEndian.PutUint64(buf[:], math.Float64bits(f))
				attributes = append(attributes, &Attribute{
					name,
					"float",
				})
				values = append(values, new(big.Int).SetBytes(buf[:]))
			} else if f, ok := v.(bool); ok {
				var value *big.Int
				if f {
					value = new(big.Int).SetInt64(1)
				} else {
					value = new(big.Int).SetInt64(0)
				}
				attributes = append(attributes, &Attribute{
					name,
					"bool",
				})
				values = append(values, value)
			} else {
				panic("Unknown type")
			}
		}
	}
	sort.Sort(byName{attributes, values})

	return attributes, values
}

// AttestedClaim contains the Claim and the gabi.Credential. It can be used to
// disclose specific attributes to the verifier.
type AttestedClaim struct {
	Credential *gabi.Credential `json:"credential"`
	Claim      *Claim           `json:"claim"`
}
