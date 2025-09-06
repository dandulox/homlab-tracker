'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Globe, 
  Wifi, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PfSenseGateway, type PfSenseInterface } from '@/lib/schemas'

interface PfSenseWidgetProps {
  enabled: boolean
}

interface PfSenseData {
  gateways: PfSenseGateway[]
  interfaces: PfSenseInterface[]
  wanIp: string
  lastUpdate: string
}

export function PfSenseWidget({ enabled }: PfSenseWidgetProps) {
  const [data, setData] = useState<PfSenseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/widgets/pfsense')
      if (!response.ok) {
        throw new Error('Failed to fetch pfSense data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>pfSense</span>
            <Badge variant="secondary">Deaktiviert</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            pfSense-Widget ist deaktiviert. Aktivieren Sie es in den Einstellungen.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>pfSense</span>
            <Badge variant="destructive">Fehler</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>pfSense</span>
            <Badge variant="secondary">Lädt...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Lade Daten...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const onlineGateways = data.gateways.filter(g => g.status === 'online').length
  const totalGateways = data.gateways.length
  const onlineInterfaces = data.interfaces.filter(i => i.status === 'up').length
  const totalInterfaces = data.interfaces.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>pfSense</span>
            <Badge variant="outline">{onlineGateways}/{totalGateways} Gateways</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WAN IP */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">WAN IP</h4>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{data.wanIp}</span>
          </div>
        </div>

        {/* Gateways */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Gateways</h4>
          {data.gateways.map((gateway) => (
            <div key={gateway.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  gateway.status === 'online' ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm">{gateway.name}</span>
              </div>
              <Badge 
                variant={gateway.status === 'online' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {gateway.status === 'online' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {gateway.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Interfaces */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Interfaces</h4>
            <Badge variant="outline" className="text-xs">
              {onlineInterfaces}/{totalInterfaces} aktiv
            </Badge>
          </div>
          
          {data.interfaces.map((iface) => (
            <div key={iface.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{iface.name}</span>
                {iface.ip && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {iface.ip}
                  </span>
                )}
              </div>
              <Badge 
                variant={iface.status === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {iface.status === 'up' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {iface.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Letzte Aktualisierung: {new Date(data.lastUpdate).toLocaleTimeString('de-DE')}
        </div>
      </CardContent>
    </Card>
  )
}