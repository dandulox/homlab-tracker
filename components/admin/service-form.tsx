'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  Save, 
  Server,
  Globe,
  Filter,
  Shield,
  Box,
  Cpu,
  Database,
  Monitor,
  Wifi,
  Lock,
  Settings
} from 'lucide-react'
import { type Service, type Group } from '@/lib/schemas'
import { v4 as uuidv4 } from 'uuid'

interface ServiceFormProps {
  service?: Service
  groups: Group[]
  onSave: (service: Service) => void
  onCancel: () => void
}

const iconOptions = [
  { value: 'Server', label: 'Server', icon: Server },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Filter', label: 'Filter', icon: Filter },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Box', label: 'Box', icon: Box },
  { value: 'Cpu', label: 'CPU', icon: Cpu },
  { value: 'Database', label: 'Database', icon: Database },
  { value: 'Monitor', label: 'Monitor', icon: Monitor },
  { value: 'Wifi', label: 'Wifi', icon: Wifi },
  { value: 'Lock', label: 'Lock', icon: Lock },
  { value: 'Settings', label: 'Settings', icon: Settings },
]

export function ServiceForm({ service, groups, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<Service>({
    id: service?.id || uuidv4(),
    name: service?.name || '',
    url: service?.url || '',
    icon: service?.icon || 'Box',
    group: service?.group || groups[0]?.name || '',
    tags: service?.tags || [],
    vlan: service?.vlan || undefined,
    description: service?.description || '',
    health: service?.health || undefined,
    favorite: service?.favorite || false,
    hidden: service?.hidden || false,
    order: service?.order || 0,
  })

  const [tagInput, setTagInput] = useState('')
  const [healthEnabled, setHealthEnabled] = useState(!!service?.health)

  const handleInputChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleTagsChange([...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleTagsChange(formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleHealthChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      health: {
        ...prev.health,
        [field]: value
      } as any
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const serviceToSave: Service = {
      ...formData,
      health: healthEnabled ? formData.health : undefined
    }
    
    onSave(serviceToSave)
  }

  const selectedIcon = iconOptions.find(icon => icon.value === formData.icon)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {service ? 'Service bearbeiten' : 'Neuer Service'}
          </h2>
          <p className="text-muted-foreground">
            {service ? 'Bearbeiten Sie die Service-Eigenschaften' : 'Erstellen Sie einen neuen Service'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Service Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Kurze Beschreibung des Services"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Gruppe</Label>
                <select
                  id="group"
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {groups.map((group) => (
                    <option key={group.name} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vlan">VLAN</Label>
                <Input
                  id="vlan"
                  type="number"
                  value={formData.vlan || ''}
                  onChange={(e) => handleInputChange('vlan', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="VLAN Nummer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Icon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {iconOptions.map((icon) => {
                const Icon = icon.icon
                return (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => handleInputChange('icon', icon.value)}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      formData.icon === icon.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs">{icon.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tag hinzufügen"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag}>
                Hinzufügen
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-1 bg-secondary px-2 py-1 rounded-md text-sm"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Check */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={healthEnabled}
                onCheckedChange={setHealthEnabled}
              />
              <Label>Health Check aktivieren</Label>
            </div>

            {healthEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-border">
                <div className="space-y-2">
                  <Label htmlFor="healthType">Typ</Label>
                  <select
                    id="healthType"
                    value={formData.health?.type || 'http'}
                    onChange={(e) => handleHealthChange('type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="http">HTTP</option>
                    <option value="ping">Ping</option>
                  </select>
                </div>

                {formData.health?.type === 'http' ? (
                  <div className="space-y-2">
                    <Label htmlFor="healthUrl">Health Check URL</Label>
                    <Input
                      id="healthUrl"
                      type="url"
                      value={formData.health?.url || ''}
                      onChange={(e) => handleHealthChange('url', e.target.value)}
                      placeholder="https://example.com/health"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="healthHost">Host</Label>
                    <Input
                      id="healthHost"
                      value={formData.health?.host || ''}
                      onChange={(e) => handleHealthChange('host', e.target.value)}
                      placeholder="example.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="healthInterval">Intervall (Sekunden)</Label>
                  <Input
                    id="healthInterval"
                    type="number"
                    min="10"
                    max="3600"
                    value={formData.health?.interval || 30}
                    onChange={(e) => handleHealthChange('interval', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Optionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.favorite}
                onCheckedChange={(checked) => handleInputChange('favorite', checked)}
              />
              <Label>Als Favorit markieren</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.hidden}
                onCheckedChange={(checked) => handleInputChange('hidden', checked)}
              />
              <Label>Verstecken</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button type="submit" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {service ? 'Änderungen speichern' : 'Service erstellen'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  )
}