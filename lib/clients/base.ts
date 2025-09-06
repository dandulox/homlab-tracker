import { z } from 'zod'

// Base adapter interface
export interface AdapterConfig {
  enabled: boolean
  baseUrl: string
  timeout?: number
  retries?: number
}

// Base adapter response
export interface AdapterResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  responseTime?: number
  lastUpdate?: string
}

// Base adapter class
export abstract class BaseAdapter<TConfig extends AdapterConfig, TData = any> {
  protected config: TConfig
  protected lastUpdate: string | null = null
  protected cache: TData | null = null
  protected cacheTimeout: number = 30000 // 30 seconds

  constructor(config: TConfig) {
    this.config = config
  }

  // Abstract methods to be implemented by subclasses
  abstract fetchData(): Promise<AdapterResponse<TData>>
  abstract validateConfig(): boolean

  // Common methods
  protected async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = new URL(endpoint, this.config.baseUrl)
    
    const defaultOptions: RequestInit = {
      timeout: this.config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Labora-Dashboard/1.0',
        ...options.headers,
      },
      ...options,
    }

    return fetch(url.toString(), defaultOptions)
  }

  protected isCacheValid(): boolean {
    if (!this.lastUpdate || !this.cache) return false
    
    const now = Date.now()
    const lastUpdateTime = new Date(this.lastUpdate).getTime()
    
    return (now - lastUpdateTime) < this.cacheTimeout
  }

  protected setCache(data: TData): void {
    this.cache = data
    this.lastUpdate = new Date().toISOString()
  }

  protected getCachedData(): TData | null {
    if (this.isCacheValid()) {
      return this.cache
    }
    return null
  }

  // Public methods
  public async getData(forceRefresh = false): Promise<AdapterResponse<TData>> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: 'Adapter is disabled'
      }
    }

    if (!this.validateConfig()) {
      return {
        success: false,
        error: 'Invalid configuration'
      }
    }

    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cached = this.getCachedData()
      if (cached) {
        return {
          success: true,
          data: cached,
          lastUpdate: this.lastUpdate || undefined
        }
      }
    }

    // Fetch new data
    const startTime = Date.now()
    try {
      const result = await this.fetchData()
      const responseTime = Date.now() - startTime
      
      return {
        ...result,
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
    }
  }

  public getConfig(): TConfig {
    return this.config
  }

  public updateConfig(newConfig: Partial<TConfig>): void {
    this.config = { ...this.config, ...newConfig }
    // Clear cache when config changes
    this.cache = null
    this.lastUpdate = null
  }

  public isEnabled(): boolean {
    return this.config.enabled
  }

  public enable(): void {
    this.config.enabled = true
  }

  public disable(): void {
    this.config.enabled = false
    this.cache = null
    this.lastUpdate = null
  }
}

// Utility function to resolve environment variables
export function resolveEnvVar(value: string): string {
  // Support both ${VAR} and env:VAR formats
  const envVarPattern = /\$\{([^}]+)\}|env:([^:]+)/
  const match = value.match(envVarPattern)
  
  if (match) {
    const envVar = match[1] || match[2]
    const envValue = process.env[envVar]
    
    if (envValue) {
      return envValue
    } else {
      throw new Error(`Environment variable ${envVar} not found`)
    }
  }
  
  return value
}

// Utility function to resolve all environment variables in an object
export function resolveEnvVars(obj: any): any {
  if (typeof obj === 'string') {
    return resolveEnvVar(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVars)
  }
  
  if (obj && typeof obj === 'object') {
    const resolved: any = {}
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveEnvVars(value)
    }
    return resolved
  }
  
  return obj
}
