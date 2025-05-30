module.exports = {
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.tsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup-test-framework.tsx'],
  coveragePathIgnorePatterns: [
    './src/components/elements/CustomTable/filter.tsx',
    './src/hocs/ProtectedRoute/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|ts|tsx)$'],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/components(.*)$': '<rootDir>/src/components$1',
    '^@/hocs(.*)$': '<rootDir>/src/hocs$1',
    '^@/hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@/providers(.*)$': '<rootDir>/src/providers$1',
    '^@/pages(.*)$': '<rootDir>/pages$1',
    '^@/styles(.*)$': '<rootDir>/src/styles$1',
    '^@/utils(.*)$': '<rootDir>/src/utils$1',
    '^@/views(.*)$': '<rootDir>/src/views$1',
    '^@/fields(.*)$': '<rootDir>/src/fields$1',
  },
};
