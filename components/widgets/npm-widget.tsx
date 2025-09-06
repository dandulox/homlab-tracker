'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Shield, 
  AlertTriangle, 
  RefreshCw,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NPMStats } from '@/lib/schemas'

interface NPMWidgetProps {
  enabled: boolean
}

interface NPMData extends NPMStats {
  lastUpdate: string
  expiringCerts: Array<{
    domain: string
    expiresIn: number
  }>
}

export function NPMWidget({ enabled }: NPMWidgetProps) {
  const [data, setData] = useState<NPMData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/widgets/npm')
      if (!response.ok) {
        throw new Error('Failed to fetch NPM data')
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
    const interval = setInterval(fetchData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Nginx Proxy Manager</span>
            <Badge variant="secondary">Deaktiviert</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            NPM-Widget ist deaktiviert. Aktivieren Sie es in den Einstellungen.
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
            <Globe className="h-5 w-5" />
            <span>Nginx Proxy Manager</span>
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
            <Globe className="h-5 w-5" />
            <span>Nginx Proxy Manager</span>
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

  const getCertStatus = (expiresIn: number) => {
    if (expiresIn < 7) return 'critical'
    if (expiresIn < 30) return 'warning'
    return 'good'
  }

  const getCertStatusIcon = (expiresIn: number) => {
    const status = getCertStatus(expiresIn)
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      case 'warning':
        return <Clock className="h-3 w-3 text-yellow-500" />
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />
    }
  }

  const getCertStatusColor = (expiresIn: number) => {
    const status = getCertStatus(expiresIn)
    switch (status) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Nginx Proxy Manager</span>
            <Badge variant="outline">{data.total_hosts} Hosts</Badge>
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
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <ExternalLink className="h-3 w-3" />
                <span>Proxy Hosts</span>
              </span>
              <span className="font-medium">{data.total_hosts}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>SSL Zertifikate</span>
              </span>
              <span className="font-medium">{data.ssl_certificates}</span>
            </div>
          </div>
        </div>

        {/* SSL Certificate Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">SSL Zertifikate</h4>
            {data.expiring_soon > 0 && (
              <Badge variant="destructive" className="text-xs">
                {data.expiring_soon} laufen bald ab
              </Badge>
            )}
          </div>
          
          {data.expiringCerts && data.expiringCerts.length > 0 ? (
            <div className="space-y-2">
              {data.expiringCerts.slice(0, 5).map((cert) => (
                <div key={cert.domain} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {getCertStatusIcon(cert.expiresIn)}
                    <span className="truncate font-mono text-xs">{cert.domain}</span>
                  </div>
                  <Badge 
                    variant={getCertStatusColor(cert.expiresIn)}
                    className="text-xs"
                  >
                    {cert.expiresIn < 1 ? 'Heute' : 
                     cert.expiresIn === 1 ? '1 Tag' : 
                     `${cert.expiresIn} Tage`}
                  </Badge>
                </div>
              ))}
              
              {data.expiringCerts.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{data.expiringCerts.length - 5} weitere Zertifikate
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Alle Zertifikate sind gültig</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gültige Zertifikate</span>
            <span className="font-medium text-green-600">
              {data.ssl_certificates - data.expiring_soon}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Letzte Aktualisierung: {new Date(data.lastUpdate).toLocaleTimeString('de-DE')}
        </div>
      </CardContent>
    </Card>
  )
}