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
	"github.com/privacybydesign/gabi/revocation"
)

// Separator is used to separate JSON keys from each other.
const Separator = "."

// MagicByte is used to prevent a big.Int to truncate leading zeros.
const MagicByte = byte(0xFF)

type (

	// AttestedClaim contains the Claim and the gabi.Credential. It can be used to
	// disclose specific attributes to the verifier.
	AttestedClaim struct {
		Credential *gabi.Credential `json:"credential"`
		Claim      Claim            `json:"claim"`
	}

	// Claim contains the attributes the claimer claims to possess. Contents should
	// be structures according to the specified ctype.
	//
	// A claim represents any valid json data. Claims are represented using a
	// map[string]interface{}. In order to build a credential from a claim, the
	// claim needs to be transformed into an array of attributes. This is done using
	// the following scheme:
	// 1. go through the claim (map[string]interface{})
	//    for each simple time or array: transform the value into bytes and store
	//    it together with type and path (inside the json "tree").
	//    We receive a list of attributes
	// 2. transform each of these attributes into a big.Int
	//    big.Int := bytes(Len(Name)|Name|len(Type)|type|len(value)|value)
	Claim map[string]interface{}

	// Attribute describes an attribute. It specifies the name and the type of the
	// attribute. It should not contain the specific value of the attribute since
	// this struct will be send to the verifier.
	Attribute struct {
		Name     string `json:"name"`
		Typename string `json:"typename"`
		Value    []byte `json:"value"`
	}

	// nestedObject is used to describe a nested object inside a claim.
	nestedObject struct {
		prefix  string
		content Claim
	}
)

// NewAttestedClaim instantiates a new AttestedClaim.
func NewAttestedClaim(cb *gabi.CredentialBuilder, attributes []*Attribute, signature *gabi.IssueSignatureMessage) (*AttestedClaim, error) {
	claim, err := newClaimFromAttribute(attributes)
	if err != nil {
		return nil, err
	}
	bInts, err := attributesToBigInts(attributes)
	if err != nil {
		return nil, err
	}
	cred, err := cb.ConstructCredential(signature, bInts)
	if err != nil {
		return nil, err
	}
	return &AttestedClaim{
		Credential: cred,
		Claim:      claim,
	}, nil
}

func (attestedClaim *AttestedClaim) getAttributeIndices(reqAttributes []string) ([]int, error) {
	// make sure attributes are unique
	reqAttributes, _ = sortRemoveDuplicates(reqAttributes)

	indices := make([]int, len(reqAttributes))
	attributes, err := attestedClaim.getAttributes()
	if err != nil {
		return nil, err
	}

	i := 0
	// assert: attestedClaim.Attributes and reqAttributes are sorted!
	for attrI, v := range attributes {
		if i < len(reqAttributes) && strings.Compare(reqAttributes[i], v.Name) == 0 {
			// first attribute inside the attestedClaim is the secret key.
			// the real attributes start at index 1
			indices[i] = attrI + 1
			i++
		}
	}

	if i < len(reqAttributes) {
		return nil, fmt.Errorf("could not find attribute with name '%s'", reqAttributes[i])
	}
	return indices, nil
}

// getRawAttributes returns a list of all attributes stored inside the credential.
func (attestedClaim *AttestedClaim) getRawAttributes() []*big.Int {
	return attestedClaim.Credential.Attributes[1:]
}

// getAttributes returns a list of all attributes stored inside the credential.
func (attestedClaim *AttestedClaim) getAttributes() ([]*Attribute, error) {
	bInts := attestedClaim.getRawAttributes()
	attributes, err := BigIntsToAttributes(bInts)
	if err != nil {
		return nil, err
	}
	sorted := sort.SliceIsSorted(attributes, func(p, q int) bool {
		return strings.Compare(attributes[p].Name, attributes[q].Name) < 0
	})
	if !sorted {
		return nil, errors.New("expected attributes inside credential to be sorted")
	}
	return attributes, nil
}

// Update updates the non revocation witness using the provided update.
func (attestedClaim *AttestedClaim) Update(attesterPubK *gabi.PublicKey, update *revocation.Update) error {
	pubRevKey, err := attesterPubK.RevocationKey()
	if err != nil {
		return err
	}
	witness := attestedClaim.Credential.NonRevocationWitness

	err = witness.Verify(pubRevKey)
	if err != nil {
		return err
	}

	err = witness.Update(pubRevKey, update)
	if err != nil {
		return err
	}
	return nil
}

func newClaimFromAttribute(attributes []*Attribute) (Claim, error) {
	claim := make(Claim)
	for _, attr := range attributes {
		var err error
		switch attr.Typename {
		case "string":
			err = setNestedValue(claim, attr.Name, string(attr.Value))
		case "float":
			bytes := attr.Value
			// a float requires at least 8 bytes.
			if len(bytes) < 8 {
				return nil, fmt.Errorf("invalid big.Int for %q float value", attr.Name)
			}
			bits := binary.BigEndian.Uint64(bytes)
			err = setNestedValue(claim, attr.Name, math.Float64frombits(bits))
		case "bool":
			err = setNestedValue(claim, attr.Name, attr.Value[0] != byte(0))
		case "array":
			var array []interface{}
			// skip first byte which is only for big ints. trailing 0 are
			// truncated...
			err = json.Unmarshal(attr.Value[1:], &array)
			if err == nil {
				err = setNestedValue(claim, attr.Name, array)
			}
		default:
			err = setNestedValue(claim, attr.Name, hex.EncodeToString(attr.Value))
		}
		if err != nil {
			return nil, err
		}
	}
	return claim, nil
}

// ToAttributes transforms a claim struct to a list of attributes. The returned list is sorted by name.
func (claim Claim) ToAttributes() []*Attribute {
	var attributes []*Attribute

	queue := list.New()
	queue.PushBack(&nestedObject{
		prefix:  "",
		content: claim,
	})
	// go through every property of the claim, transform it into an int and put it into the attributes array
	for queue.Len() > 0 {
		elem := queue.Front()
		queue.Remove(elem)
		jsonObj := elem.Value.(*nestedObject)
		for n, v := range jsonObj.content {
			var name string
			n = escape(n, []rune(Separator)[0])
			if jsonObj.prefix != "" {
				name = jsonObj.prefix + Separator + n
			} else {
				name = n
			}

			reflected := reflect.ValueOf(v)
			switch reflected.Kind() {
			case reflect.Map:
				if m, ok := v.(Claim); ok {
					queue.PushBack(&nestedObject{
						prefix:  name,
						content: m,
					})
				} else if m, ok := v.(map[string]interface{}); ok {
					queue.PushBack(&nestedObject{
						prefix:  name,
						content: (Claim)(m),
					})
				} else {
					panic(fmt.Sprintf("unsupported map type %T", v))
				}
			case reflect.Slice, reflect.Array:
				marshaledV, err := json.Marshal(v)
				if err != nil {
					panic("could not marshal array")
				}
				// for big ints prepend with non null byte
				marshaledV = append([]byte{MagicByte}, marshaledV...)
				attributes = append(attributes, &Attribute{
					Name:     name,
					Typename: "array",
					Value:    marshaledV,
				})
			case reflect.String:
				attributes = append(attributes, &Attribute{
					Name:     name,
					Typename: "string",
					Value:    []byte(reflected.String()),
				})
			case reflect.Float32, reflect.Float64:
				var buf [8]byte
				binary.BigEndian.PutUint64(buf[:], math.Float64bits(reflected.Float()))
				attributes = append(attributes, &Attribute{
					Name:     name,
					Typename: "float",
					Value:    buf[:],
				})
			case reflect.Bool:
				var value byte
				if reflected.Bool() {
					value = 1
				} else {
					value = 0
				}
				attributes = append(attributes, &Attribute{
					Name:     name,
					Typename: "bool",
					Value:    []byte{value},
				})
			default:
				panic(fmt.Sprintf("unknown type %T", v))
			}
		}
	}
	// sort attributes by name
	sort.Slice(attributes[:], func(i, j int) bool {
		return strings.Compare(attributes[i].Name, attributes[j].Name) < 0
	})
	return attributes
}

// BigIntsToAttributes takes an array of big ints and unmarshals them into an
// array of attributes.
func BigIntsToAttributes(encodedAttributes []*big.Int) ([]*Attribute, error) {
	attributes := make([]*Attribute, len(encodedAttributes))
	i := 0
	for _, bInt := range encodedAttributes {
		attributes[i] = &Attribute{}
		if err := attributes[i].UnmarshalBinary(bInt.Bytes()); err != nil {
			return nil, err
		}
		i++
	}
	return attributes, nil
}

// attributesToBigInts takes an array of attributes and marshals them into an
// array of big.ints.
func attributesToBigInts(attributes []*Attribute) ([]*big.Int, error) {
	bInts := make([]*big.Int, len(attributes))
	for i, attribute := range attributes {
		bytes, err := attribute.MarshalBinary()
		if err != nil {
			return nil, err
		}
		bInts[i] = new(big.Int).SetBytes(bytes)

	}
	return bInts, nil
}

// MarshalBinary writes the attributes into a byte array
func (p Attribute) MarshalBinary() ([]byte, error) {
	// good old [length|field] encoding. length is an uint64
	byteName := []byte(p.Name)
	byteTypename := []byte(p.Typename)

	b := make([]byte, len(byteName)+len(byteTypename)+len(p.Value)+3*8+1)
	// leading zeros are striped from big.Ints...
	b[0] = MagicByte
	index := 1

	binary.BigEndian.PutUint64(b[index:index+8], (uint64)(len(byteName)))
	index += 8
	copy(b[index:index+len(byteName)], byteName)
	index += len(byteName)

	binary.BigEndian.PutUint64(b[index:index+8], (uint64)(len(byteTypename)))
	index += 8
	copy(b[index:index+len(byteTypename)], byteTypename)
	index += len(byteTypename)

	binary.BigEndian.PutUint64(b[index:index+8], (uint64)(len(p.Value)))
	index += 8
	copy(b[index:index+len(p.Value)], p.Value)
	return b, nil
}

// UnmarshalBinary parse a byte array into an attributes
func (p *Attribute) UnmarshalBinary(data []byte) error {
	// good old [length|field] encoding. length is an uint64
	if data[0] != MagicByte {
		return errors.New("missing magic byte")
	}
	if 8 >= (uint64)(len(data)) {
		return errors.New("invalid length data")
	}
	var index uint64 = 1
	lengthName := binary.BigEndian.Uint64(data[index : index+8])
	index += 8
	if index+lengthName >= (uint64)(len(data)) {
		return errors.New("invalid name data")
	}
	p.Name = string(data[index : index+lengthName])
	index += lengthName

	lengthTypename := binary.BigEndian.Uint64(data[index : index+8])
	index += 8
	if index+lengthTypename >= (uint64)(len(data)) {
		return errors.New("invalid typename data")
	}
	p.Typename = string(data[index : index+lengthTypename])
	index += lengthTypename

	lengthValue := binary.BigEndian.Uint64(data[index : index+8])
	index += 8
	if index+lengthValue > (uint64)(len(data)) {
		return errors.New("invalid value data")
	}
	p.Value = data[index : index+lengthValue]
	return nil
}

func setNestedValue(m map[string]interface{}, key string, value interface{}) error {
	parts := escapedSplit(key, []rune(Separator)[0])
	for _, v := range parts[:len(parts)-1] {
		key := unescape(v, []rune(Separator)[0])
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
	key = unescape(parts[len(parts)-1], []rune(Separator)[0])
	if _, ok := m[key]; ok {
		return errors.New("key already set")
	}
	m[key] = value
	return nil
}

func sortRemoveDuplicates(slice []string) ([]string, bool) {
	if len(slice) < 1 {
		return slice, true
	}
	sort.Slice(slice[:], func(i, j int) bool {
		return strings.Compare(slice[i], slice[j]) < 0
	})
	// fist element is always unique
	n := 1
	wasUnique := true
	for _, x := range slice[1:] {
		if x != slice[n-1] {
			slice[n] = x
			n++
		} else {
			wasUnique = false
		}
	}
	return slice[:n], wasUnique
}
