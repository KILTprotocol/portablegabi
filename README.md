# Portable Gabi

Portable Gabi is a wrapper for the gabi library. It does not expose the same API as gabi does.

## build to wasm

```bash
export GOOS="js"
export GOARCH="wasm"

go build -o main.wasm
```

run the demo js code:

```bash
export GOOS="js"
export GOARCH="wasm"

go build -o doc/example/main.wasm

unset GOOS
unset GOARCH
cd doc/example
goexec 'http.ListenAndServe(`:8080`, http.FileServer(http.Dir(`.`)))'
```

and visit http://localhost:8080

## Word of warning

Go uses float64 to decode json numbers. A 9007199254740993 as int64 cannot be
decoded as float64...
