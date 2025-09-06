import { resolveEnvVars } from './clients/base'

// Environment variable patterns
const ENV_PATTERNS = {
  // ${VAR} format
  DOLLAR_BRACE: /\$\{([^}]+)\}/g,
  // env:VAR format
  ENV_PREFIX: /env:([^:]+)/g,
  // $VAR format (simple)
  DOLLAR_SIMPLE: /\$([A-Z_][A-Z0-9_]*)/g,
}

// Cache for resolved environment variables
const envCache = new Map<string, string>()

/**
 * Resolves environment variables in a string
 * Supports multiple formats: ${VAR}, env:VAR, $VAR
 */
export function resolveEnvVar(value: string): string {
  if (typeof value !== 'string') {
    return value
  }

  // Check cache first
  if (envCache.has(value)) {
    return envCache.get(value)!
  }

  let resolved = value

  // Replace ${VAR} format
  resolved = resolved.replace(ENV_PATTERNS.DOLLAR_BRACE, (match, varName) => {
    const envValue = process.env[varName]
    if (envValue === undefined) {
      throw new Error(`Environment variable ${varName} not found`)
    }
    return envValue
  })

  // Replace env:VAR format
  resolved = resolved.replace(ENV_PATTERNS.ENV_PREFIX, (match, varName) => {
    const envValue = process.env[varName]
    if (envValue === undefined) {
      throw new Error(`Environment variable ${varName} not found`)
    }
    return envValue
  })

  // Replace $VAR format (simple)
  resolved = resolved.replace(ENV_PATTERNS.DOLLAR_SIMPLE, (match, varName) => {
    const envValue = process.env[varName]
    if (envValue === undefined) {
      throw new Error(`Environment variable ${varName} not found`)
    }
    return envValue
  })

  // Cache the result
  envCache.set(value, resolved)

  return resolved
}

/**
 * Resolves environment variables in an object recursively
 */
export function resolveEnvVarsInObject(obj: any): any {
  if (typeof obj === 'string') {
    return resolveEnvVar(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVarsInObject)
  }

  if (obj && typeof obj === 'object') {
    const resolved: any = {}
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveEnvVarsInObject(value)
    }
    return resolved
  }

  return obj
}

/**
 * Validates that all required environment variables are present
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Gets environment variable with fallback
 */
export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name]
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Environment variable ${name} is required`)
  }
  return value
}

/**
 * Gets boolean environment variable
 */
export function getBooleanEnvVar(name: string, fallback = false): boolean {
  const value = process.env[name]
  if (value === undefined) {
    return fallback
  }
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Gets number environment variable
 */
export function getNumberEnvVar(name: string, fallback?: number): number {
  const value = process.env[name]
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Environment variable ${name} is required`)
  }
  
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`)
  }
  
  return parsed
}

/**
 * Sanitizes sensitive data for logging
 */
export function sanitizeForLogging(obj: any): any {
  if (typeof obj === 'string') {
    // Check if it looks like a secret (long random string, token, etc.)
    if (obj.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(obj)) {
      return '[REDACTED]'
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging)
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Redact sensitive keys
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeForLogging(value)
      }
    }
    return sanitized
  }

  return obj
}

/**
 * Checks if a key is sensitive and should be redacted
 */
function isSensitiveKey(key: string): boolean {
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'key',
    'auth',
    'credential',
    'api_key',
    'api_secret',
    'access_token',
    'refresh_token',
    'private_key',
    'certificate',
    'passphrase',
  ]

  const lowerKey = key.toLowerCase()
  return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))
}

/**
 * Clears the environment variable cache
 */
export function clearEnvCache(): void {
  envCache.clear()
}

/**
 * Gets all environment variables that match a pattern
 */
export function getEnvVarsByPattern(pattern: RegExp): Record<string, string> {
  const matches: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(process.env)) {
    if (pattern.test(key) && value) {
      matches[key] = value
    }
  }
  
  return matches
}

/**
 * Environment variable validation schema
 */
export const ENV_VALIDATION_SCHEMA = {
  // Required for basic functionality
  required: [
    'NODE_ENV',
  ],
  
  // Optional but recommended
  optional: [
    'CONFIG_PATH',
    'PORT',
    'HOSTNAME',
  ],
  
  // Widget-specific environment variables
  widgets: {
    proxmox: ['PROXMOX_BASE_URL', 'PROXMOX_TOKEN_ID', 'PROXMOX_TOKEN_SECRET'],
    pfsense: ['PFSENSE_BASE_URL', 'PFSENSE_API_KEY', 'PFSENSE_API_SECRET'],
    adguard: ['ADGUARD_BASE_URL', 'ADGUARD_USERNAME', 'ADGUARD_PASSWORD'],
    npm: ['NPM_BASE_URL', 'NPM_TOKEN'],
    pihole: ['PIHOLE_BASE_URL', 'PIHOLE_TOKEN'],
    portainer: ['PORTAINER_BASE_URL', 'PORTAINER_API_KEY'],
    grafana: ['GRAFANA_BASE_URL', 'GRAFANA_API_KEY'],
    prometheus: ['PROMETHEUS_BASE_URL'],
    jellyfin: ['JELLYFIN_BASE_URL', 'JELLYFIN_API_KEY'],
    sonarr: ['SONARR_BASE_URL', 'SONARR_API_KEY'],
    radarr: ['RADARR_BASE_URL', 'RADARR_API_KEY'],
    qbittorrent: ['QBITTORRENT_BASE_URL', 'QBITTORRENT_USERNAME', 'QBITTORRENT_PASSWORD'],
    nextcloud: ['NEXTCLOUD_BASE_URL', 'NEXTCLOUD_USERNAME', 'NEXTCLOUD_PASSWORD'],
    uptimekuma: ['UPTIMEKUMA_BASE_URL', 'UPTIMEKUMA_API_KEY'],
    homeassistant: ['HOMEASSISTANT_BASE_URL', 'HOMEASSISTANT_TOKEN'],
  }
} as const
