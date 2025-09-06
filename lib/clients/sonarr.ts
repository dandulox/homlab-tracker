import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { SonarrStatsSchema, type SonarrStats } from '@/lib/schemas/widgets'

export interface SonarrConfig extends AdapterConfig {
  apiKey?: string
}

export class SonarrAdapter extends BaseAdapter<SonarrConfig, SonarrStats> {
  constructor(config: SonarrConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl && this.config.apiKey)
  }

  async fetchData(): Promise<AdapterResponse<SonarrStats>> {
    try {
      const headers = this.getAuthHeaders()

      // Get series count
      const seriesResponse = await this.makeRequest('/api/v3/series', {
        method: 'GET',
        headers
      })

      if (!seriesResponse.ok) {
        throw new Error(`Sonarr API error: ${seriesResponse.status} ${seriesResponse.statusText}`)
      }

      const seriesData = await seriesResponse.json()
      const seriesCount = seriesData.length

      // Get episodes count
      const episodesResponse = await this.makeRequest('/api/v3/episode', {
        method: 'GET',
        headers
      })

      let episodesCount = 0
      if (episodesResponse.ok) {
        const episodesData = await episodesResponse.json()
        episodesCount = episodesData.length
      }

      // Get queue count
      const queueResponse = await this.makeRequest('/api/v3/queue', {
        method: 'GET',
        headers
      })

      let queueCount = 0
      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        queueCount = queueData.totalRecords || 0
      }

      // Get system status for warnings
      const systemStatusResponse = await this.makeRequest('/api/v3/system/status', {
        method: 'GET',
        headers
      })

      let warningsCount = 0
      if (systemStatusResponse.ok) {
        const statusData = await systemStatusResponse.json()
        // Sonarr doesn't provide warnings count directly, so we'll set it to 0
        warningsCount = 0
      }

      const data: SonarrStats = {
        series: seriesCount,
        episodes: episodesCount,
        queue: queueCount,
        warnings: warningsCount
      }

      // Validate data with Zod schema
      const validatedData = SonarrStatsSchema.parse(data)
      
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
      headers['X-Api-Key'] = this.config.apiKey
    }
    
    return headers
  }
}
