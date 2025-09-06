import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { JellyfinStatsSchema, type JellyfinStats } from '@/lib/schemas/widgets'

export interface JellyfinConfig extends AdapterConfig {
  apiKey?: string
}

export class JellyfinAdapter extends BaseAdapter<JellyfinConfig, JellyfinStats> {
  constructor(config: JellyfinConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData(): Promise<AdapterResponse<JellyfinStats>> {
    try {
      const headers = this.getAuthHeaders()

      // Get system info
      const systemResponse = await this.makeRequest('/System/Info', {
        method: 'GET',
        headers
      })

      if (!systemResponse.ok) {
        throw new Error(`Jellyfin API error: ${systemResponse.status} ${systemResponse.statusText}`)
      }

      // Get users count
      const usersResponse = await this.makeRequest('/Users', {
        method: 'GET',
        headers
      })

      let usersCount = 0
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        usersCount = usersData.length
      }

      // Get items count
      const itemsResponse = await this.makeRequest('/Items/Counts', {
        method: 'GET',
        headers
      })

      let moviesCount = 0
      let showsCount = 0
      let episodesCount = 0

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        moviesCount = itemsData.MovieCount || 0
        showsCount = itemsData.SeriesCount || 0
        episodesCount = itemsData.EpisodeCount || 0
      }

      const data: JellyfinStats = {
        users: usersCount,
        movies: moviesCount,
        shows: showsCount,
        episodes: episodesCount
      }

      // Validate data with Zod schema
      const validatedData = JellyfinStatsSchema.parse(data)
      
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
      headers['X-Emby-Token'] = this.config.apiKey
    }
    
    return headers
  }
}
