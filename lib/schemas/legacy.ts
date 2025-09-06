import { z } from 'zod'

// Legacy schemas for backward compatibility
// These will be gradually phased out in favor of the new service.ts schemas

// Health Check Schema (Legacy)
export const healthCheckSchema = z.object({
  type: z.enum(['ping', 'http']),
  url: z.string().url().optional(),
  host: z.string().optional(),
  interval: z.number().min(10).max(3600).default(30),
})

// Service Schema (Legacy)
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

// Group Schema (Legacy)
export const groupSchema = z.object({
  name: z.string().min(1),
  icon: z.string().default('Folder'),
  order: z.number().default(0),
})

// Discovery Schema (Legacy)
export const discoverySchema = z.object({
  enabled: z.boolean().default(true),
  cidr: z.array(z.string()).default([]),
  http_ports: z.array(z.number()).default([80, 443, 3000, 8080, 9000]),
  ping_timeout_ms: z.number().default(600),
})

// Widgets Schema (Legacy)
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

// Auth Schema (Legacy)
export const authSchema = z.object({
  enabled: z.boolean().default(false),
  jwt_secret: z.string().optional(),
})

// Main Config Schema (Legacy)
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

// API Response Schemas (Legacy)
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

// Widget Data Schemas (Legacy)
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

// Legacy Type exports
export type LegacyConfig = z.infer<typeof configSchema>
export type LegacyService = z.infer<typeof serviceSchema>
export type LegacyGroup = z.infer<typeof groupSchema>
export type LegacyHealthCheck = z.infer<typeof healthCheckSchema>
export type LegacyDiscovery = z.infer<typeof discoverySchema>
export type LegacyWidgets = z.infer<typeof widgetsSchema>
export type LegacyAuth = z.infer<typeof authSchema>
export type LegacyHealthStatus = z.infer<typeof healthStatusSchema>
export type LegacyDiscoveryResult = z.infer<typeof discoveryResultSchema>
export type LegacyProxmoxNode = z.infer<typeof proxmoxNodeSchema>
export type LegacyProxmoxVM = z.infer<typeof proxmoxVMSchema>
export type LegacyPfSenseGateway = z.infer<typeof pfsenseGatewaySchema>
export type LegacyPfSenseInterface = z.infer<typeof pfsenseInterfaceSchema>
export type LegacyAdGuardStats = z.infer<typeof adguardStatsSchema>
export type LegacyNPMStats = z.infer<typeof npmStatsSchema>
