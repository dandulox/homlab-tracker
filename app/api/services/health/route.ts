import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config'
import { healthStatusSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceName = searchParams.get('service')
    
    if (!serviceName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      )
    }

    const config = await configManager.loadConfig()
    const service = config.services.find(s => s.name === serviceName)
    
    if (!service || !service.health) {
      return NextResponse.json(
        { error: 'Service not found or no health check configured' },
        { status: 404 }
      )
    }

    // Perform health check
    const healthStatus = await performHealthCheck(service.health)
    
    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error('Error performing health check:', error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { services } = body
    
    if (!Array.isArray(services)) {
      return NextResponse.json(
        { error: 'Services array is required' },
        { status: 400 }
      )
    }

    const config = await configManager.loadConfig()
    const healthStatuses: Record<string, any> = {}
    
    // Perform health checks for all services in parallel
    const healthCheckPromises = services.map(async (serviceName: string) => {
      const service = config.services.find(s => s.name === serviceName)
      if (service && service.health) {
        try {
          const status = await performHealthCheck(service.health)
          healthStatuses[serviceName] = status
        } catch (error) {
          healthStatuses[serviceName] = {
            status: 'down',
            lastCheck: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    })
    
    await Promise.all(healthCheckPromises)
    
    return NextResponse.json(healthStatuses)
  } catch (error) {
    console.error('Error performing bulk health checks:', error)
    return NextResponse.json(
      { error: 'Bulk health check failed' },
      { status: 500 }
    )
  }
}

async function performHealthCheck(health: any) {
  const startTime = Date.now()
  
  try {
    if (health.type === 'ping') {
      // Simple ping simulation - in production, you'd use a proper ping library
      const response = await fetch(`http://${health.host}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(health.interval * 1000)
      })
      
      if (response.ok) {
        return {
          status: 'up',
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } else if (health.type === 'http') {
      const response = await fetch(health.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(health.interval * 1000)
      })
      
      if (response.ok) {
        return {
          status: 'up',
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } else {
      throw new Error('Unknown health check type')
    }
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
