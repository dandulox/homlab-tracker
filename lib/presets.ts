import { SERVICE_PRESETS, PRESET_CATEGORIES, type ServicePreset, type PresetCategory } from './schemas/presets'
import { type Service } from './schemas/service'
import { v4 as uuidv4 } from 'uuid'

/**
 * Service Preset Manager
 * Handles creation, validation, and management of service presets
 */
export class ServicePresetManager {
  private presets: Map<string, ServicePreset> = new Map()
  private categories: Map<string, PresetCategory> = new Map()

  constructor() {
    this.initializePresets()
  }

  private initializePresets(): void {
    // Load predefined presets
    for (const preset of SERVICE_PRESETS) {
      this.presets.set(preset.id, preset)
    }

    // Load categories
    for (const category of PRESET_CATEGORIES) {
      this.categories.set(category.id, category)
    }
  }

  /**
   * Get all available presets
   */
  getAllPresets(): ServicePreset[] {
    return Array.from(this.presets.values())
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(categoryId: string): ServicePreset[] {
    return this.getAllPresets().filter(preset => preset.category === categoryId)
  }

  /**
   * Get preset by ID
   */
  getPreset(presetId: string): ServicePreset | undefined {
    return this.presets.get(presetId)
  }

  /**
   * Get all categories
   */
  getAllCategories(): PresetCategory[] {
    return Array.from(this.categories.values())
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId: string): PresetCategory | undefined {
    return this.categories.get(categoryId)
  }

  /**
   * Create a service from a preset
   */
  createServiceFromPreset(
    presetId: string,
    instanceId: string,
    overrides: Partial<Service> = {}
  ): Service {
    const preset = this.getPreset(presetId)
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`)
    }

    // Generate unique ID
    const id = uuidv4()

    // Build default service
    const service: Service = {
      id,
      type: presetId,
      instanceId,
      name: `${preset.name} (${instanceId})`,
      url: preset.defaultUrl || '',
      icon: preset.icon,
      group: this.getCategory(preset.category)?.name || 'Other',
      tags: [...preset.tags],
      template: {
        preset: 'foundation',
        fields: {}
      },
      checks: {
        adapters: {}
      },
      auth: {
        mode: 'none'
      },
      ...overrides
    }

    // Set up adapters based on preset
    if (preset.adapters.length > 0) {
      for (const adapterType of preset.adapters) {
        service.checks!.adapters![adapterType] = {
          enabled: false,
          baseUrl: preset.defaultUrl || ''
        }
      }
    }

    return service
  }

  /**
   * Duplicate an existing service
   */
  duplicateService(service: Service, newInstanceId: string): Service {
    const newId = uuidv4()
    
    return {
      ...service,
      id: newId,
      instanceId: newInstanceId,
      name: `${service.name} (${newInstanceId})`,
      // Clear any cached data
      checks: service.checks ? {
        ...service.checks,
        adapters: service.checks.adapters ? {
          ...service.checks.adapters
        } : undefined
      } : undefined
    }
  }

  /**
   * Validate service configuration
   */
  validateService(service: Service): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic validation
    if (!service.id) {
      errors.push('Service ID is required')
    }

    if (!service.name || service.name.trim().length === 0) {
      errors.push('Service name is required')
    }

    if (!service.url || !this.isValidUrl(service.url)) {
      errors.push('Valid service URL is required')
    }

    if (!service.type) {
      errors.push('Service type is required')
    }

    if (!service.instanceId) {
      errors.push('Service instance ID is required')
    }

    // Validate adapters
    if (service.checks?.adapters) {
      for (const [adapterType, adapterConfig] of Object.entries(service.checks.adapters)) {
        if (adapterConfig?.enabled) {
          if (!adapterConfig.baseUrl) {
            errors.push(`Adapter ${adapterType} is enabled but has no base URL`)
          }
        }
      }
    }

    // Validate auth configuration
    if (service.auth?.mode === 'basic') {
      if (!service.auth.basic?.username || !service.auth.basic?.password) {
        errors.push('Basic auth requires username and password')
      }
    }

    if (service.auth?.mode === 'jwt') {
      if (!service.auth.jwt?.token) {
        errors.push('JWT auth requires a token')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get available adapter types for a service type
   */
  getAvailableAdapters(serviceType: string): string[] {
    const preset = this.getPreset(serviceType)
    return preset?.adapters || []
  }

  /**
   * Search presets by name or description
   */
  searchPresets(query: string): ServicePreset[] {
    const lowerQuery = query.toLowerCase()
    
    return this.getAllPresets().filter(preset => 
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get preset statistics
   */
  getPresetStats(): {
    total: number
    byCategory: Record<string, number>
    withAdapters: number
  } {
    const presets = this.getAllPresets()
    const byCategory: Record<string, number> = {}
    let withAdapters = 0

    for (const preset of presets) {
      // Count by category
      byCategory[preset.category] = (byCategory[preset.category] || 0) + 1
      
      // Count with adapters
      if (preset.adapters.length > 0) {
        withAdapters++
      }
    }

    return {
      total: presets.length,
      byCategory,
      withAdapters
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const presetManager = new ServicePresetManager()

// Utility functions
export function createServiceFromPreset(
  presetId: string,
  instanceId: string,
  overrides: Partial<Service> = {}
): Service {
  return presetManager.createServiceFromPreset(presetId, instanceId, overrides)
}

export function duplicateService(service: Service, newInstanceId: string): Service {
  return presetManager.duplicateService(service, newInstanceId)
}

export function validateService(service: Service): { valid: boolean; errors: string[] } {
  return presetManager.validateService(service)
}

export function getPreset(presetId: string): ServicePreset | undefined {
  return presetManager.getPreset(presetId)
}

export function getAllPresets(): ServicePreset[] {
  return presetManager.getAllPresets()
}

export function getPresetsByCategory(categoryId: string): ServicePreset[] {
  return presetManager.getPresetsByCategory(categoryId)
}

export function getAllCategories(): PresetCategory[] {
  return presetManager.getAllCategories()
}

export function searchPresets(query: string): ServicePreset[] {
  return presetManager.searchPresets(query)
}
