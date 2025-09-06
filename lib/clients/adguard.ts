import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { AdGuardStatsSchema, type AdGuardStats } from '@/lib/schemas/widgets'

export interface AdGuardConfig extends AdapterConfig {
  username?: string
  password?: string
}

export class AdGuardAdapter extends BaseAdapter<AdGuardConfig, AdGuardStats> {
  constructor(config: AdGuardConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(this.config.baseUrl)
  }

  async fetchData(): Promise<AdapterResponse<AdGuardStats>> {
    try {
      // Get stats
      const statsResponse = await this.makeRequest('/control/stats', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!statsResponse.ok) {
        throw new Error(`AdGuard API error: ${statsResponse.status} ${statsResponse.statusText}`)
      }

      const statsData = await statsResponse.json()

      // Get top blocked domains
      const topDomainsResponse = await this.makeRequest('/control/querylog', {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      let topDomains: Array<{ domain: string; count: number }> = []
      
      if (topDomainsResponse.ok) {
        const queryLogData = await topDomainsResponse.json()
        
        // Process query log to get top blocked domains
        const domainCounts: Record<string, number> = {}
        
        if (queryLogData.data) {
          for (const entry of queryLogData.data) {
            if (entry.status === 'blocked' && entry.domain) {
              domainCounts[entry.domain] = (domainCounts[entry.domain] || 0) + 1
            }
          }
        }
        
        topDomains = Object.entries(domainCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([domain, count]) => ({ domain, count }))
      }

      const data: AdGuardStats = {
        queries_today: statsData.num_dns_queries || 0,
        blocked_today: statsData.num_blocked_filtering || 0,
        blocked_percentage: statsData.num_dns_queries > 0 
          ? Math.round((statsData.num_blocked_filtering / statsData.num_dns_queries) * 100 * 100) / 100
          : 0,
        top_domains: topDomains
      }

      // Validate data with Zod schema
      const validatedData = AdGuardStatsSchema.parse(data)
      
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
    
    if (this.config.username && this.config.password) {
      const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')
      headers['Authorization'] = `Basic ${credentials}`
    }
    
    return headers
  }
}
