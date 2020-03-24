const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/browser/browser.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.ts', '.js'],
  },
  output: {
    filename: 'browserBundle.js',
    path: path.resolve(__dirname, 'docs/examples/browser'),
  },
  stats: {
    // suppressing warnings from `wasm_exec.js`
    warnings: false,
  },
}
