# Portable Gabi

Portable Gabi is a wrapper for the gabi library. It does not expose the same API as gabi does.

## build to wasm

```bash
export GOOS="js"
export GOARCH="wasm"

go build main.go
```

run the demo js code:

```bash
export GOOS="js"
export GOARCH="wasm"

go build -o ./doc/example/main.wasm main.go

unset GOOS
unset GOARCH
cd doc/example
# install goexec once
go get -u github.com/shurcooL/goexec

goexec 'http.ListenAndServe(`:8080`, http.FileServer(http.Dir(`.`)))'
```

and visit http://localhost:8080

## Word of warning

Go uses float64 to decode json numbers. A 9007199254740993 as int64 cannot be
represented as float64...
