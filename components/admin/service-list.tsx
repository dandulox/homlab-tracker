'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Filter,
  MoreHorizontal,
  Server,
  Globe,
  Shield,
  Activity
} from 'lucide-react'
import { type Service } from '@/lib/schemas/service'
import { getAllCategories } from '@/lib/presets'
import { useToast } from '@/components/ui/use-toast'

interface ServiceListProps {
  services: Service[]
  onAddService: () => void
  onEditService: (service: Service) => void
  onDuplicateService: (service: Service) => void
  onDeleteService: (service: Service) => void
  onTestService: (service: Service) => Promise<void>
}

export function ServiceList({ 
  services, 
  onAddService, 
  onEditService, 
  onDuplicateService, 
  onDeleteService,
  onTestService 
}: ServiceListProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [testingServices, setTestingServices] = useState<Set<string>>(new Set())

  const categories = getAllCategories()

  // Filter and search services
  const filteredServices = useMemo(() => {
    let filtered = services

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.url.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query)) ||
        service.type.toLowerCase().includes(query) ||
        service.instanceId.toLowerCase().includes(query)
      )
    }

    // Group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(service => service.group === selectedGroup)
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(service => service.type === selectedType)
    }

    return filtered.sort((a, b) => a.order - b.order)
  }, [services, searchQuery, selectedGroup, selectedType])

  // Get unique groups and types
  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(services.map(s => s.group).filter(Boolean))]
    return uniqueGroups.sort()
  }, [services])

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(services.map(s => s.type))]
    return uniqueTypes.sort()
  }, [services])

  const handleTestService = async (service: Service) => {
    setTestingServices(prev => new Set(prev).add(service.id))
    try {
      await onTestService(service)
    } finally {
      setTestingServices(prev => {
        const newSet = new Set(prev)
        newSet.delete(service.id)
        return newSet
      })
    }
  }

  const getServiceIcon = (type: string) => {
    const category = categories.find(c => c.id === type)
    if (category) {
      return category.icon
    }
    
    // Fallback icons for common types
    const iconMap: Record<string, string> = {
      proxmox: 'Server',
      pfsense: 'Shield',
      adguard: 'Filter',
      npm: 'Globe',
      portainer: 'Container',
      grafana: 'BarChart',
      prometheus: 'Activity',
      jellyfin: 'Play',
      sonarr: 'Tv',
      radarr: 'Film',
      qbittorrent: 'Download',
      nextcloud: 'Cloud',
      uptimekuma: 'Activity',
      homeassistant: 'Home',
    }
    
    return iconMap[type] || 'Box'
  }

  const getServiceStatus = (service: Service) => {
    const hasEnabledAdapters = service.checks?.adapters && 
      Object.values(service.checks.adapters).some(adapter => adapter?.enabled)
    
    if (hasEnabledAdapters) {
      return { status: 'active', label: 'API aktiv', color: 'green' }
    }
    
    if (service.checks?.ping?.enabled || service.checks?.http?.enabled) {
      return { status: 'monitored', label: 'Überwacht', color: 'blue' }
    }
    
    return { status: 'static', label: 'Statisch', color: 'gray' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-muted-foreground">
            {filteredServices.length} von {services.length} Services
          </p>
        </div>
        <Button onClick={onAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Service hinzufügen
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Services durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Alle Gruppen</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Alle Typen</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <div className="grid gap-4">
        {filteredServices.map(service => {
          const status = getServiceStatus(service)
          const isTesting = testingServices.has(service.id)
          const IconComponent = getServiceIcon(service.type)

          return (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">{IconComponent}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{service.name}</h3>
                        {service.favorite && (
                          <Badge variant="secondary" className="text-xs">⭐</Badge>
                        )}
                        {service.hidden && (
                          <Badge variant="outline" className="text-xs">Versteckt</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">URL:</span>
                          <span className="truncate">{service.url}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Typ:</span>
                            <Badge variant="outline" className="text-xs">{service.type}</Badge>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Instanz:</span>
                            <span>{service.instanceId}</span>
                          </div>
                          
                          {service.group && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Gruppe:</span>
                              <span>{service.group}</span>
                            </div>
                          )}
                          
                          {service.vlan && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">VLAN:</span>
                              <span>{service.vlan}</span>
                            </div>
                          )}
                        </div>
                        
                        {service.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {service.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={status.color === 'green' ? 'default' : status.color === 'blue' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {status.label}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestService(service)}
                        disabled={isTesting}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicateService(service)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteService(service)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Adapter Status */}
                {service.checks?.adapters && Object.keys(service.checks.adapters).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">API-Adapter:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(service.checks.adapters).map(([adapterType, adapterConfig]) => (
                        <Badge
                          key={adapterType}
                          variant={adapterConfig?.enabled ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {adapterType} {adapterConfig?.enabled ? '✓' : '○'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Keine Services gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedGroup !== 'all' || selectedType !== 'all'
                  ? 'Versuchen Sie, Ihre Suchkriterien zu ändern.'
                  : 'Fügen Sie Ihren ersten Service hinzu, um loszulegen.'
                }
              </p>
              {(!searchQuery && selectedGroup === 'all' && selectedType === 'all') && (
                <Button onClick={onAddService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Service hinzufügen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
