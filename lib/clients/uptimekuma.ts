import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { UptimeKumaStatsSchema, type UptimeKumaStats } from '@/lib/schemas/widgets'

export interface UptimeKumaConfig extends AdapterConfig {
  apiKey?: string
}

export class UptimeKumaAdapter extends BaseAdapter<UptimeKumaConfig, UptimeKumaStats> {
  constructor(config: UptimeKumaConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData(): Promise<AdapterResponse<UptimeKumaStats>> {
    try {
      const headers = this.getAuthHeaders()

      // Get monitors
      const monitorsResponse = await this.makeRequest('/api/monitors', {
        method: 'GET',
        headers
      })

      if (!monitorsResponse.ok) {
        throw new Error(`Uptime Kuma API error: ${monitorsResponse.status} ${monitorsResponse.statusText}`)
      }

      const monitorsData = await monitorsResponse.json()

      let upCount = 0
      let downCount = 0
      let maintenanceCount = 0

      // Count monitor statuses
      for (const monitor of monitorsData) {
        if (monitor.active === false) {
          maintenanceCount++
        } else if (monitor.status === 1) {
          upCount++
        } else {
          downCount++
        }
      }

      const data: UptimeKumaStats = {
        monitors: monitorsData.length,
        up: upCount,
        down: downCount,
        maintenance: maintenanceCount
      }

      // Validate data with Zod schema
      const validatedData = UptimeKumaStatsSchema.parse(data)
      
      this.setCache(validatedData)
      
      return {
        success: true,
        data: validatedData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    
    return headers
  }
}
