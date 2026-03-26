import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    }],
  },
  globalSetup: '<rootDir>/tests/setup.ts',
  setupFiles: ['<rootDir>/tests/env-setup.ts'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
  // Run test files sequentially to avoid DB conflicts
  maxWorkers: 1,
};

export default config;
