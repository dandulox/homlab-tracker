'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Star, 
  StarOff, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, getVlanColor, getStatusColor } from '@/lib/utils'
import { type Service, type HealthStatus } from '@/lib/schemas'

interface ServiceCardProps {
  service: Service
  healthStatus?: HealthStatus
  isFavorite: boolean
  onToggleFavorite: (serviceName: string) => void
  onToggleHidden: (serviceName: string) => void
  onServiceClick: (service: Service) => void
  searchQuery?: string
}

export function ServiceCard({
  service,
  healthStatus,
  isFavorite,
  onToggleFavorite,
  onToggleHidden,
  onServiceClick,
  searchQuery = '',
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getHealthIcon = () => {
    if (!healthStatus) return <Clock className="h-4 w-4 text-muted-foreground" />
    
    switch (healthStatus.status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getHealthText = () => {
    if (!healthStatus) return 'Unbekannt'
    
    switch (healthStatus.status) {
      case 'up':
        return healthStatus.responseTime ? `${healthStatus.responseTime}ms` : 'Online'
      case 'down':
        return 'Offline'
      default:
        return 'Prüfung...'
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }

  const handleCardClick = () => {
    onServiceClick(service)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(service.name)
  }

  const handleHiddenClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleHidden(service.name)
  }

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(service.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card 
      className={cn(
        "service-card cursor-pointer group relative",
        service.hidden && "opacity-50",
        isHovered && "ring-2 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleFavoriteClick}
          title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        >
          {isFavorite ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleHiddenClick}
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
          className="h-8 w-8"
          onClick={handleExternalClick}
          title="In neuem Tab öffnen"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {service.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {highlightText(service.name, searchQuery)}
              </h3>
              {service.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {highlightText(service.description, searchQuery)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Health Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getHealthIcon()}
              <span className="text-sm font-medium">
                {getHealthText()}
              </span>
            </div>
            <Badge 
              variant={healthStatus?.status === 'up' ? 'success' : healthStatus?.status === 'down' ? 'error' : 'secondary'}
              className="text-xs"
            >
              {healthStatus?.status === 'up' ? 'Online' : healthStatus?.status === 'down' ? 'Offline' : 'Unbekannt'}
            </Badge>
          </div>

          {/* URL */}
          <div className="text-sm text-muted-foreground truncate">
            {highlightText(service.url, searchQuery)}
          </div>

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {service.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs"
                >
                  #{highlightText(tag, searchQuery)}
                </Badge>
              ))}
            </div>
          )}

          {/* VLAN Badge */}
          {service.vlan && (
            <div className="flex justify-end">
              <Badge 
                variant="outline"
                className={cn("text-xs", getVlanColor(service.vlan))}
              >
                VLAN {service.vlan}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
