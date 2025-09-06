'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Filter, 
  Shield, 
  Globe, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type AdGuardStats } from '@/lib/schemas'

interface AdGuardWidgetProps {
  enabled: boolean
}

interface AdGuardData extends AdGuardStats {
  lastUpdate: string
}

export function AdGuardWidget({ enabled }: AdGuardWidgetProps) {
  const [data, setData] = useState<AdGuardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/widgets/adguard')
      if (!response.ok) {
        throw new Error('Failed to fetch AdGuard data')
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
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>AdGuard Home</span>
            <Badge variant="secondary">Deaktiviert</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AdGuard-Widget ist deaktiviert. Aktivieren Sie es in den Einstellungen.
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
            <Filter className="h-5 w-5" />
            <span>AdGuard Home</span>
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
            <Filter className="h-5 w-5" />
            <span>AdGuard Home</span>
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

  const blockedPercentage = data.blocked_percentage
  const allowedQueries = data.queries_today - data.blocked_today

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>AdGuard Home</span>
            <Badge variant="outline">{blockedPercentage.toFixed(1)}% blockiert</Badge>
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
        {/* Today's Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Heute</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Queries</span>
                </span>
                <span className="font-medium">{data.queries_today.toLocaleString('de-DE')}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Geblockt</span>
                </span>
                <span className="font-medium text-red-600">{data.blocked_today.toLocaleString('de-DE')}</span>
              </div>
            </div>
          </div>

          {/* Block Rate Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Block-Rate</span>
              <span>{blockedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={blockedPercentage} className="h-2" />
          </div>
        </div>

        {/* Top Blocked Domains */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Top blockierte Domains</h4>
          {data.top_domains.slice(0, 5).map((domain, index) => (
            <div key={domain.domain} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                <span className="truncate font-mono text-xs">{domain.domain}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {domain.count}
              </Badge>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Erlaubte Queries</span>
            <span className="font-medium text-green-600">
              {allowedQueries.toLocaleString('de-DE')}
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