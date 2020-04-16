/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { DefinePlugin } = require('webpack')

const defaultEnv = {
  modules: './node_modules',
  outPath: './dist',
}

module.exports = (inputEnv) => {
  const env = { ...defaultEnv, ...inputEnv }
  return {
    mode: 'production',
    entry: './browserExample.js',
    resolve: {
      extensions: ['.js'],
    },
    plugins: [
      new CopyPlugin([
        {
          from: `${env.modules}/@kiltprotocol/portablegabi/build/wasm/main.wasm`,
          to: './',
        },
      ]),
      new DefinePlugin({
        'process.env.WASM_FETCH_DIR': JSON.stringify('./dist'),
      }),
    ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, env.outPath),
    },
    node: {
      fs: 'empty',
    },
  }
}
