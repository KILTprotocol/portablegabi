const path = require('path')

module.exports = {
  mode: 'production',
  entry: './docs/examples/browser/browserExample.js',
  module: {
    rules: [
      {
        // test: /\.tsx?$/,
        // use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'browserBundle.js',
    path: path.resolve(__dirname, 'docs/examples/browser'),
  },
  node: {
    fs: 'empty',
  },
}
