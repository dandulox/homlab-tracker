'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ServiceCard } from '@/components/service-card'
import { WidgetContainer } from '@/components/widgets/widget-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Server, 
  Globe, 
  Shield, 
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Config, type Service, type HealthStatus } from '@/lib/schemas'

// Mock data for development
const mockConfig: Config = {
  title: 'Labora',
  description: 'Homelab Dashboard - Übersicht Dienste & Status',
  theme: 'system',
  auth: { enabled: false },
  groups: [
    { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Core', icon: 'Server', order: 0 },
    { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Netzwerk', icon: 'Globe', order: 1 },
    { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Apps', icon: 'Boxes', order: 2 },
  ],
  services: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Proxmox',
      url: 'https://proxmox.lan:8006',
      icon: 'Cpu',
      group: 'Core',
      tags: ['vm', 'infra'],
      vlan: 10,
      health: { type: 'http', url: 'https://proxmox.lan:8006/api2/json/version', interval: 30 },
      order: 0,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'pfSense',
      url: 'https://pfsense.lan',
      icon: 'Shield',
      group: 'Netzwerk',
      tags: ['router', 'firewall'],
      vlan: 10,
      health: { type: 'ping', host: 'pfsense.lan', interval: 30 },
      order: 1,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'AdGuard',
      url: 'http://10.0.20.103',
      icon: 'Filter',
      group: 'Netzwerk',
      tags: ['dns', 'adblock'],
      vlan: 20,
      order: 2,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'NPM',
      url: 'http://10.0.20.102',
      icon: 'Globe',
      group: 'Netzwerk',
      tags: ['reverse-proxy', 'ssl'],
      vlan: 20,
      order: 3,
    },
  ],
  discovery: {
    enabled: true,
    cidr: ['10.0.10.0/24', '10.0.20.0/24', '10.0.30.0/24', '10.0.40.0/24', '10.0.99.0/24'],
    http_ports: [80, 443, 3000, 8080, 9000],
    ping_timeout_ms: 600,
  },
  widgets: {
    proxmox: { enabled: true },
    pfsense: { enabled: true },
    adguard: { enabled: true },
    npm: { enabled: true },
  },
}

const mockHealthStatus: Record<string, HealthStatus> = {
  'Proxmox': { status: 'up', lastCheck: new Date().toISOString(), responseTime: 45 },
  'pfSense': { status: 'up', lastCheck: new Date().toISOString(), responseTime: 12 },
  'AdGuard': { status: 'down', lastCheck: new Date().toISOString(), error: 'Connection timeout' },
  'NPM': { status: 'up', lastCheck: new Date().toISOString(), responseTime: 23 },
}

export default function Dashboard() {
  const router = useRouter()
  const [config, setConfig] = useState<Config>(mockConfig)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedVlans, setSelectedVlans] = useState<number[]>([])
  const [favorites, setFavorites] = useState<string[]>(['Proxmox'])
  const [recentServices, setRecentServices] = useState<string[]>(['pfSense', 'NPM'])
  const [healthStatuses, setHealthStatuses] = useState<Record<string, HealthStatus>>(mockHealthStatus)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Fuse for fuzzy search
  const fuse = new Fuse(config.services, {
    keys: ['name', 'description', 'tags', 'url'],
    threshold: 0.3,
    includeScore: true,
  })

  // Filter services based on search and filters
  const filteredServices = useCallback(() => {
    let services = config.services.filter(service => !service.hidden)

    // Search filter
    if (searchQuery) {
      const searchResults = fuse.search(searchQuery)
      services = searchResults.map(result => result.item)
    }

    // Group filter
    if (selectedGroup) {
      if (selectedGroup === 'favorites') {
        services = services.filter(service => favorites.includes(service.name))
      } else if (selectedGroup === 'recent') {
        services = services.filter(service => recentServices.includes(service.name))
      } else {
        services = services.filter(service => service.group === selectedGroup)
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      services = services.filter(service => 
        selectedTags.some(tag => service.tags.includes(tag))
      )
    }

    // VLAN filter
    if (selectedVlans.length > 0) {
      services = services.filter(service => 
        service.vlan && selectedVlans.includes(service.vlan)
      )
    }

    return services.sort((a, b) => a.order - b.order)
  }, [config.services, searchQuery, selectedGroup, selectedTags, selectedVlans, favorites, recentServices, fuse])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleGroupSelect = (group: string | null) => {
    setSelectedGroup(group)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleVlanToggle = (vlan: number) => {
    setSelectedVlans(prev => 
      prev.includes(vlan) 
        ? prev.filter(v => v !== vlan)
        : [...prev, vlan]
    )
  }

  const handleClearFilters = () => {
    setSelectedGroup(null)
    setSelectedTags([])
    setSelectedVlans([])
    setSearchQuery('')
  }

  const handleToggleFavorite = (serviceName: string) => {
    setFavorites(prev => 
      prev.includes(serviceName)
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    )
  }

  const handleToggleHidden = (serviceName: string) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.name === serviceName
          ? { ...service, hidden: !service.hidden }
          : service
      )
    }))
  }

  const handleServiceClick = (service: Service) => {
    // Add to recent services
    setRecentServices(prev => {
      const filtered = prev.filter(name => name !== service.name)
      return [service.name, ...filtered].slice(0, 5)
    })
    
    // Open in new tab
    window.open(service.url, '_blank', 'noopener,noreferrer')
  }

  const handleAdminClick = () => {
    router.push('/admin')
  }

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setConfigLoaded(true)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      setConfigLoaded(true) // Use mock config as fallback
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await loadConfig()
    
    // Update health statuses
    try {
      const response = await fetch('/api/services/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          services: config.services.map(s => s.name) 
        }),
      })
      
      if (response.ok) {
        const healthData = await response.json()
        setHealthStatuses(healthData)
      }
    } catch (error) {
      console.error('Failed to update health statuses:', error)
    }
    
    setIsLoading(false)
  }

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="durchsuchen"]') as HTMLInputElement
        searchInput?.focus()
      }
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        // Theme toggle would be handled by theme provider
      }
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAdminClick()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const services = filteredServices()
  const onlineServices = services.filter(service => 
    healthStatuses[service.name]?.status === 'up'
  ).length
  const totalServices = services.length

  if (!configLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onAdminClick={handleAdminClick}
        isAuthenticated={false}
      />
      
      <div className="flex">
        <Sidebar
          groups={config.groups}
          services={config.services}
          selectedGroup={selectedGroup}
          selectedTags={selectedTags}
          selectedVlans={selectedVlans}
          onGroupSelect={handleGroupSelect}
          onTagToggle={handleTagToggle}
          onVlanToggle={handleVlanToggle}
          onClearFilters={handleClearFilters}
          favorites={favorites}
          recentServices={recentServices}
        />
        
        <main className="flex-1 p-6">
          {/* Stats Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{config.title}</h1>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Aktualisieren
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalServices}</div>
                  <p className="text-xs text-muted-foreground">
                    {onlineServices} online
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalServices > 0 ? Math.round((onlineServices / totalServices) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verfügbarkeit
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gruppen</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{config.groups.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Organisiert
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favoriten</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Markiert
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Widgets */}
          {config.widgets && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Status Widgets</h2>
              <WidgetContainer widgets={config.widgets} />
            </div>
          )}

          {/* Services Grid */}
          <div className="space-y-6">
            {selectedGroup && (
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">
                  {selectedGroup === 'favorites' ? 'Favoriten' : 
                   selectedGroup === 'recent' ? 'Zuletzt genutzt' : 
                   selectedGroup}
                </h2>
                <Badge variant="secondary">{services.length}</Badge>
              </div>
            )}
            
            {services.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Services gefunden</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Versuchen Sie, Ihre Suchkriterien zu ändern oder Filter zurückzusetzen.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Filter zurücksetzen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.name}
                    service={service}
                    healthStatus={healthStatuses[service.name]}
                    isFavorite={favorites.includes(service.name)}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleHidden={handleToggleHidden}
                    onServiceClick={handleServiceClick}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
