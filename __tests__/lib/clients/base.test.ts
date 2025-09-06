import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseAdapter, resolveEnvVar, resolveEnvVarsInObject } from '@/lib/clients/base'

// Mock adapter for testing
class TestAdapter extends BaseAdapter<{ enabled: boolean; baseUrl: string }, { test: string }> {
  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData() {
    return {
      success: true,
      data: { test: 'data' }
    }
  }
}

describe('BaseAdapter', () => {
  let adapter: TestAdapter

  beforeEach(() => {
    adapter = new TestAdapter({
      enabled: true,
      baseUrl: 'https://test.com'
    })
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(adapter.getConfig()).toEqual({
        enabled: true,
        baseUrl: 'https://test.com'
      })
    })
  })

  describe('getData', () => {
    it('should return error when disabled', async () => {
      adapter.disable()
      const result = await adapter.getData()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Adapter is disabled')
    })

    it('should return error when config is invalid', async () => {
      adapter.updateConfig({ baseUrl: '' })
      const result = await adapter.getData()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid configuration')
    })

    it('should fetch and cache data', async () => {
      const result = await adapter.getData()
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ test: 'data' })
    })

    it('should return cached data on subsequent calls', async () => {
      await adapter.getData()
      const result = await adapter.getData()
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ test: 'data' })
      expect(result.lastUpdate).toBeDefined()
    })
  })

  describe('enable/disable', () => {
    it('should enable adapter', () => {
      adapter.disable()
      expect(adapter.isEnabled()).toBe(false)
      
      adapter.enable()
      expect(adapter.isEnabled()).toBe(true)
    })

    it('should disable adapter and clear cache', () => {
      adapter.enable()
      expect(adapter.isEnabled()).toBe(true)
      
      adapter.disable()
      expect(adapter.isEnabled()).toBe(false)
    })
  })

  describe('updateConfig', () => {
    it('should update config and clear cache', () => {
      adapter.updateConfig({ baseUrl: 'https://new.com' })
      
      expect(adapter.getConfig().baseUrl).toBe('https://new.com')
    })
  })
})

describe('resolveEnvVar', () => {
  beforeEach(() => {
    process.env.TEST_VAR = 'test-value'
    process.env.ANOTHER_VAR = 'another-value'
  })

  afterEach(() => {
    delete process.env.TEST_VAR
    delete process.env.ANOTHER_VAR
  })

  it('should resolve ${VAR} format', () => {
    const result = resolveEnvVar('Hello ${TEST_VAR}')
    expect(result).toBe('Hello test-value')
  })

  it('should resolve env:VAR format', () => {
    const result = resolveEnvVar('Hello env:TEST_VAR')
    expect(result).toBe('Hello test-value')
  })

  it('should resolve $VAR format', () => {
    const result = resolveEnvVar('Hello $TEST_VAR')
    expect(result).toBe('Hello test-value')
  })

  it('should throw error for missing variable', () => {
    expect(() => resolveEnvVar('Hello ${MISSING_VAR}')).toThrow('Environment variable MISSING_VAR not found')
  })

  it('should return original string if no env vars', () => {
    const result = resolveEnvVar('Hello World')
    expect(result).toBe('Hello World')
  })
})

describe('resolveEnvVarsInObject', () => {
  beforeEach(() => {
    process.env.TEST_VAR = 'test-value'
    process.env.ANOTHER_VAR = 'another-value'
  })

  afterEach(() => {
    delete process.env.TEST_VAR
    delete process.env.ANOTHER_VAR
  })

  it('should resolve env vars in object', () => {
    const obj = {
      url: 'https://${TEST_VAR}.com',
      name: 'env:ANOTHER_VAR',
      static: 'unchanged'
    }

    const result = resolveEnvVarsInObject(obj)
    
    expect(result).toEqual({
      url: 'https://test-value.com',
      name: 'another-value',
      static: 'unchanged'
    })
  })

  it('should resolve env vars in nested objects', () => {
    const obj = {
      config: {
        api: {
          url: 'https://${TEST_VAR}.com'
        }
      }
    }

    const result = resolveEnvVarsInObject(obj)
    
    expect(result.config.api.url).toBe('https://test-value.com')
  })

  it('should resolve env vars in arrays', () => {
    const obj = {
      urls: ['https://${TEST_VAR}.com', 'https://env:ANOTHER_VAR.com']
    }

    const result = resolveEnvVarsInObject(obj)
    
    expect(result.urls).toEqual(['https://test-value.com', 'https://another-value.com'])
  })
})
