// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  mode: 'production',
  entry: './browserExample.js',
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './'),
  },
  node: {
    fs: 'empty',
    __dirname: true,
  },
}
