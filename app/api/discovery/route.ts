import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config'
import { discoveryResultSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const config = await configManager.loadConfig()
    
    if (!config.discovery.enabled) {
      return NextResponse.json({ results: [] })
    }

    const results = await performDiscovery(config.discovery)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error performing discovery:', error)
    return NextResponse.json(
      { error: 'Discovery failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cidr, ports } = body
    
    const discoveryConfig = {
      enabled: true,
      cidr: cidr || ['10.0.10.0/24', '10.0.20.0/24'],
      http_ports: ports || [80, 443, 3000, 8080, 9000],
      ping_timeout_ms: 600
    }
    
    const results = await performDiscovery(discoveryConfig)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error performing custom discovery:', error)
    return NextResponse.json(
      { error: 'Custom discovery failed' },
      { status: 500 }
    )
  }
}

async function performDiscovery(discovery: any) {
  const results: any[] = []
  
  // Simple discovery implementation
  // In production, you'd use proper network scanning libraries
  for (const cidr of discovery.cidr) {
    const [network, prefix] = cidr.split('/')
    const [a, b, c] = network.split('.').map(Number)
    
    // Scan first 10 IPs in each subnet (for demo purposes)
    const maxHosts = Math.min(10, Math.pow(2, 32 - parseInt(prefix)) - 2)
    
    for (let i = 1; i <= maxHosts; i++) {
      const ip = `${a}.${b}.${c}.${i}`
      
      // Check common ports
      for (const port of discovery.http_ports) {
        try {
          const url = `http://${ip}:${port}`
          const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(1000)
          })
          
          if (response.ok) {
            results.push({
              host: ip,
              port: port,
              service: detectService(response),
              title: await detectTitle(url),
              status: 'up',
              responseTime: 100
            })
          }
        } catch (error) {
          // Service not available
        }
      }
    }
  }
  
  return results
}

function detectService(response: Response): string {
  const server = response.headers.get('server')?.toLowerCase() || ''
  const contentType = response.headers.get('content-type')?.toLowerCase() || ''
  
  if (server.includes('nginx')) return 'nginx'
  if (server.includes('apache')) return 'apache'
  if (contentType.includes('text/html')) return 'web'
  if (contentType.includes('application/json')) return 'api'
  
  return 'unknown'
}

async function detectTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2000)
    })
    
    if (response.ok) {
      const html = await response.text()
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        return titleMatch[1].trim()
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return 'Unknown Service'
}
