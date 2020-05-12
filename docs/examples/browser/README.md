Most certainly, you can use the Portablegabi API in the browser.
But you have to make it compatible with the browser API first, e.g. by bundling it with webpack.

Please note that **bundling your JS code does not suffice unfortunately**.
You also need to **serve the Portablegabi WASM file** [`main.wasm`] located in `/build/src/wasm`.
We recommend using our webpack configuration below which copies the WASM to your `dist` directory, in which your `bundle.js` should be stored.
Please **check out the FAQ** below in case your `node_modules` directory is not in the root level of your app, or you have a custom webpack output folder apart from `dist`.

## General Setup

1.  Bundle your JavaScript or TypeScript file that runs all the Portablegabi functionality, e.g. with `yarn webpack --entry <your_script_file> --out <desired_output_file>
2.  Include your `<desired_output_file>` into an HTML file, e.g. `<script src="dist/<desired_output_file>"></script>`
3.  Serve both the HTML file as well as the `main.wasm` (which is automatically copied to the output path of webpack - `./dist` by default) to a server of your choice, e.g. with [goexec](https://github.com/shurcooL/goexec) `goexec 'http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))'`
4.  Open your console and explore Portablegabi magic

## Run our browser example

This example is a full show-case of how you could run Portablegabi code in your browser. Just execute the following steps without any configuration.

1. Install Portablegabi and Webpack
   ```
   yarn
   ```
2. Bundle with webpack:
   ```
   yarn webpack
   ```
3. Serve to a server of your choice, we recommend goexec:

   ```
   goexec 'http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))'
   ```

4. Open your browser and navigate to `localhost:8080`
5. Open your console to check for example execution

## FAQ

### Q: _Which configuration do I need to add to webpack?_

Please have a look at our [webpack.config.js](./webpack.config.js):

```bash
yarn add copy-webpack-plugin -D
```

webpack.config.js

```javascript

// required to copy wasm to your dist directory
const CopyPlugin = require('copy-webpack-plugin')

const { DefinePlugin } = require('webpack')

// please change this in case your node_modules is not in the root level of your app, see below
const nodeModulesDir = './node_modules'

module.exports = {
   ...,
    plugins: [
      new CopyPlugin([
        {
          from: `${nodeModulesDir}/@kiltprotocol/portablegabi/build/wasm/main.wasm`,
          to: './',
        },
      ]),
      new DefinePlugin({
        'process.env.WASM_FETCH_DIR': JSON.stringify('./dist'),
      }),
    ],
    ...
}
```

### Q: _My `node_modules` is not in the root level_

If your `node_modules` directory is not in the root level of your application, you need to point webpack with it.
You can do this by changing `nodeModulesDir` in our configuration above.

### Q: _I am not bundling to `dist`_

Please change the value of `process.env.WASM_FETCH_DIR` in [webpack.config.js](./webpack.config.js#L27) to the directory in which you want to bundle your webpack build.
