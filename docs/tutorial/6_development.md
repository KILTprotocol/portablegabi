# Development

If you want to help develop portablegabi, we would be glad to merge your pull request.
But first, you need to set up a development environment for our project.
For that, start with installing the following dependencies:

- [node](https://nodejs.org/en/) (any version starting with 10.19)
- [yarn](https://yarnpkg.com/getting-started)
- [go](https://golang.org/doc/install) (version 1.14 or newer)
- [go dep](https://github.com/golang/dep)

Make sure you [set up your](https://github.com/golang/go/wiki/SettingGOPATH) `GOPATH` directory and environment variables.

After you are done, clone the [portablegabi project](https://github.com/KILTprotocol/portablegabi) into the correct go path:

```bash
mkdir -p $GOPATH/src/github.com/KILTprotocol/
git clone https://github.com/KILTprotocol/portablegabi.git \
  $GOPATH/src/github.com/KILTprotocol/portablegabi
cd $GOPATH/src/github.com/KILTprotocol/portablegabi
```

Next, you need to install all the node dependencies, build the Portablegabi WASM and transpile the Typescript code:

```bash
yarn install
yarn build
```

To ensure everything went fine, you can execute any of the provided examples:

```bash
yarn ts-node docs/examples/exampleSingle.ts
```

You can use the Portablegabi version you have just built by running `yarn link` inside the Portablegabi project and `yarn link @kiltprotocol/portablegabi` in the project where you want to use Portablegabi.

## Optional: Test with Substrate chain

If you want to test the examples with a blockchain, you will also need to install [rust](https://rustup.rs) and [Substrate](https://substrate.dev/docs/en/getting-started/installing-substrate).
For more information about setting up a chain to be used with the Portablegabi API, see the exemplary [`portablegabi-node`](https://github.com/KILTprotocol/portablegabi-node).
For code examples of the Portablegabi chain API, please have a look at our [chain examples](https://github.com/KILTprotocol/portablegabi/tree/develop/docs/examples).
