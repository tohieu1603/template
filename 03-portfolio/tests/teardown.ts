/**
 * Global Jest teardown: close DB connection after all tests.
 */
export default async function globalTeardown(): Promise<void> {
  // nothing needed - each test file manages its own DB lifecycle
}
