import { z } from 'zod'

// Health Check Schema
export const healthCheckSchema = z.object({
  type: z.enum(['ping', 'http']),
  url: z.string().url().optional(),
  host: z.string().optional(),
  interval: z.number().min(10).max(3600).default(30),
})

// Service Schema
export const serviceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  icon: z.string().default('Box'),
  group: z.string().default('Unbekannt'),
  tags: z.array(z.string()).default([]),
  vlan: z.number().optional(),
  description: z.string().optional(),
  health: healthCheckSchema.optional(),
  favorite: z.boolean().default(false),
  hidden: z.boolean().default(false),
  order: z.number().default(0),
})

// Group Schema
export const groupSchema = z.object({
  name: z.string().min(1),
  icon: z.string().default('Folder'),
  order: z.number().default(0),
})

// Discovery Schema
export const discoverySchema = z.object({
  enabled: z.boolean().default(true),
  cidr: z.array(z.string()).default([]),
  http_ports: z.array(z.number()).default([80, 443, 3000, 8080, 9000]),
  ping_timeout_ms: z.number().default(600),
})

// Widgets Schema
export const widgetsSchema = z.object({
  proxmox: z.object({
    enabled: z.boolean().default(false),
  }),
  pfsense: z.object({
    enabled: z.boolean().default(false),
  }),
  adguard: z.object({
    enabled: z.boolean().default(false),
  }),
  npm: z.object({
    enabled: z.boolean().default(false),
  }),
})

// Auth Schema
export const authSchema = z.object({
  enabled: z.boolean().default(false),
  jwt_secret: z.string().optional(),
})

// Main Config Schema
export const configSchema = z.object({
  title: z.string().default('Homelab Dashboard'),
  description: z.string().default('Übersicht Dienste & Status'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  auth: authSchema,
  groups: z.array(groupSchema).default([]),
  services: z.array(serviceSchema).default([]),
  discovery: discoverySchema,
  widgets: widgetsSchema,
})

// API Response Schemas
export const healthStatusSchema = z.object({
  status: z.enum(['up', 'down', 'unknown']),
  lastCheck: z.string().datetime(),
  responseTime: z.number().optional(),
  error: z.string().optional(),
})

export const discoveryResultSchema = z.object({
  host: z.string(),
  port: z.number(),
  service: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['up', 'down']),
  responseTime: z.number().optional(),
})

// Widget Data Schemas
export const proxmoxNodeSchema = z.object({
  node: z.string(),
  status: z.string(),
  cpu: z.number(),
  memory: z.number(),
  storage: z.number(),
})

export const proxmoxVMSchema = z.object({
  vmid: z.string(),
  name: z.string(),
  status: z.string(),
  cpu: z.number(),
  memory: z.number(),
})

export const pfsenseGatewaySchema = z.object({
  name: z.string(),
  status: z.string(),
  monitor: z.string(),
})

export const pfsenseInterfaceSchema = z.object({
  name: z.string(),
  status: z.string(),
  ip: z.string().optional(),
})

export const adguardStatsSchema = z.object({
  queries_today: z.number(),
  blocked_today: z.number(),
  blocked_percentage: z.number(),
  top_domains: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })),
})

export const npmStatsSchema = z.object({
  total_hosts: z.number(),
  ssl_certificates: z.number(),
  expiring_soon: z.number(),
})

// Type exports
export type Config = z.infer<typeof configSchema>
export type Service = z.infer<typeof serviceSchema>
export type Group = z.infer<typeof groupSchema>
export type HealthCheck = z.infer<typeof healthCheckSchema>
export type Discovery = z.infer<typeof discoverySchema>
export type Widgets = z.infer<typeof widgetsSchema>
export type Auth = z.infer<typeof authSchema>
export type HealthStatus = z.infer<typeof healthStatusSchema>
export type DiscoveryResult = z.infer<typeof discoveryResultSchema>
export type ProxmoxNode = z.infer<typeof proxmoxNodeSchema>
export type ProxmoxVM = z.infer<typeof proxmoxVMSchema>
export type PfSenseGateway = z.infer<typeof pfsenseGatewaySchema>
export type PfSenseInterface = z.infer<typeof pfsenseInterfaceSchema>
export type AdGuardStats = z.infer<typeof adguardStatsSchema>
export type NPMStats = z.infer<typeof npmStatsSchema>
