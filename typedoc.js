module.exports = {
  exclude: ['**/testSetup/*', '**/*.spec.ts', './src/wasm/wasm_exec.js'],
  listInvalidSymbolLinks: true,
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  readme: 'none',
}
