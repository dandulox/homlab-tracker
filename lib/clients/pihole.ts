import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { PiHoleStatsSchema, type PiHoleStats } from '@/lib/schemas/widgets'

export interface PiHoleConfig extends AdapterConfig {
  token?: string
  version: 'v5' | 'v6'
}

export class PiHoleAdapter extends BaseAdapter<PiHoleConfig, PiHoleStats> {
  constructor(config: PiHoleConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData(): Promise<AdapterResponse<PiHoleStats>> {
    try {
      // Get summary stats
      const summaryResponse = await this.makeRequest('/admin/api.php?summary', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!summaryResponse.ok) {
        throw new Error(`Pi-hole API error: ${summaryResponse.status} ${summaryResponse.statusText}`)
      }

      const summaryData = await summaryResponse.json()

      // Get top blocked domains
      const topDomainsResponse = await this.makeRequest('/admin/api.php?topItems=10', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      let topDomains: Array<{ domain: string; count: number }> = []
      
      if (topDomainsResponse.ok) {
        const topData = await topDomainsResponse.json()
        
        if (topData.top_ads) {
          topDomains = Object.entries(topData.top_ads)
            .slice(0, 10)
            .map(([domain, count]) => ({
              domain,
              count: typeof count === 'number' ? count : parseInt(count as string) || 0
            }))
        }
      }

      const data: PiHoleStats = {
        queries_today: parseInt(summaryData.dns_queries_today) || 0,
        blocked_today: parseInt(summaryData.ads_blocked_today) || 0,
        blocked_percentage: parseFloat(summaryData.ads_percentage_today) || 0,
        top_domains: topDomains
      }

      // Validate data with Zod schema
      const validatedData = PiHoleStatsSchema.parse(data)
      
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
      headers['X-Pi-hole-Auth'] = this.config.token
    }
    
    return headers
  }
}
