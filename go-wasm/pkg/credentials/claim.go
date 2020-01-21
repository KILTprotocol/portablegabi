package credentials

import (
	"container/list"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"reflect"
	"sort"
	"strings"

	"github.com/privacybydesign/gabi"
	"github.com/privacybydesign/gabi/big"
)

// SEPARATOR is used to separate JSON keys from each other.
const SEPARATOR = "."

type (
	// Claim contains the attributes the claimer claims to possess. Contents should
	// be structures according to the specified CType.
	Claim struct {
		CType    string                 `json:"cType"`
		Contents map[string]interface{} `json:"contents"`
	}

	// Attribute describes an attribute. It specifies the name and the type of the
	// attribute. It should not contain the specific value of the attribute since
	// this struct will be send to the verifier.
	Attribute struct {
		Name     string `json:"name"`
		Typename string `json:"typename"`
	}

	// AttestedClaim contains the Claim and the gabi.Credential. It can be used to
	// disclose specific attributes to the verifier.
	AttestedClaim struct {
		Credential *gabi.Credential `json:"credential"`
		Claim      *Claim           `json:"claim"`
	}

	// nestedObject is used to describe a nested object inside a claim.
	nestedObject struct {
		prefix  string
		content map[string]interface{}
	}

	// byName can be used to sort one array based on values of the second array
	// specifically the Values are sorted by the attribute names.
	byName struct {
		Attributes []*Attribute
		Values     []*big.Int
	}
)

func (av byName) Len() int { return len(av.Values) }
func (av byName) Less(i, j int) bool {
	return strings.Compare(av.Attributes[i].Name, av.Attributes[j].Name) < 0
}
func (av byName) Swap(i, j int) {
	av.Attributes[i], av.Attributes[j] = av.Attributes[j], av.Attributes[i]
	av.Values[i], av.Values[j] = av.Values[j], av.Values[i]
}

// ToAttributes transforms a claim struct to a list of attributes. The returned list is sorted by name.
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
	// go through every property of the claim, transform it into an int and put it into the attributes array
	for queue.Len() > 0 {
		elem := queue.Front()
		queue.Remove(elem)
		jsonObj := elem.Value.(*nestedObject)
		for n, v := range jsonObj.content {
			name := jsonObj.prefix + SEPARATOR + n

			reflected := reflect.ValueOf(v)
			switch reflected.Kind() {
			case reflect.Map:
				if m, ok := v.(map[string]interface{}); ok {
					queue.PushBack(&nestedObject{
						prefix:  name,
						content: m,
					})
				} else {
					panic(fmt.Sprintf("unsupported map type %T", v))
				}
			case reflect.Slice, reflect.Array:
				marshaledV, err := json.Marshal(v)
				if err != nil {
					panic("could not marshal array")
				}
				attributes = append(attributes, &Attribute{
					name,
					"array",
				})
				values = append(values, new(big.Int).SetBytes([]byte(marshaledV)))
			case reflect.String:
				attributes = append(attributes, &Attribute{
					name,
					"string",
				})
				values = append(values, new(big.Int).SetBytes([]byte(reflected.String())))
			case reflect.Float32, reflect.Float64:
				var buf [8]byte
				binary.BigEndian.PutUint64(buf[:], math.Float64bits(reflected.Float()))
				attributes = append(attributes, &Attribute{
					name,
					"float",
				})
				values = append(values, new(big.Int).SetBytes(buf[:]))
			case reflect.Bool:
				var value *big.Int
				if reflected.Bool() {
					value = new(big.Int).SetInt64(1)
				} else {
					value = new(big.Int).SetInt64(0)
				}
				attributes = append(attributes, &Attribute{
					name,
					"bool",
				})
				values = append(values, value)
			default:
				panic(fmt.Sprintf("unknown type %T", v))
			}
		}
	}
	sort.Sort(byName{attributes, values})

	return attributes, values
}

func escapedSplit(s string, sep rune) []string {
	backslash := '\\'
	var slices []string
	lastSplit := 0
	backslashes := 0

	if sep == backslash {
		panic("sep must not equal '\\'")
	}
	for i, r := range s {
		if r == sep && (backslashes == 0 || backslashes%2 == 0) {
			// if the rune matches the separator and is not escaped create a new slice
			slices = append(slices, s[lastSplit:i])
			// i + 1 because we want to skip the `sep`
			lastSplit = i + 1
		} else if r == backslash {
			// if we encountered a backslash, count it!
			backslashes++
		} else {
			backslashes = 0
		}
	}
	slices = append(slices, s[lastSplit:len(s)])
	return slices
}

func unescape(s string, escaped rune) string {
	newS := strings.ReplaceAll(s, `\`+string(escaped), string(escaped))
	newS = strings.ReplaceAll(newS, `\\`, `\`)
	return newS
}

func setNestedValue(m map[string]interface{}, key string, value interface{}) error {
	parts := escapedSplit(key, []rune(SEPARATOR)[0])
	for _, v := range parts[:len(parts)-1] {
		key := unescape(v, []rune(SEPARATOR)[0])
		if acc, ok := m[key]; ok {
			if accMap, ok := acc.(map[string]interface{}); ok {
				m = accMap
			} else {
				return errors.New("Could not set value (not a map)")
			}
		} else {
			old := m
			m = make(map[string]interface{})
			old[key] = m
		}
	}
	key = unescape(parts[len(parts)-1], []rune(SEPARATOR)[0])
	m[key] = value
	return nil
}

func reconstructClaim(disclosedAttributes map[int]*big.Int, attributes []*Attribute) (map[string]interface{}, error) {
	claim := make(map[string]interface{})
	for i, v := range disclosedAttributes {
		// 0. attribute is private key of user and should never be disclosed
		attr := attributes[i-1]
		var err error
		switch attr.Typename {
		case "string":
			err = setNestedValue(claim, attr.Name, string(v.Bytes()))
		case "float":
			bytes := v.Bytes()
			// a float requires at least 8 bytes.
			if len(bytes) < 8 {
				return nil, fmt.Errorf("invalid big.Int for %q float value", attr.Name)
			}
			bits := binary.BigEndian.Uint64(bytes)
			err = setNestedValue(claim, attr.Name, math.Float64frombits(bits))
		case "bool":
			err = setNestedValue(claim, attr.Name, v.Int64() != 0)
		case "array":
			var array []interface{}
			err = json.Unmarshal(v.Bytes(), &array)
			if err == nil {
				err = setNestedValue(claim, attr.Name, array)
			}
		default:
			err = setNestedValue(claim, attr.Name, hex.EncodeToString(v.Bytes()))
		}
		if err != nil {
			return nil, err
		}
	}
	return claim, nil
}
