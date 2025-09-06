import { z } from 'zod'

// Service Preset Schema
export const ServicePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  icon: z.string(),
  defaultUrl: z.string().optional(),
  defaultPort: z.number().optional(),
  defaultPath: z.string().optional(),
  fields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text', 'password', 'number', 'select', 'boolean']),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    defaultValue: z.string().optional(),
  })).default([]),
  adapters: z.array(z.string()).default([]), // Welche Adapter sind verfügbar
  tags: z.array(z.string()).default([]),
})

// Preset Categories
export const PresetCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
})

// Service Preset Katalog
export const SERVICE_PRESETS: z.infer<typeof ServicePresetSchema>[] = [
  // Infra/Management
  {
    id: 'proxmox',
    name: 'Proxmox VE',
    description: 'Virtualisierungsplattform für VMs und Container',
    category: 'infra',
    icon: 'Server',
    defaultUrl: 'https://proxmox.lan:8006',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'https://proxmox.lan:8006' },
      { key: 'tokenId', label: 'Token ID', type: 'text', required: true, placeholder: 'dashboard@pve!readonly' },
      { key: 'tokenSecret', label: 'Token Secret', type: 'password', required: true },
    ],
    adapters: ['proxmox'],
    tags: ['vm', 'infra', 'virtualization'],
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: 'Docker Container Management',
    category: 'infra',
    icon: 'Container',
    defaultUrl: 'http://portainer.lan:9000',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://portainer.lan:9000' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false },
    ],
    adapters: ['portainer'],
    tags: ['docker', 'container', 'management'],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Monitoring und Visualisierung',
    category: 'monitoring',
    icon: 'BarChart',
    defaultUrl: 'http://grafana.lan:3000',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://grafana.lan:3000' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['grafana'],
    tags: ['monitoring', 'visualization', 'metrics'],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: 'Metriken-Sammlung und -Speicherung',
    category: 'monitoring',
    icon: 'Activity',
    defaultUrl: 'http://prometheus.lan:9090',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://prometheus.lan:9090' },
      { key: 'query', label: 'Query', type: 'text', required: false, defaultValue: 'up' },
    ],
    adapters: ['prometheus'],
    tags: ['monitoring', 'metrics', 'time-series'],
  },

  // Netz/Security
  {
    id: 'pfsense',
    name: 'pfSense',
    description: 'Firewall und Router',
    category: 'network',
    icon: 'Shield',
    defaultUrl: 'https://pfsense.lan',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'https://pfsense.lan' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: false },
    ],
    adapters: ['pfsense'],
    tags: ['firewall', 'router', 'network'],
  },
  {
    id: 'adguard',
    name: 'AdGuard Home',
    description: 'DNS-basierte Werbeblockierung',
    category: 'network',
    icon: 'Filter',
    defaultUrl: 'http://adguard.lan',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://adguard.lan' },
      { key: 'username', label: 'Username', type: 'text', required: false, defaultValue: 'admin' },
      { key: 'password', label: 'Password', type: 'password', required: false },
    ],
    adapters: ['adguard'],
    tags: ['dns', 'adblock', 'privacy'],
  },
  {
    id: 'pihole',
    name: 'Pi-hole',
    description: 'DNS-basierte Werbeblockierung',
    category: 'network',
    icon: 'Circle',
    defaultUrl: 'http://pihole.lan/admin',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://pihole.lan/admin' },
      { key: 'token', label: 'API Token', type: 'password', required: false },
      { key: 'version', label: 'Version', type: 'select', required: false, options: ['v5', 'v6'], defaultValue: 'v5' },
    ],
    adapters: ['pihole'],
    tags: ['dns', 'adblock', 'privacy'],
  },
  {
    id: 'npm',
    name: 'Nginx Proxy Manager',
    description: 'Reverse Proxy mit SSL-Management',
    category: 'network',
    icon: 'Globe',
    defaultUrl: 'http://npm.lan:81',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://npm.lan:81' },
      { key: 'token', label: 'API Token', type: 'password', required: false },
    ],
    adapters: ['npm'],
    tags: ['reverse-proxy', 'ssl', 'nginx'],
  },

  // Medien/Download
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Media Server',
    category: 'media',
    icon: 'Play',
    defaultUrl: 'http://jellyfin.lan:8096',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://jellyfin.lan:8096' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['jellyfin'],
    tags: ['media', 'streaming', 'server'],
  },
  {
    id: 'sonarr',
    name: 'Sonarr',
    description: 'TV Show Management',
    category: 'media',
    icon: 'Tv',
    defaultUrl: 'http://sonarr.lan:8989',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://sonarr.lan:8989' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['sonarr'],
    tags: ['tv', 'automation', 'download'],
  },
  {
    id: 'radarr',
    name: 'Radarr',
    description: 'Movie Management',
    category: 'media',
    icon: 'Film',
    defaultUrl: 'http://radarr.lan:7878',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://radarr.lan:7878' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['radarr'],
    tags: ['movies', 'automation', 'download'],
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    description: 'BitTorrent Client',
    category: 'media',
    icon: 'Download',
    defaultUrl: 'http://qbittorrent.lan:8080',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://qbittorrent.lan:8080' },
      { key: 'username', label: 'Username', type: 'text', required: false, defaultValue: 'admin' },
      { key: 'password', label: 'Password', type: 'password', required: false },
    ],
    adapters: ['qbittorrent'],
    tags: ['torrent', 'download', 'p2p'],
  },

  // Files/Sync
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: 'Cloud Storage und Collaboration',
    category: 'files',
    icon: 'Cloud',
    defaultUrl: 'https://nextcloud.lan',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'https://nextcloud.lan' },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false },
      { key: 'token', label: 'App Token', type: 'password', required: false },
    ],
    adapters: ['nextcloud'],
    tags: ['cloud', 'storage', 'collaboration'],
  },
  {
    id: 'syncthing',
    name: 'Syncthing',
    description: 'File Synchronization',
    category: 'files',
    icon: 'RefreshCw',
    defaultUrl: 'http://syncthing.lan:8384',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://syncthing.lan:8384' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['syncthing'],
    tags: ['sync', 'files', 'p2p'],
  },

  // Monitoring
  {
    id: 'uptimekuma',
    name: 'Uptime Kuma',
    description: 'Uptime Monitoring',
    category: 'monitoring',
    icon: 'Activity',
    defaultUrl: 'http://uptime.lan:3001',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://uptime.lan:3001' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
    ],
    adapters: ['uptimekuma'],
    tags: ['monitoring', 'uptime', 'alerts'],
  },
  {
    id: 'netdata',
    name: 'Netdata',
    description: 'Real-time System Monitoring',
    category: 'monitoring',
    icon: 'Activity',
    defaultUrl: 'http://netdata.lan:19999',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://netdata.lan:19999' },
    ],
    adapters: ['netdata'],
    tags: ['monitoring', 'system', 'real-time'],
  },

  // Home/IoT
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    description: 'Smart Home Automation',
    category: 'iot',
    icon: 'Home',
    defaultUrl: 'http://homeassistant.lan:8123',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://homeassistant.lan:8123' },
      { key: 'token', label: 'Long-lived Access Token', type: 'password', required: false },
    ],
    adapters: ['homeassistant'],
    tags: ['iot', 'automation', 'smart-home'],
  },

  // Generic Service
  {
    id: 'generic',
    name: 'Generic Service',
    description: 'Allgemeiner Service ohne spezifischen Adapter',
    category: 'generic',
    icon: 'Box',
    fields: [],
    adapters: [],
    tags: ['generic'],
  },
]

// Preset Categories
export const PRESET_CATEGORIES: z.infer<typeof PresetCategorySchema>[] = [
  {
    id: 'infra',
    name: 'Infrastructure',
    icon: 'Server',
    description: 'Virtualisierung, Container, Management',
  },
  {
    id: 'network',
    name: 'Network & Security',
    icon: 'Shield',
    description: 'Firewall, DNS, Proxy, Security',
  },
  {
    id: 'media',
    name: 'Media & Download',
    icon: 'Play',
    description: 'Streaming, Download, Automation',
  },
  {
    id: 'files',
    name: 'Files & Sync',
    icon: 'Folder',
    description: 'Cloud Storage, Synchronization',
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: 'Activity',
    description: 'Uptime, Metrics, Logs',
  },
  {
    id: 'iot',
    name: 'Home & IoT',
    icon: 'Home',
    description: 'Smart Home, Automation',
  },
  {
    id: 'generic',
    name: 'Generic',
    icon: 'Box',
    description: 'Allgemeine Services',
  },
]

// Type exports
export type ServicePreset = z.infer<typeof ServicePresetSchema>
export type PresetCategory = z.infer<typeof PresetCategorySchema>
