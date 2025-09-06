'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ExternalLink,
  Server,
  Globe,
  Filter,
  Shield
} from 'lucide-react'
import { type Service, type Group } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface ServiceListProps {
  services: Service[]
  groups: Group[]
  onEdit: (service: Service) => void
  onDelete: (serviceId: string) => void
  onToggleHidden: (serviceId: string) => void
  onAddNew: () => void
}

const iconMap: Record<string, any> = {
  Server,
  Globe,
  Filter,
  Shield,
  Box: Server,
}

export function ServiceList({
  services,
  groups,
  onEdit,
  onDelete,
  onToggleHidden,
  onAddNew,
}: ServiceListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesGroup = selectedGroup === 'all' || service.group === selectedGroup
    
    return matchesSearch && matchesGroup
  })

  const getGroupName = (groupName: string) => {
    const group = groups.find(g => g.name === groupName)
    return group?.name || groupName
  }

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Server
    return <Icon className="h-4 w-4" />
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
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Service hinzufügen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Services durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Alle Gruppen</option>
          {groups.map((group) => (
            <option key={group.name} value={group.name}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id || service.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getIcon(service.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {service.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {service.description || service.url}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleHidden(service.id || service.name)}
                    className="h-8 w-8"
                    title={service.hidden ? "Einblenden" : "Ausblenden"}
                  >
                    {service.hidden ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(service.url, '_blank')}
                    className="h-8 w-8"
                    title="Öffnen"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* URL */}
                <div className="text-sm text-muted-foreground truncate">
                  {service.url}
                </div>

                {/* Group */}
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {getGroupName(service.group)}
                  </Badge>
                  {service.vlan && (
                    <Badge variant="outline" className="text-xs">
                      VLAN {service.vlan}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Health Check */}
                {service.health && (
                  <div className="text-xs text-muted-foreground">
                    Health Check: {service.health.type} ({service.health.interval}s)
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(service.id || service.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Services gefunden</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || selectedGroup !== 'all' 
                ? 'Versuchen Sie, Ihre Suchkriterien zu ändern.'
                : 'Fügen Sie Ihren ersten Service hinzu.'
              }
            </p>
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Service hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}