import { z } from 'zod'

// Auth Mode Enum
export const AuthMode = z.enum(['none', 'header_forward', 'basic', 'jwt'])

// Service Adapters Schema - alle verfügbaren Adapter
export const ServiceAdapters = z.object({
  // Homer-Style Checks
  ping: z.object({
    enabled: z.boolean(),
    host: z.string().optional(),
    intervalSec: z.number().default(30)
  }).partial().optional(),
  
  http: z.object({
    enabled: z.boolean(),
    url: z.string().url(),
    expectStatus: z.number().default(200),
    intervalSec: z.number().default(30)
  }).partial().optional(),

  // API-Adapter
  pihole: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    token: z.string().optional(),
    version: z.enum(['v5', 'v6']).default('v5')
  }).partial().optional(),

  adguard: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),

  portainer: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),

  prometheus: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    query: z.string().default('up')
  }).partial().optional(),

  openweathermap: z.object({
    enabled: z.boolean(),
    apiKey: z.string(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    units: z.enum(['metric', 'imperial']).default('metric')
  }).partial().optional(),

  grafana: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  proxmox: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    tokenId: z.string().optional(),
    tokenSecret: z.string().optional()
  }).partial().optional(),

  pfsense: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional()
  }).partial().optional(),

  npm: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    token: z.string().optional()
  }).partial().optional(),

  jellyfin: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  sonarr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  radarr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  lidarr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  readarr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  qbittorrent: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),

  transmission: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),

  sabnzbd: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  overseerr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  jellyseerr: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  nextcloud: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional()
  }).partial().optional(),

  paperless: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    token: z.string().optional()
  }).partial().optional(),

  immich: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  photoprism: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),

  syncthing: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  netdata: z.object({
    enabled: z.boolean(),
    baseUrl: z.string()
  }).partial().optional(),

  uptimekuma: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    apiKey: z.string().optional()
  }).partial().optional(),

  grafanaLoki: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    query: z.string().default('{job="app"}')
  }).partial().optional(),

  homeassistant: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    token: z.string().optional()
  }).partial().optional(),

  unifi: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).partial().optional(),
})

// Service Template Schema
export const ServiceTemplate = z.object({
  preset: z.enum(['foundation', 'enhanced']).default('foundation'),
  fields: z.record(z.string()).default({})
})

// Service Checks Schema
export const ServiceChecks = z.object({
  ping: ServiceAdapters.shape.ping.optional(),
  http: ServiceAdapters.shape.http.optional(),
  adapters: ServiceAdapters.partial().optional()
})

// Service Auth Schema
export const ServiceAuth = z.object({
  mode: AuthMode,
  basic: z.object({
    username: z.string(),
    password: z.string()
  }).partial().optional(),
  jwt: z.object({
    token: z.string()
  }).partial().optional(),
  header_forward: z.object({
    headerName: z.string().default('X-Forwarded-User')
  }).partial().optional()
}).partial().optional()

// Main Service Schema
export const Service = z.object({
  id: z.string(),
  type: z.string(), // 'generic' oder bekannter Typ
  instanceId: z.string(),
  name: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
  group: z.string().optional(),
  tags: z.array(z.string()).default([]),
  vlan: z.number().optional(),
  template: ServiceTemplate.optional(),
  checks: ServiceChecks.optional(),
  auth: ServiceAuth.optional(),
  description: z.string().optional(),
  favorite: z.boolean().default(false),
  hidden: z.boolean().default(false),
  order: z.number().default(0),
})

// Group Schema
export const Group = z.object({
  name: z.string().min(1),
  icon: z.string().default('Folder'),
  order: z.number().default(0),
})

// Discovery Schema
export const Discovery = z.object({
  enabled: z.boolean().default(false),
  cidr: z.array(z.string()).default([]),
  http_ports: z.array(z.number()).default([80, 443, 3000, 8080, 9000]),
  ping_timeout_ms: z.number().default(600)
})

// Auth Schema
export const Auth = z.object({
  enabled: z.boolean().default(false),
  jwt_secret: z.string().optional(),
})

// Main Config Schema
export const Config = z.object({
  title: z.string().default('Homelab Dashboard'),
  description: z.string().default('Übersicht Dienste & Status'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  auth: Auth,
  groups: z.array(Group).default([]),
  services: z.array(Service).default([]),
  discovery: Discovery,
})

// Type exports
export type AuthMode = z.infer<typeof AuthMode>
export type ServiceAdapters = z.infer<typeof ServiceAdapters>
export type ServiceTemplate = z.infer<typeof ServiceTemplate>
export type ServiceChecks = z.infer<typeof ServiceChecks>
export type ServiceAuth = z.infer<typeof ServiceAuth>
export type Service = z.infer<typeof Service>
export type Group = z.infer<typeof Group>
export type Discovery = z.infer<typeof Discovery>
export type Auth = z.infer<typeof Auth>
export type Config = z.infer<typeof Config>