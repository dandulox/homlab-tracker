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
          title: 'Erfolg',
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

  const addService = () => {
    if (!config) return

    const newService: Service = {
      name: 'Neuer Service',
      url: 'https://example.com',
      icon: 'Box',
      group: config.groups[0]?.name || 'Unbekannt',
      tags: [],
      order: config.services.length,
    }

    setConfig({
      ...config,
      services: [...config.services, newService],
    })
  }

  const updateService = (index: number, updatedService: Service) => {
    if (!config) return

    const newServices = [...config.services]
    newServices[index] = updatedService
    setConfig({ ...config, services: newServices })
  }

  const removeService = (index: number) => {
    if (!config) return

    const newServices = config.services.filter((_, i) => i !== index)
    setConfig({ ...config, services: newServices })
  }

  const addGroup = () => {
    if (!config) return

    const newGroup: Group = {
      name: 'Neue Gruppe',
      icon: 'Folder',
      order: config.groups.length,
    }

    setConfig({
      ...config,
      groups: [...config.groups, newGroup],
    })
  }

  const updateGroup = (index: number, updatedGroup: Group) => {
    if (!config) return

    const newGroups = [...config.groups]
    newGroups[index] = updatedGroup
    setConfig({ ...config, groups: newGroups })
  }

  const removeGroup = (index: number) => {
    if (!config) return

    const newGroups = config.groups.filter((_, i) => i !== index)
    setConfig({ ...config, groups: newGroups })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Konfiguration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Konfiguration konnte nicht geladen werden</p>
          <Button onClick={loadConfig} className="mt-4">
            Erneut versuchen
          </Button>
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
              <h1 className="text-xl font-bold">Labora Administration</h1>
              <p className="text-sm text-muted-foreground">Konfiguration verwalten</p>
            </div>
          </div>
          <Button onClick={saveConfig} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="groups">Gruppen</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
          </TabsList>

          {/* General Settings */}
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
                    onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="system">System</option>
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auth"
                    checked={config.auth.enabled}
                    onCheckedChange={(checked) => 
                      setConfig({ 
                        ...config, 
                        auth: { ...config.auth, enabled: checked }
                      })
                    }
                  />
                  <Label htmlFor="auth">Authentifizierung aktivieren</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Services</span>
                    <Badge variant="outline">{config.services.length}</Badge>
                  </div>
                  <Button onClick={addService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Service hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.services.map((service, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateService(index, { ...service, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={service.url}
                            onChange={(e) => updateService(index, { ...service, url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gruppe</Label>
                          <select
                            value={service.group}
                            onChange={(e) => updateService(index, { ...service, group: e.target.value })}
                            className="w-full p-2 border rounded-md"
                          >
                            {config.groups.map((group) => (
                              <option key={group.name} value={group.name}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>VLAN</Label>
                          <Input
                            type="number"
                            value={service.vlan || ''}
                            onChange={(e) => updateService(index, { 
                              ...service, 
                              vlan: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tags (kommagetrennt)</Label>
                          <Input
                            value={service.tags.join(', ')}
                            onChange={(e) => updateService(index, { 
                              ...service, 
                              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                            })}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeService(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups */}
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Gruppen</span>
                    <Badge variant="outline">{config.groups.length}</Badge>
                  </div>
                  <Button onClick={addGroup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Gruppe hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.groups.map((group, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={group.name}
                            onChange={(e) => updateGroup(index, { ...group, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Input
                            value={group.icon}
                            onChange={(e) => updateGroup(index, { ...group, icon: e.target.value })}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeGroup(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widgets */}
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
                        <p className="font-medium">Proxmox</p>
                        <p className="text-sm text-muted-foreground">VM-Übersicht und Status</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.widgets.proxmox.enabled}
                      onCheckedChange={(checked) => 
                        setConfig({ 
                          ...config, 
                          widgets: { 
                            ...config.widgets, 
                            proxmox: { enabled: checked }
                          }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <p className="font-medium">pfSense</p>
                        <p className="text-sm text-muted-foreground">Gateway- und Interface-Status</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.widgets.pfsense.enabled}
                      onCheckedChange={(checked) => 
                        setConfig({ 
                          ...config, 
                          widgets: { 
                            ...config.widgets, 
                            pfsense: { enabled: checked }
                          }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Filter className="h-5 w-5" />
                      <div>
                        <p className="font-medium">AdGuard Home</p>
                        <p className="text-sm text-muted-foreground">DNS-Statistiken und Blocking</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.widgets.adguard.enabled}
                      onCheckedChange={(checked) => 
                        setConfig({ 
                          ...config, 
                          widgets: { 
                            ...config.widgets, 
                            adguard: { enabled: checked }
                          }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Nginx Proxy Manager</p>
                        <p className="text-sm text-muted-foreground">Proxy-Hosts und SSL-Status</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.widgets.npm.enabled}
                      onCheckedChange={(checked) => 
                        setConfig({ 
                          ...config, 
                          widgets: { 
                            ...config.widgets, 
                            npm: { enabled: checked }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}