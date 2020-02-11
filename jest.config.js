module.exports = {
  preset: 'ts-jest',
  testEnvironment: '../jest.env.js',
  clearMocks: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  collectCoverageFrom: ['**/*.ts', '!index.ts'],
  rootDir: 'src',
  coverageDirectory: '../coverage',
  globalTeardown: './testSetup/jest.teardown.js',
}
