import { describe, it, expect } from 'vitest'
import { Service, ServiceAdapters, AuthMode, Config } from '@/lib/schemas/service'

describe('Service Schema', () => {
  it('should validate a basic service', () => {
    const service = {
      id: 'test-service',
      type: 'generic',
      instanceId: 'main',
      name: 'Test Service',
      url: 'https://test.com',
      icon: 'Box',
      group: 'Test Group',
      tags: ['test', 'example'],
      vlan: 10,
      template: {
        preset: 'foundation' as const,
        fields: {}
      },
      checks: {
        adapters: {}
      },
      auth: {
        mode: 'none' as const
      },
      favorite: false,
      hidden: false,
      order: 0
    }

    const result = Service.parse(service)
    expect(result).toEqual(service)
  })

  it('should validate service with adapters', () => {
    const service = {
      id: 'proxmox-service',
      type: 'proxmox',
      instanceId: 'main',
      name: 'Proxmox',
      url: 'https://proxmox.lan:8006',
      icon: 'Server',
      group: 'Infrastructure',
      tags: ['vm', 'infra'],
      checks: {
        adapters: {
          proxmox: {
            enabled: true,
            baseUrl: 'https://proxmox.lan:8006',
            tokenId: 'dashboard@pve!readonly',
            tokenSecret: 'secret'
          }
        }
      },
      auth: {
        mode: 'none' as const
      }
    }

    const result = Service.parse(service)
    expect(result.checks?.adapters?.proxmox?.enabled).toBe(true)
  })

  it('should validate service with basic auth', () => {
    const service = {
      id: 'auth-service',
      type: 'generic',
      instanceId: 'main',
      name: 'Auth Service',
      url: 'https://auth.com',
      auth: {
        mode: 'basic' as const,
        basic: {
          username: 'admin',
          password: 'password'
        }
      }
    }

    const result = Service.parse(service)
    expect(result.auth?.mode).toBe('basic')
    expect(result.auth?.basic?.username).toBe('admin')
  })

  it('should validate service with JWT auth', () => {
    const service = {
      id: 'jwt-service',
      type: 'generic',
      instanceId: 'main',
      name: 'JWT Service',
      url: 'https://jwt.com',
      auth: {
        mode: 'jwt' as const,
        jwt: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }

    const result = Service.parse(service)
    expect(result.auth?.mode).toBe('jwt')
    expect(result.auth?.jwt?.token).toBeDefined()
  })

  it('should reject invalid URL', () => {
    const service = {
      id: 'invalid-service',
      type: 'generic',
      instanceId: 'main',
      name: 'Invalid Service',
      url: 'not-a-url'
    }

    expect(() => Service.parse(service)).toThrow()
  })

  it('should reject missing required fields', () => {
    const service = {
      name: 'Incomplete Service'
    }

    expect(() => Service.parse(service)).toThrow()
  })
})

describe('ServiceAdapters Schema', () => {
  it('should validate Proxmox adapter', () => {
    const adapter = {
      proxmox: {
        enabled: true,
        baseUrl: 'https://proxmox.lan:8006',
        tokenId: 'dashboard@pve!readonly',
        tokenSecret: 'secret'
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.proxmox?.enabled).toBe(true)
  })

  it('should validate AdGuard adapter', () => {
    const adapter = {
      adguard: {
        enabled: true,
        baseUrl: 'http://adguard.lan',
        username: 'admin',
        password: 'password'
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.adguard?.enabled).toBe(true)
  })

  it('should validate Pi-hole adapter', () => {
    const adapter = {
      pihole: {
        enabled: true,
        baseUrl: 'http://pihole.lan/admin',
        token: 'api-token',
        version: 'v5' as const
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.pihole?.enabled).toBe(true)
    expect(result.pihole?.version).toBe('v5')
  })

  it('should validate NPM adapter', () => {
    const adapter = {
      npm: {
        enabled: true,
        baseUrl: 'http://npm.lan:81',
        token: 'api-token'
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.npm?.enabled).toBe(true)
  })

  it('should validate ping check', () => {
    const adapter = {
      ping: {
        enabled: true,
        host: 'example.com',
        intervalSec: 30
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.ping?.enabled).toBe(true)
    expect(result.ping?.host).toBe('example.com')
  })

  it('should validate HTTP check', () => {
    const adapter = {
      http: {
        enabled: true,
        url: 'https://example.com/health',
        expectStatus: 200,
        intervalSec: 30
      }
    }

    const result = ServiceAdapters.parse(adapter)
    expect(result.http?.enabled).toBe(true)
    expect(result.http?.expectStatus).toBe(200)
  })
})

describe('AuthMode Schema', () => {
  it('should validate all auth modes', () => {
    expect(AuthMode.parse('none')).toBe('none')
    expect(AuthMode.parse('basic')).toBe('basic')
    expect(AuthMode.parse('jwt')).toBe('jwt')
    expect(AuthMode.parse('header_forward')).toBe('header_forward')
  })

  it('should reject invalid auth mode', () => {
    expect(() => AuthMode.parse('invalid')).toThrow()
  })
})

describe('Config Schema', () => {
  it('should validate complete config', () => {
    const config = {
      title: 'Test Dashboard',
      description: 'Test Description',
      theme: 'system' as const,
      auth: {
        enabled: false
      },
      groups: [
        {
          name: 'Test Group',
          icon: 'Server',
          order: 0
        }
      ],
      services: [
        {
          id: 'test-service',
          type: 'generic',
          instanceId: 'main',
          name: 'Test Service',
          url: 'https://test.com',
          group: 'Test Group'
        }
      ],
      discovery: {
        enabled: true,
        cidr: ['10.0.0.0/24'],
        http_ports: [80, 443],
        ping_timeout_ms: 600
      }
    }

    const result = Config.parse(config)
    expect(result.title).toBe('Test Dashboard')
    expect(result.services).toHaveLength(1)
    expect(result.groups).toHaveLength(1)
  })

  it('should use defaults for missing fields', () => {
    const config = {}

    const result = Config.parse(config)
    expect(result.title).toBe('Homelab Dashboard')
    expect(result.theme).toBe('system')
    expect(result.auth.enabled).toBe(false)
    expect(result.services).toEqual([])
    expect(result.groups).toEqual([])
  })
})
