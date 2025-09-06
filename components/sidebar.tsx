'use client'

import { useState } from 'react'
import { 
  Filter, 
  Star, 
  Clock, 
  Server, 
  Globe, 
  Boxes,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Group, type Service } from '@/lib/schemas'

interface SidebarProps {
  groups: Group[]
  services: Service[]
  selectedGroup: string | null
  selectedTags: string[]
  selectedVlans: number[]
  onGroupSelect: (group: string | null) => void
  onTagToggle: (tag: string) => void
  onVlanToggle: (vlan: number) => void
  onClearFilters: () => void
  favorites: string[]
  recentServices: string[]
}

const groupIcons: Record<string, any> = {
  Server,
  Globe,
  Boxes,
  Folder: Boxes,
}

export function Sidebar({
  groups,
  services,
  selectedGroup,
  selectedTags,
  selectedVlans,
  onGroupSelect,
  onTagToggle,
  onVlanToggle,
  onClearFilters,
  favorites,
  recentServices,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    groups: true,
    tags: true,
    vlans: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Get all unique tags and vlans from services
  const allTags = Array.from(new Set(services.flatMap(s => s.tags))).sort()
  const allVlans = Array.from(new Set(services.map(s => s.vlan).filter(Boolean))).sort((a, b) => a! - b!)

  const hasActiveFilters = selectedGroup !== null || selectedTags.length > 0 || selectedVlans.length > 0

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 space-y-6 overflow-y-auto">
      {/* Quick Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Schnellfilter</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          )}
        </div>
        
        <div className="space-y-1">
          <Button
            variant={selectedGroup === null && !hasActiveFilters ? "default" : "ghost"}
            size="sm"
            onClick={() => onGroupSelect(null)}
            className="w-full justify-start"
          >
            <Filter className="h-4 w-4 mr-2" />
            Alle Services
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGroupSelect('favorites')}
            className="w-full justify-start"
          >
            <Star className="h-4 w-4 mr-2" />
            Favoriten
            {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {favorites.length}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGroupSelect('recent')}
            className="w-full justify-start"
          >
            <Clock className="h-4 w-4 mr-2" />
            Zuletzt genutzt
            {recentServices.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {recentServices.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleSection('groups')}
          className="w-full justify-between p-0 h-auto"
        >
          <h3 className="text-sm font-semibold text-muted-foreground">Gruppen</h3>
          {expandedSections.groups ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        {expandedSections.groups && (
          <div className="space-y-1 pl-2">
            {groups.map((group) => {
              const Icon = groupIcons[group.icon] || Boxes
              const serviceCount = services.filter(s => s.group === group.name).length
              
              return (
                <Button
                  key={group.name}
                  variant={selectedGroup === group.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onGroupSelect(group.name)}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {group.name}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {serviceCount}
                  </Badge>
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection('tags')}
            className="w-full justify-between p-0 h-auto"
          >
            <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
            {expandedSections.tags ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.tags && (
            <div className="space-y-1 pl-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                const serviceCount = services.filter(s => s.tags.includes(tag)).length
                
                return (
                  <Button
                    key={tag}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTagToggle(tag)}
                    className="w-full justify-start"
                  >
                    <span className="text-xs">#</span>
                    {tag}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {serviceCount}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VLANs */}
      {allVlans.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection('vlans')}
            className="w-full justify-between p-0 h-auto"
          >
            <h3 className="text-sm font-semibold text-muted-foreground">VLANs</h3>
            {expandedSections.vlans ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.vlans && (
            <div className="space-y-1 pl-2">
              {allVlans.map((vlan) => {
                const isSelected = selectedVlans.includes(vlan)
                const serviceCount = services.filter(s => s.vlan === vlan).length
                
                return (
                  <Button
                    key={vlan}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onVlanToggle(vlan)}
                    className="w-full justify-start"
                  >
                    <span className="text-xs">VLAN</span>
                    {vlan}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {serviceCount}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
