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
  rootDir: 'src',
  collectCoverageFrom: [
    '**/*.ts',
    '!index.ts',
    '!<rootDir>/testSetup/testTypes.ts',
  ],
  coverageDirectory: '../coverage',
  testTimeout: 10000,
  runner: 'groups',
}
