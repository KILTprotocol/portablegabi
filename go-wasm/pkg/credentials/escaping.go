package credentials

import "strings"

func escapedSplit(s string, sep rune) []string {
	slices := escapedSplitBytes([]byte(s), (byte)(sep))
	strSlices := make([]string, len(slices))
	for i, s := range slices {
		strSlices[i] = string(s)
	}
	return strSlices
}

func escapedSplitBytes(s []byte, sep byte) [][]byte {
	backslash := `\`[0]
	var slices [][]byte
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

func escape(s string, escaped rune) string {
	newS := strings.ReplaceAll(s, `\`, `\\`)
	newS = strings.ReplaceAll(newS, string(escaped), `\`+string(escaped))
	return newS
}
