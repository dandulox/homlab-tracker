import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { NPMStatsSchema, type NPMStats } from '@/lib/schemas/widgets'

export interface NPMConfig extends AdapterConfig {
  token?: string
}

export class NPMAdapter extends BaseAdapter<NPMConfig, NPMStats> {
  constructor(config: NPMConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData(): Promise<AdapterResponse<NPMStats>> {
    try {
      // Get proxy hosts
      const hostsResponse = await this.makeRequest('/api/nginx/proxy-hosts', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!hostsResponse.ok) {
        throw new Error(`NPM API error: ${hostsResponse.status} ${hostsResponse.statusText}`)
      }

      const hostsData = await hostsResponse.json()

      // Get SSL certificates
      const certsResponse = await this.makeRequest('/api/nginx/certificates', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      let sslCertificates = 0
      let expiringSoon = 0
      
      if (certsResponse.ok) {
        const certsData = await certsResponse.json()
        sslCertificates = certsData.length || 0
        
        // Check for expiring certificates (within 30 days)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        for (const cert of certsData) {
          if (cert.meta && cert.meta.valid_to) {
            const validTo = new Date(cert.meta.valid_to)
            if (validTo < thirtyDaysFromNow) {
              expiringSoon++
            }
          }
        }
      }

      const data: NPMStats = {
        total_hosts: hostsData.length || 0,
        ssl_certificates: sslCertificates,
        expiring_soon: expiringSoon
      }

      // Validate data with Zod schema
      const validatedData = NPMStatsSchema.parse(data)
      
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
    
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`
    }
    
    return headers
  }
}
