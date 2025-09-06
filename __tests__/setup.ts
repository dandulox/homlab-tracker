import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.TEST_VAR = 'test-value'
process.env.ANOTHER_VAR = 'another-value'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
