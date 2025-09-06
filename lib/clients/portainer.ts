import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { PortainerStatsSchema, type PortainerStats } from '@/lib/schemas/widgets'

export interface PortainerConfig extends AdapterConfig {
  apiKey?: string
  username?: string
  password?: string
}

export class PortainerAdapter extends BaseAdapter<PortainerConfig, PortainerStats> {
  constructor(config: PortainerConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl && (this.config.apiKey || (this.config.username && this.config.password)))
  }

  async fetchData(): Promise<AdapterResponse<PortainerStats>> {
    try {
      // Get endpoints (Docker environments)
      const endpointsResponse = await this.makeRequest('/api/endpoints', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!endpointsResponse.ok) {
        throw new Error(`Portainer API error: ${endpointsResponse.status} ${endpointsResponse.statusText}`)
      }

      const endpointsData = await endpointsResponse.json()

      let totalContainers = 0
      let totalImages = 0
      let totalVolumes = 0
      let totalNetworks = 0

      // Get stats for each endpoint
      for (const endpoint of endpointsData) {
        try {
          // Get containers
          const containersResponse = await this.makeRequest(`/api/endpoints/${endpoint.Id}/docker/containers/json?all=true`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          })

          if (containersResponse.ok) {
            const containersData = await containersResponse.json()
            totalContainers += containersData.length
          }

          // Get images
          const imagesResponse = await this.makeRequest(`/api/endpoints/${endpoint.Id}/docker/images/json`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          })

          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json()
            totalImages += imagesData.length
          }

          // Get volumes
          const volumesResponse = await this.makeRequest(`/api/endpoints/${endpoint.Id}/docker/volumes`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          })

          if (volumesResponse.ok) {
            const volumesData = await volumesResponse.json()
            totalVolumes += volumesData.Volumes?.length || 0
          }

          // Get networks
          const networksResponse = await this.makeRequest(`/api/endpoints/${endpoint.Id}/docker/networks`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          })

          if (networksResponse.ok) {
            const networksData = await networksResponse.json()
            totalNetworks += networksData.length
          }
        } catch (error) {
          // Continue with other endpoints if one fails
          console.warn(`Failed to get stats for endpoint ${endpoint.Id}:`, error)
        }
      }

      const data: PortainerStats = {
        containers: totalContainers,
        images: totalImages,
        volumes: totalVolumes,
        networks: totalNetworks
      }

      // Validate data with Zod schema
      const validatedData = PortainerStatsSchema.parse(data)
      
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
    const headers: Record<string, string> = {}
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey
    } else if (this.config.username && this.config.password) {
      const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
      headers['Authorization'] = `Basic ${credentials}`
    }
    
    return headers
  }
}
