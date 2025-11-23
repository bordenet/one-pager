export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/genesis/'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/app.js',
    '!js/project-view.js',  // Complex UI file with event handlers - difficult to test in isolation
    '!js/router.js',        // Router with complex async behavior - tested via integration
    '!**/node_modules/**',
    '!**/genesis/**'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 40,
      functions: 70,
      lines: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
