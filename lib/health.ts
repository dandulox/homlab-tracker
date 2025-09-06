import { type HealthCheck, type HealthStatus } from './schemas'

export class HealthChecker {
  private static instance: HealthChecker
  private cache = new Map<string, HealthStatus>()
  private intervals = new Map<string, NodeJS.Timeout>()

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker()
    }
    return HealthChecker.instance
  }

  async checkHealth(serviceName: string, healthCheck: HealthCheck): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      let status: 'up' | 'down' = 'down'
      let responseTime: number | undefined
      let error: string | undefined

      if (healthCheck.type === 'ping') {
        const result = await this.pingCheck(healthCheck.host!)
        status = result.success ? 'up' : 'down'
        responseTime = result.responseTime
        error = result.error
      } else if (healthCheck.type === 'http') {
        const result = await this.httpCheck(healthCheck.url!)
        status = result.success ? 'up' : 'down'
        responseTime = result.responseTime
        error = result.error
      }

      const healthStatus: HealthStatus = {
        status,
        lastCheck: new Date().toISOString(),
        responseTime,
        error,
      }

      this.cache.set(serviceName, healthStatus)
      return healthStatus
    } catch (err) {
      const healthStatus: HealthStatus = {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error',
      }
      
      this.cache.set(serviceName, healthStatus)
      return healthStatus
    }
  }

  private async pingCheck(host: string): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      // Simple HTTP ping check since we can't do ICMP in browser/Node.js easily
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`http://${host}`, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // Avoid CORS issues
      })
      
      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      
      return {
        success: true,
        responseTime,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ping failed',
      }
    }
  }

  private async httpCheck(url: string): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      
      return {
        success: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'HTTP check failed',
      }
    }
  }

  startMonitoring(serviceName: string, healthCheck: HealthCheck): void {
    // Clear existing interval if any
    this.stopMonitoring(serviceName)
    
    // Initial check
    this.checkHealth(serviceName, healthCheck)
    
    // Set up interval
    const interval = setInterval(() => {
      this.checkHealth(serviceName, healthCheck)
    }, healthCheck.interval * 1000)
    
    this.intervals.set(serviceName, interval)
  }

  stopMonitoring(serviceName: string): void {
    const interval = this.intervals.get(serviceName)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(serviceName)
    }
  }

  getHealthStatus(serviceName: string): HealthStatus | undefined {
    return this.cache.get(serviceName)
  }

  getAllHealthStatuses(): Record<string, HealthStatus> {
    const result: Record<string, HealthStatus> = {}
    for (const [serviceName, status] of this.cache.entries()) {
      result[serviceName] = status
    }
    return result
  }

  clearCache(): void {
    this.cache.clear()
  }

  stopAllMonitoring(): void {
    for (const [serviceName] of this.intervals.entries()) {
      this.stopMonitoring(serviceName)
    }
  }
}

export const healthChecker = HealthChecker.getInstance()
