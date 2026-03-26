import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  globalSetup: './tests/setup.ts',
  globalTeardown: './tests/teardown.ts',
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: './tsconfig.test.json',
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: false,
  verbose: true,
};

export default config;
