/**
 * Global teardown: runs once after all test suites complete.
 */
export default async function globalTeardown() {
  // Nothing needed — each test file manages its own DB connection lifecycle
}
