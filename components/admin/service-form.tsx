'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  Copy, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Settings,
  Shield,
  Activity
} from 'lucide-react'
import { type Service, type ServiceAdapters, type AuthMode } from '@/lib/schemas/service'
import { 
  getAllPresets, 
  getPresetsByCategory, 
  getAllCategories,
  createServiceFromPreset,
  validateService,
  type ServicePreset 
} from '@/lib/presets'
import { useToast } from '@/components/ui/use-toast'

interface ServiceFormProps {
  service?: Service
  onSave: (service: Service) => void
  onCancel: () => void
  onTest?: (service: Service) => Promise<void>
}

export function ServiceForm({ service, onSave, onCancel, onTest }: ServiceFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Service>(service || {
    id: '',
    type: 'generic',
    instanceId: '',
    name: '',
    url: '',
    icon: 'Box',
    group: '',
    tags: [],
    template: { preset: 'foundation', fields: {} },
    checks: { adapters: {} },
    auth: { mode: 'none' },
    favorite: false,
    hidden: false,
    order: 0
  })

  const [selectedPreset, setSelectedPreset] = useState<string>('generic')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const presets = getAllPresets()
  const categories = getAllCategories()
  const selectedPresetData = presets.find(p => p.id === selectedPreset)

  useEffect(() => {
    if (service) {
      setFormData(service)
      setSelectedPreset(service.type)
    }
  }, [service])

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      const newService = createServiceFromPreset(presetId, formData.instanceId || 'main', {
        id: formData.id,
        instanceId: formData.instanceId,
        name: formData.name,
        url: formData.url,
        group: formData.group,
        tags: formData.tags,
        vlan: formData.vlan,
        order: formData.order
      })
      setFormData(newService)
    }
  }

  const handleInputChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAdapterToggle = (adapterType: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        adapters: {
          ...prev.checks?.adapters,
          [adapterType]: {
            ...prev.checks?.adapters?.[adapterType],
            enabled
          }
        }
      }
    }))
  }

  const handleAdapterConfigChange = (adapterType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        adapters: {
          ...prev.checks?.adapters,
          [adapterType]: {
            ...prev.checks?.adapters?.[adapterType],
            [field]: value
          }
        }
      }
    }))
  }

  const handleAuthModeChange = (mode: AuthMode) => {
    setFormData(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        mode,
        basic: mode === 'basic' ? { username: '', password: '' } : undefined,
        jwt: mode === 'jwt' ? { token: '' } : undefined,
        header_forward: mode === 'header_forward' ? { headerName: 'X-Forwarded-User' } : undefined
      }
    }))
  }

  const handleSave = () => {
    const validation = validateService(formData)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      toast({
        title: 'Validierungsfehler',
        description: validation.errors.join(', '),
        variant: 'destructive'
      })
      return
    }

    setValidationErrors([])
    onSave(formData)
  }

  const handleTest = async () => {
    if (!onTest) return

    setIsTesting(true)
    try {
      await onTest(formData)
      toast({
        title: 'Test erfolgreich',
        description: 'Service ist erreichbar und konfiguriert',
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Test fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: 'destructive'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const availableAdapters = selectedPresetData?.adapters || []

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Validierungsfehler:</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-red-600">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Grundlagen</TabsTrigger>
          <TabsTrigger value="adapters">Adapter</TabsTrigger>
          <TabsTrigger value="auth">Authentifizierung</TabsTrigger>
          <TabsTrigger value="advanced">Erweitert</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Grundlegende Einstellungen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preset">Service-Typ</Label>
                  <Select value={selectedPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Service-Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <div key={category.id}>
                          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                            {category.name}
                          </div>
                          {getPresetsByCategory(category.id).map(preset => (
                            <SelectItem key={preset.id} value={preset.id}>
                              <div className="flex items-center space-x-2">
                                <span>{preset.name}</span>
                                {preset.adapters.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {preset.adapters.length} Adapter
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instanceId">Instanz-ID</Label>
                  <Input
                    id="instanceId"
                    value={formData.instanceId}
                    onChange={(e) => handleInputChange('instanceId', e.target.value)}
                    placeholder="z.B. main, backup, prod"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Service-Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://service.example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">Gruppe</Label>
                  <Input
                    id="group"
                    value={formData.group}
                    onChange={(e) => handleInputChange('group', e.target.value)}
                    placeholder="Gruppe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vlan">VLAN</Label>
                  <Input
                    id="vlan"
                    type="number"
                    value={formData.vlan || ''}
                    onChange={(e) => handleInputChange('vlan', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="VLAN-Nummer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (kommagetrennt)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adapters */}
        <TabsContent value="adapters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>API-Adapter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableAdapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Adapter für diesen Service-Typ verfügbar</p>
                </div>
              ) : (
                availableAdapters.map(adapterType => {
                  const adapterConfig = formData.checks?.adapters?.[adapterType]
                  const isEnabled = adapterConfig?.enabled || false

                  return (
                    <Card key={adapterType} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium capitalize">{adapterType}</h3>
                            <Badge variant={isEnabled ? 'default' : 'secondary'}>
                              {isEnabled ? 'Aktiviert' : 'Deaktiviert'}
                            </Badge>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleAdapterToggle(adapterType, checked)}
                          />
                        </div>

                        {isEnabled && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`${adapterType}-baseUrl`}>Base URL</Label>
                              <Input
                                id={`${adapterType}-baseUrl`}
                                value={adapterConfig?.baseUrl || ''}
                                onChange={(e) => handleAdapterConfigChange(adapterType, 'baseUrl', e.target.value)}
                                placeholder="https://api.example.com"
                              />
                            </div>

                            {/* Adapter-specific fields */}
                            {adapterType === 'proxmox' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="proxmox-tokenId">Token ID</Label>
                                  <Input
                                    id="proxmox-tokenId"
                                    value={adapterConfig?.tokenId || ''}
                                    onChange={(e) => handleAdapterConfigChange(adapterType, 'tokenId', e.target.value)}
                                    placeholder="dashboard@pve!readonly"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="proxmox-tokenSecret">Token Secret</Label>
                                  <Input
                                    id="proxmox-tokenSecret"
                                    type="password"
                                    value={adapterConfig?.tokenSecret || ''}
                                    onChange={(e) => handleAdapterConfigChange(adapterType, 'tokenSecret', e.target.value)}
                                    placeholder="Token Secret"
                                  />
                                </div>
                              </div>
                            )}

                            {adapterType === 'adguard' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="adguard-username">Benutzername</Label>
                                  <Input
                                    id="adguard-username"
                                    value={adapterConfig?.username || ''}
                                    onChange={(e) => handleAdapterConfigChange(adapterType, 'username', e.target.value)}
                                    placeholder="admin"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="adguard-password">Passwort</Label>
                                  <Input
                                    id="adguard-password"
                                    type="password"
                                    value={adapterConfig?.password || ''}
                                    onChange={(e) => handleAdapterConfigChange(adapterType, 'password', e.target.value)}
                                    placeholder="Passwort"
                                  />
                                </div>
                              </div>
                            )}

                            {adapterType === 'npm' && (
                              <div className="space-y-2">
                                <Label htmlFor="npm-token">API Token</Label>
                                <Input
                                  id="npm-token"
                                  type="password"
                                  value={adapterConfig?.token || ''}
                                  onChange={(e) => handleAdapterConfigChange(adapterType, 'token', e.target.value)}
                                  placeholder="API Token"
                                />
                              </div>
                            )}

                            {/* Test Button */}
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Test specific adapter
                                  toast({
                                    title: 'Adapter-Test',
                                    description: `${adapterType} wird getestet...`,
                                  })
                                }}
                              >
                                <TestTube className="h-4 w-4 mr-2" />
                                Testen
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Authentifizierung</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authMode">Authentifizierungsmodus</Label>
                <Select value={formData.auth?.mode || 'none'} onValueChange={handleAuthModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Authentifizierungsmodus wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Authentifizierung</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="jwt">JWT Token</SelectItem>
                    <SelectItem value="header_forward">Header Forward (Authelia/NPM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.auth?.mode === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basic-username">Benutzername</Label>
                    <Input
                      id="basic-username"
                      value={formData.auth.basic?.username || ''}
                      onChange={(e) => handleInputChange('auth', {
                        ...formData.auth,
                        basic: { ...formData.auth?.basic, username: e.target.value }
                      })}
                      placeholder="Benutzername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basic-password">Passwort</Label>
                    <Input
                      id="basic-password"
                      type="password"
                      value={formData.auth.basic?.password || ''}
                      onChange={(e) => handleInputChange('auth', {
                        ...formData.auth,
                        basic: { ...formData.auth?.basic, password: e.target.value }
                      })}
                      placeholder="Passwort"
                    />
                  </div>
                </div>
              )}

              {formData.auth?.mode === 'jwt' && (
                <div className="space-y-2">
                  <Label htmlFor="jwt-token">JWT Token</Label>
                  <Input
                    id="jwt-token"
                    type="password"
                    value={formData.auth.jwt?.token || ''}
                    onChange={(e) => handleInputChange('auth', {
                      ...formData.auth,
                      jwt: { ...formData.auth?.jwt, token: e.target.value }
                    })}
                    placeholder="JWT Token"
                  />
                </div>
              )}

              {formData.auth?.mode === 'header_forward' && (
                <div className="space-y-2">
                  <Label htmlFor="header-name">Header Name</Label>
                  <Input
                    id="header-name"
                    value={formData.auth.header_forward?.headerName || 'X-Forwarded-User'}
                    onChange={(e) => handleInputChange('auth', {
                      ...formData.auth,
                      header_forward: { ...formData.auth?.header_forward, headerName: e.target.value }
                    })}
                    placeholder="X-Forwarded-User"
                  />
                  <p className="text-sm text-muted-foreground">
                    Header-Name für die Weiterleitung der Benutzerinformationen (kompatibel mit Authelia/NPM)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={formData.favorite}
                  onCheckedChange={(checked) => handleInputChange('favorite', checked)}
                />
                <Label htmlFor="favorite">Als Favorit markieren</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hidden"
                  checked={formData.hidden}
                  onCheckedChange={(checked) => handleInputChange('hidden', checked)}
                />
                <Label htmlFor="hidden">Service verstecken</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Reihenfolge</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          {onTest && (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Teste...' : 'Testen'}
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </div>
    </div>
  )
}
