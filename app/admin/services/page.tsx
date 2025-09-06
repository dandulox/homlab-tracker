'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy,
  TestTube,
  Server,
  Globe,
  Filter,
  Shield,
  Activity,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { Service, ServiceType, AuthMode, ServiceRegistry } from '@/lib/schemas/service'
import { useToast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'

interface ServiceInstance {
  service: Service
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown'
  lastHealthCheck?: Date
  adapterCount: number
}

export default function ServiceManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'proxmox', label: 'Proxmox VE' },
    { value: 'nginxpm', label: 'Nginx Proxy Manager' },
    { value: 'nextcloud', label: 'Nextcloud' },
    { value: 'qbittorrent', label: 'qBittorrent' },
    { value: 'radarr', label: 'Radarr' },
    { value: 'sonarr', label: 'Sonarr' },
    { value: 'sabnzbd', label: 'SABnzbd' },
    { value: 'adguard', label: 'AdGuard Home' },
    { value: 'pihole', label: 'Pi-hole' },
    { value: 'portainer', label: 'Portainer' },
    { value: 'prometheus', label: 'Prometheus' },
    { value: 'openweathermap', label: 'OpenWeatherMap' },
    { value: 'lidarr', label: 'Lidarr' },
    { value: 'medusa', label: 'Medusa' },
    { value: 'paperless', label: 'Paperless-ngx' },
    { value: 'photoprism', label: 'PhotoPrism' },
    { value: 'homebridge', label: 'Homebridge' },
    { value: 'immich', label: 'Immich' },
    { value: 'komga', label: 'Komga' },
    { value: 'navidrome', label: 'Navidrome' },
    { value: 'octoprint', label: 'OctoPrint' },
    { value: 'generic', label: 'Generic' }
  ]

  const authModes: { value: AuthMode; label: string }[] = [
    { value: 'none', label: 'Keine Authentifizierung' },
    { value: 'header_forward', label: 'Header Forward (NPM/Authelia)' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'jwt', label: 'JWT Token' }
  ]

  const groups = [
    'Netzwerk',
    'Medien',
    'Infra',
    'Monitoring',
    'Info',
    'Development',
    'Security'
  ]

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services?includeHealth=true')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        toast({
          title: 'Fehler',
          description: 'Services konnten nicht geladen werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Services',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveServices = async () => {
    setIsSaving(true)
    try {
      const registry: ServiceRegistry = {
        services: services.map(s => s.service)
      }

      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registry),
      })

      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Services wurden gespeichert',
        })
        await loadServices()
      } else {
        throw new Error('Failed to save services')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Services konnten nicht gespeichert werden',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addService = () => {
    const newService: Service = {
      id: uuidv4(),
      type: 'generic',
      instanceId: 'main',
      name: 'Neuer Service',
      url: 'https://example.com',
      group: 'Netzwerk',
      tags: [],
      auth: { mode: 'none' }
    }

    setSelectedService(newService)
  }

  const updateService = (service: Service) => {
    setServices(prev => prev.map(s => 
      s.service.id === service.id 
        ? { ...s, service }
        : s
    ))
    setSelectedService(service)
  }

  const removeService = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.type}/${service.instanceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Service wurde entfernt',
        })
        await loadServices()
      } else {
        throw new Error('Failed to delete service')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Service konnte nicht entfernt werden',
        variant: 'destructive',
      })
    }
  }

  const duplicateService = async (service: Service) => {
    try {
      const newInstanceId = `${service.instanceId}-copy`
      const response = await fetch(`/api/services/${service.type}/${service.instanceId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newInstanceId }),
      })

      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Service wurde dupliziert',
        })
        await loadServices()
      } else {
        throw new Error('Failed to duplicate service')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Service konnte nicht dupliziert werden',
        variant: 'destructive',
      })
    }
  }

  const testService = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.type}/${service.instanceId}/health`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Health-Check Ergebnis',
          description: `Status: ${result.overallStatus}`,
        })
        await loadServices()
      } else {
        throw new Error('Health check failed')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Health-Check fehlgeschlagen',
        variant: 'destructive',
      })
    }
  }

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return <Activity className="h-4 w-4 text-green-600" />
      case 'unhealthy': return <Activity className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Service Management</h1>
              <p className="text-sm text-muted-foreground">Services verwalten und konfigurieren</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAdvanced ? 'Einfach' : 'Erweitert'}
            </Button>
            <Button onClick={saveServices} disabled={isSaving}>
              <Settings className="h-4 w-4 mr-2" />
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Liste */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Services</span>
                    <Badge variant="outline">{services.length}</Badge>
                  </div>
                  <Button onClick={addService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Service hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((serviceInstance) => (
                  <Card key={serviceInstance.service.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedService(serviceInstance.service)}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getHealthStatusIcon(serviceInstance.healthStatus)}
                          <div>
                            <h3 className="font-medium">{serviceInstance.service.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {serviceInstance.service.type} • {serviceInstance.service.group}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {serviceInstance.service.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getHealthStatusColor(serviceInstance.healthStatus)}>
                            {serviceInstance.healthStatus || 'unknown'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                testService(serviceInstance.service)
                              }}
                            >
                              <TestTube className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateService(serviceInstance.service)
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeService(serviceInstance.service)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Service Editor */}
          <div className="space-y-4">
            {selectedService ? (
              <Card>
                <CardHeader>
                  <CardTitle>Service bearbeiten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Service-Typ</Label>
                    <Select
                      value={selectedService.type}
                      onValueChange={(value) => updateService({ ...selectedService, type: value as ServiceType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Instance ID</Label>
                    <Input
                      value={selectedService.instanceId}
                      onChange={(e) => updateService({ ...selectedService, instanceId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={selectedService.name}
                      onChange={(e) => updateService({ ...selectedService, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={selectedService.url}
                      onChange={(e) => updateService({ ...selectedService, url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gruppe</Label>
                    <Select
                      value={selectedService.group}
                      onValueChange={(value) => updateService({ ...selectedService, group: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (kommagetrennt)</Label>
                    <Input
                      value={selectedService.tags?.join(', ') || ''}
                      onChange={(e) => updateService({ 
                        ...selectedService, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                    />
                  </div>

                  {showAdvanced && (
                    <>
                      <div className="space-y-2">
                        <Label>Authentifizierung</Label>
                        <Select
                          value={selectedService.auth?.mode || 'none'}
                          onValueChange={(value) => updateService({ 
                            ...selectedService, 
                            auth: { mode: value as AuthMode }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {authModes.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedService.auth?.mode === 'basic' && (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          <div className="space-y-2">
                            <Label>Benutzername</Label>
                            <Input
                              value={selectedService.auth.basic?.username || ''}
                              onChange={(e) => updateService({ 
                                ...selectedService, 
                                auth: { 
                                  ...selectedService.auth,
                                  basic: { 
                                    ...selectedService.auth?.basic,
                                    username: e.target.value,
                                    password: selectedService.auth?.basic?.password || ''
                                  }
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Passwort</Label>
                            <Input
                              type="password"
                              value={selectedService.auth.basic?.password || ''}
                              onChange={(e) => updateService({ 
                                ...selectedService, 
                                auth: { 
                                  ...selectedService.auth,
                                  basic: { 
                                    ...selectedService.auth?.basic,
                                    username: selectedService.auth?.basic?.username || '',
                                    password: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {selectedService.auth?.mode === 'jwt' && (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          <div className="space-y-2">
                            <Label>JWT Token</Label>
                            <Input
                              type="password"
                              value={selectedService.auth.jwt?.token || ''}
                              onChange={(e) => updateService({ 
                                ...selectedService, 
                                auth: { 
                                  ...selectedService.auth,
                                  jwt: { token: e.target.value }
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Wähle einen Service aus, um ihn zu bearbeiten</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
