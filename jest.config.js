module.exports = {
  preset: 'ts-jest',
  testEnvironment: '../jest.env.js',
  clearMocks: true,
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: ['**/*.ts', '!index.ts'],
  rootDir: 'src',
  coverageDirectory: '../coverage',
  globalTeardown: './testSetup/jest.teardown.js',
  testTimeout: 10000,
  runner: "groups",
}
