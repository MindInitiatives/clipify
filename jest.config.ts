import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Use ts-jest for handling TypeScript files
  testEnvironment: 'node', // Jest will run in a Node.js environment
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transform TypeScript files with ts-jest
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'], // Support for TypeScript files
  // Optionally, specify test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).ts', // Look for test files in the tests folder with .test.ts or .spec.ts extensions
  ],
  // Optional: Mock global objects (e.g., clipboard API)
  setupFiles: ['./jest.setup.ts'], // Create this file if you need to set up mocks
};

export default config;
