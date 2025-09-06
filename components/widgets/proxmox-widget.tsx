'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ProxmoxNode, type ProxmoxVM } from '@/lib/schemas'

interface ProxmoxWidgetProps {
  enabled: boolean
}

interface ProxmoxData {
  nodes: ProxmoxNode[]
  vms: ProxmoxVM[]
  lastUpdate: string
}

export function ProxmoxWidget({ enabled }: ProxmoxWidgetProps) {
  const [data, setData] = useState<ProxmoxData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/widgets/proxmox')
      if (!response.ok) {
        throw new Error('Failed to fetch Proxmox data')
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
            <Server className="h-5 w-5" />
            <span>Proxmox</span>
            <Badge variant="secondary">Deaktiviert</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Proxmox-Widget ist deaktiviert. Aktivieren Sie es in den Einstellungen.
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
            <Server className="h-5 w-5" />
            <span>Proxmox</span>
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
            <Server className="h-5 w-5" />
            <span>Proxmox</span>
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

  const totalNodes = data.nodes.length
  const onlineNodes = data.nodes.filter(n => n.status === 'online').length
  const totalVMs = data.vms.length
  const runningVMs = data.vms.filter(v => v.status === 'running').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Proxmox</span>
            <Badge variant="outline">{onlineNodes}/{totalNodes} Nodes</Badge>
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
        {/* Node Overview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Nodes</h4>
          {data.nodes.map((node) => (
            <div key={node.node} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{node.node}</span>
                <Badge 
                  variant={node.status === 'online' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {node.status === 'online' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {node.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1">
                    <Cpu className="h-3 w-3" />
                    <span>CPU</span>
                  </span>
                  <span>{node.cpu}%</span>
                </div>
                <Progress value={node.cpu} className="h-1" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1">
                    <MemoryStick className="h-3 w-3" />
                    <span>RAM</span>
                  </span>
                  <span>{node.memory}%</span>
                </div>
                <Progress value={node.memory} className="h-1" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1">
                    <HardDrive className="h-3 w-3" />
                    <span>Storage</span>
                  </span>
                  <span>{node.storage}%</span>
                </div>
                <Progress value={node.storage} className="h-1" />
              </div>
            </div>
          ))}
        </div>

        {/* VM Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">VMs</h4>
            <Badge variant="outline" className="text-xs">
              {runningVMs}/{totalVMs} aktiv
            </Badge>
          </div>
          
          {data.vms.slice(0, 3).map((vm) => (
            <div key={vm.vmid} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  vm.status === 'running' ? "bg-green-500" : "bg-gray-400"
                )} />
                <span className="truncate">{vm.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{vm.cpu}% CPU</span>
                <span>{vm.memory}% RAM</span>
              </div>
            </div>
          ))}
          
          {data.vms.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{data.vms.length - 3} weitere VMs
            </p>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Letzte Aktualisierung: {new Date(data.lastUpdate).toLocaleTimeString('de-DE')}
        </div>
      </CardContent>
    </Card>
  )
}