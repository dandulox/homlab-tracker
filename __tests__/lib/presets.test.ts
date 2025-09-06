import { describe, it, expect } from 'vitest'
import { 
  presetManager, 
  createServiceFromPreset, 
  duplicateService, 
  validateService,
  getAllPresets,
  getPresetsByCategory,
  getAllCategories,
  searchPresets
} from '@/lib/presets'
import { type Service } from '@/lib/schemas/service'

describe('ServicePresetManager', () => {
  describe('getAllPresets', () => {
    it('should return all presets', () => {
      const presets = getAllPresets()
      expect(presets.length).toBeGreaterThan(0)
      expect(presets.some(p => p.id === 'proxmox')).toBe(true)
      expect(presets.some(p => p.id === 'adguard')).toBe(true)
    })
  })

  describe('getPresetsByCategory', () => {
    it('should return presets for specific category', () => {
      const infraPresets = getPresetsByCategory('infra')
      expect(infraPresets.length).toBeGreaterThan(0)
      expect(infraPresets.every(p => p.category === 'infra')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const presets = getPresetsByCategory('non-existent')
      expect(presets).toEqual([])
    })
  })

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories.some(c => c.id === 'infra')).toBe(true)
      expect(categories.some(c => c.id === 'network')).toBe(true)
    })
  })

  describe('searchPresets', () => {
    it('should search presets by name', () => {
      const results = searchPresets('Proxmox')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name.includes('Proxmox'))).toBe(true)
    })

    it('should search presets by description', () => {
      const results = searchPresets('virtualization')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.description.toLowerCase().includes('virtualization'))).toBe(true)
    })

    it('should search presets by tags', () => {
      const results = searchPresets('dns')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.tags.includes('dns'))).toBe(true)
    })

    it('should return empty array for no matches', () => {
      const results = searchPresets('nonexistent')
      expect(results).toEqual([])
    })
  })

  describe('createServiceFromPreset', () => {
    it('should create service from Proxmox preset', () => {
      const service = createServiceFromPreset('proxmox', 'main')
      
      expect(service.type).toBe('proxmox')
      expect(service.instanceId).toBe('main')
      expect(service.name).toBe('Proxmox VE (main)')
      expect(service.icon).toBe('Server')
      expect(service.checks?.adapters?.proxmox).toBeDefined()
    })

    it('should create service with overrides', () => {
      const service = createServiceFromPreset('proxmox', 'backup', {
        name: 'Custom Proxmox',
        url: 'https://custom.proxmox.com'
      })
      
      expect(service.name).toBe('Custom Proxmox')
      expect(service.url).toBe('https://custom.proxmox.com')
      expect(service.type).toBe('proxmox')
    })

    it('should throw error for non-existent preset', () => {
      expect(() => createServiceFromPreset('nonexistent', 'main')).toThrow('Preset nonexistent not found')
    })
  })

  describe('duplicateService', () => {
    it('should duplicate service with new ID and instance', () => {
      const originalService: Service = {
        id: 'original-id',
        type: 'proxmox',
        instanceId: 'main',
        name: 'Original Service',
        url: 'https://original.com',
        icon: 'Server',
        group: 'Infrastructure',
        tags: ['test'],
        template: { preset: 'foundation', fields: {} },
        checks: { adapters: {} },
        auth: { mode: 'none' },
        favorite: false,
        hidden: false,
        order: 0
      }

      const duplicated = duplicateService(originalService, 'backup')
      
      expect(duplicated.id).not.toBe(originalService.id)
      expect(duplicated.instanceId).toBe('backup')
      expect(duplicated.name).toBe('Original Service (backup)')
      expect(duplicated.type).toBe(originalService.type)
      expect(duplicated.url).toBe(originalService.url)
    })
  })

  describe('validateService', () => {
    it('should validate correct service', () => {
      const service: Service = {
        id: 'test-service',
        type: 'generic',
        instanceId: 'main',
        name: 'Test Service',
        url: 'https://test.com',
        icon: 'Box',
        group: 'Test Group',
        tags: [],
        template: { preset: 'foundation', fields: {} },
        checks: { adapters: {} },
        auth: { mode: 'none' },
        favorite: false,
        hidden: false,
        order: 0
      }

      const result = validateService(service)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject service with missing required fields', () => {
      const service = {
        name: 'Incomplete Service'
      } as any

      const result = validateService(service)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.includes('ID is required'))).toBe(true)
    })

    it('should reject service with invalid URL', () => {
      const service: Service = {
        id: 'test-service',
        type: 'generic',
        instanceId: 'main',
        name: 'Test Service',
        url: 'not-a-url',
        icon: 'Box',
        group: 'Test Group',
        tags: [],
        template: { preset: 'foundation', fields: {} },
        checks: { adapters: {} },
        auth: { mode: 'none' },
        favorite: false,
        hidden: false,
        order: 0
      }

      const result = validateService(service)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Valid service URL is required'))).toBe(true)
    })

    it('should reject service with enabled adapter but no base URL', () => {
      const service: Service = {
        id: 'test-service',
        type: 'proxmox',
        instanceId: 'main',
        name: 'Test Service',
        url: 'https://test.com',
        icon: 'Box',
        group: 'Test Group',
        tags: [],
        template: { preset: 'foundation', fields: {} },
        checks: {
          adapters: {
            proxmox: {
              enabled: true,
              baseUrl: ''
            }
          }
        },
        auth: { mode: 'none' },
        favorite: false,
        hidden: false,
        order: 0
      }

      const result = validateService(service)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('has no base URL'))).toBe(true)
    })

    it('should reject service with basic auth but no credentials', () => {
      const service: Service = {
        id: 'test-service',
        type: 'generic',
        instanceId: 'main',
        name: 'Test Service',
        url: 'https://test.com',
        icon: 'Box',
        group: 'Test Group',
        tags: [],
        template: { preset: 'foundation', fields: {} },
        checks: { adapters: {} },
        auth: {
          mode: 'basic',
          basic: {
            username: 'admin'
            // missing password
          }
        },
        favorite: false,
        hidden: false,
        order: 0
      }

      const result = validateService(service)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Basic auth requires username and password'))).toBe(true)
    })
  })

  describe('getPresetStats', () => {
    it('should return preset statistics', () => {
      const stats = presetManager.getPresetStats()
      
      expect(stats.total).toBeGreaterThan(0)
      expect(typeof stats.byCategory).toBe('object')
      expect(stats.withAdapters).toBeGreaterThan(0)
      expect(stats.byCategory.infra).toBeGreaterThan(0)
    })
  })
})
