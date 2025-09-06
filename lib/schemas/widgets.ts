import { z } from 'zod'

// Widget Data Schemas
export const ProxmoxNodeSchema = z.object({
  node: z.string(),
  status: z.string(),
  cpu: z.number(),
  memory: z.number(),
  storage: z.number(),
})

export const ProxmoxVMSchema = z.object({
  vmid: z.string(),
  name: z.string(),
  status: z.string(),
  cpu: z.number(),
  memory: z.number(),
})

export const PfSenseGatewaySchema = z.object({
  name: z.string(),
  status: z.string(),
  monitor: z.string(),
})

export const PfSenseInterfaceSchema = z.object({
  name: z.string(),
  status: z.string(),
  ip: z.string().optional(),
})

export const AdGuardStatsSchema = z.object({
  queries_today: z.number(),
  blocked_today: z.number(),
  blocked_percentage: z.number(),
  top_domains: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })),
})

export const NPMStatsSchema = z.object({
  total_hosts: z.number(),
  ssl_certificates: z.number(),
  expiring_soon: z.number(),
})

export const PiHoleStatsSchema = z.object({
  queries_today: z.number(),
  blocked_today: z.number(),
  blocked_percentage: z.number(),
  top_domains: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })),
})

export const PortainerStatsSchema = z.object({
  containers: z.number(),
  images: z.number(),
  volumes: z.number(),
  networks: z.number(),
})

export const PrometheusStatsSchema = z.object({
  targets_up: z.number(),
  targets_down: z.number(),
  alerts_firing: z.number(),
  alerts_pending: z.number(),
})

export const GrafanaStatsSchema = z.object({
  dashboards: z.number(),
  datasources: z.number(),
  users: z.number(),
  alerts: z.number(),
})

export const JellyfinStatsSchema = z.object({
  users: z.number(),
  movies: z.number(),
  shows: z.number(),
  episodes: z.number(),
})

export const SonarrStatsSchema = z.object({
  series: z.number(),
  episodes: z.number(),
  queue: z.number(),
  warnings: z.number(),
})

export const RadarrStatsSchema = z.object({
  movies: z.number(),
  queue: z.number(),
  warnings: z.number(),
  disk_space: z.number(),
})

export const QBittorrentStatsSchema = z.object({
  torrents: z.number(),
  downloading: z.number(),
  seeding: z.number(),
  paused: z.number(),
  download_speed: z.number(),
  upload_speed: z.number(),
})

export const NextcloudStatsSchema = z.object({
  users: z.number(),
  files: z.number(),
  storage_used: z.number(),
  storage_total: z.number(),
})

export const UptimeKumaStatsSchema = z.object({
  monitors: z.number(),
  up: z.number(),
  down: z.number(),
  maintenance: z.number(),
})

export const HomeAssistantStatsSchema = z.object({
  entities: z.number(),
  automations: z.number(),
  scripts: z.number(),
  scenes: z.number(),
})

// Health Check Schema
export const HealthCheckSchema = z.object({
  type: z.enum(['ping', 'http']),
  url: z.string().url().optional(),
  host: z.string().optional(),
  interval: z.number().min(10).max(3600).default(30),
})

// Health Status Schema
export const HealthStatusSchema = z.object({
  status: z.enum(['up', 'down', 'unknown']),
  lastCheck: z.string().datetime(),
  responseTime: z.number().optional(),
  error: z.string().optional(),
})

// Discovery Result Schema
export const DiscoveryResultSchema = z.object({
  host: z.string(),
  port: z.number(),
  service: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['up', 'down']),
  responseTime: z.number().optional(),
})

// Type exports
export type ProxmoxNode = z.infer<typeof ProxmoxNodeSchema>
export type ProxmoxVM = z.infer<typeof ProxmoxVMSchema>
export type PfSenseGateway = z.infer<typeof PfSenseGatewaySchema>
export type PfSenseInterface = z.infer<typeof PfSenseInterfaceSchema>
export type AdGuardStats = z.infer<typeof AdGuardStatsSchema>
export type NPMStats = z.infer<typeof NPMStatsSchema>
export type PiHoleStats = z.infer<typeof PiHoleStatsSchema>
export type PortainerStats = z.infer<typeof PortainerStatsSchema>
export type PrometheusStats = z.infer<typeof PrometheusStatsSchema>
export type GrafanaStats = z.infer<typeof GrafanaStatsSchema>
export type JellyfinStats = z.infer<typeof JellyfinStatsSchema>
export type SonarrStats = z.infer<typeof SonarrStatsSchema>
export type RadarrStats = z.infer<typeof RadarrStatsSchema>
export type QBittorrentStats = z.infer<typeof QBittorrentStatsSchema>
export type NextcloudStats = z.infer<typeof NextcloudStatsSchema>
export type UptimeKumaStats = z.infer<typeof UptimeKumaStatsSchema>
export type HomeAssistantStats = z.infer<typeof HomeAssistantStatsSchema>
export type HealthCheck = z.infer<typeof HealthCheckSchema>
export type HealthStatus = z.infer<typeof HealthStatusSchema>
export type DiscoveryResult = z.infer<typeof DiscoveryResultSchema>
