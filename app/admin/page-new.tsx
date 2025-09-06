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
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Settings,
  Server,
  Globe,
  Filter,
  Shield
} from 'lucide-react'
import { type Config, type Service, type Group } from '@/lib/schemas'
import { ServiceList } from '@/components/admin/service-list'
import { ServiceForm } from '@/components/admin/service-form'
import { useToast } from '@/components/ui/use-toast'

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<Config | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list')
  const [editingService, setEditingService] = useState<Service | undefined>(undefined)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        toast({
          title: 'Fehler',
          description: 'Konfiguration konnte nicht geladen werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Konfiguration',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: 'Erfolgreich gespeichert',
          description: 'Konfiguration wurde gespeichert',
        })
      } else {
        throw new Error('Failed to save config')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Konfiguration konnte nicht gespeichert werden',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Service management functions
  const handleAddService = () => {
    setEditingService(undefined)
    setCurrentView('form')
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setCurrentView('form')
  }

  const handleSaveService = (service: Service) => {
    if (!config) return

    const updatedServices = editingService
      ? config.services.map(s => s.id === service.id ? service : s)
      : [...config.services, service]

    setConfig({
      ...config,
      services: updatedServices
    })

    setCurrentView('list')
    setEditingService(undefined)
    
    toast({
      title: 'Service gespeichert',
      description: `${service.name} wurde ${editingService ? 'aktualisiert' : 'hinzugefügt'}`,
    })
  }

  const handleDuplicateService = (service: Service) => {
    if (!config) return

    const duplicatedService = {
      ...service,
      id: `service-${Date.now()}`,
      name: `${service.name} (Kopie)`,
      instanceId: `${service.instanceId}-copy`
    }

    setConfig({
      ...config,
      services: [...config.services, duplicatedService]
    })

    toast({
      title: 'Service dupliziert',
      description: `${service.name} wurde dupliziert`,
    })
  }

  const handleDeleteService = (service: Service) => {
    if (!config) return

    setConfig({
      ...config,
      services: config.services.filter(s => s.id !== service.id)
    })

    toast({
      title: 'Service gelöscht',
      description: `${service.name} wurde gelöscht`,
    })
  }

  const handleTestService = async (service: Service) => {
    try {
      // Test service connectivity
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service }),
      })

      if (!response.ok) {
        throw new Error('Service test failed')
      }

      const result = await response.json()
      
      if (result.status === 'up') {
        toast({
          title: 'Service-Test erfolgreich',
          description: `${service.name} ist erreichbar`,
        })
      } else {
        throw new Error(result.error || 'Service not reachable')
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Service test failed')
    }
  }

  const handleCancelEdit = () => {
    setCurrentView('list')
    setEditingService(undefined)
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Lade Konfiguration...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fehler</h1>
          <p className="text-muted-foreground mb-4">
            Konfiguration konnte nicht geladen werden.
          </p>
          <Button onClick={loadConfig}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <h1 className="text-lg font-semibold">Administration</h1>
            </div>
            
            {currentView === 'list' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveConfig}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Speichere...' : 'Speichern'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {currentView === 'list' ? (
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="groups">Gruppen</TabsTrigger>
              <TabsTrigger value="widgets">Widgets</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services">
              <ServiceList
                services={config.services}
                onAddService={handleAddService}
                onEditService={handleEditService}
                onDuplicateService={handleDuplicateService}
                onDeleteService={handleDeleteService}
                onTestService={handleTestService}
              />
            </TabsContent>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Allgemeine Einstellungen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titel</Label>
                      <Input
                        id="title"
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <Input
                        id="description"
                        value={config.description}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      value={config.theme}
                      onChange={(e) => setConfig({ ...config, theme: e.target.value as 'light' | 'dark' | 'system' })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="system">System</option>
                      <option value="light">Hell</option>
                      <option value="dark">Dunkel</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auth-enabled"
                      checked={config.auth.enabled}
                      onCheckedChange={(enabled) => setConfig({ 
                        ...config, 
                        auth: { ...config.auth, enabled } 
                      })}
                    />
                    <Label htmlFor="auth-enabled">Authentifizierung aktivieren</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Gruppen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.groups.map((group, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Icon: {group.icon} | Reihenfolge: {group.order}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newGroups = config.groups.filter((_, i) => i !== index)
                          setConfig({ ...config, groups: newGroups })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newGroup: Group = {
                        name: 'Neue Gruppe',
                        icon: 'Folder',
                        order: config.groups.length
                      }
                      setConfig({ ...config, groups: [...config.groups, newGroup] })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Gruppe hinzufügen
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Widgets Tab */}
            <TabsContent value="widgets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Widgets</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Server className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Proxmox</div>
                          <div className="text-sm text-muted-foreground">Virtualisierung</div>
                        </div>
                      </div>
                      <Switch
                        checked={config.widgets?.proxmox?.enabled || false}
                        onCheckedChange={(enabled) => setConfig({
                          ...config,
                          widgets: {
                            ...config.widgets,
                            proxmox: { enabled }
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5" />
                        <div>
                          <div className="font-medium">pfSense</div>
                          <div className="text-sm text-muted-foreground">Firewall</div>
                        </div>
                      </div>
                      <Switch
                        checked={config.widgets?.pfsense?.enabled || false}
                        onCheckedChange={(enabled) => setConfig({
                          ...config,
                          widgets: {
                            ...config.widgets,
                            pfsense: { enabled }
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Filter className="h-5 w-5" />
                        <div>
                          <div className="font-medium">AdGuard</div>
                          <div className="text-sm text-muted-foreground">DNS-Filter</div>
                        </div>
                      </div>
                      <Switch
                        checked={config.widgets?.adguard?.enabled || false}
                        onCheckedChange={(enabled) => setConfig({
                          ...config,
                          widgets: {
                            ...config.widgets,
                            adguard: { enabled }
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5" />
                        <div>
                          <div className="font-medium">NPM</div>
                          <div className="text-sm text-muted-foreground">Reverse Proxy</div>
                        </div>
                      </div>
                      <Switch
                        checked={config.widgets?.npm?.enabled || false}
                        onCheckedChange={(enabled) => setConfig({
                          ...config,
                          widgets: {
                            ...config.widgets,
                            npm: { enabled }
                          }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <ServiceForm
            service={editingService}
            onSave={handleSaveService}
            onCancel={handleCancelEdit}
            onTest={handleTestService}
          />
        )}
      </div>
    </div>
  )
}
