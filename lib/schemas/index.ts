// Re-export all schemas from a central location
export * from './service'
export * from './widgets'
export * from './presets'

// Legacy exports for backward compatibility
export { 
  configSchema as configSchema,
  serviceSchema as serviceSchema,
  groupSchema as groupSchema,
  healthCheckSchema as healthCheckSchema,
  discoverySchema as discoverySchema,
  widgetsSchema as widgetsSchema,
  authSchema as authSchema,
  healthStatusSchema as healthStatusSchema,
  discoveryResultSchema as discoveryResultSchema,
  proxmoxNodeSchema as proxmoxNodeSchema,
  proxmoxVMSchema as proxmoxVMSchema,
  pfsenseGatewaySchema as pfsenseGatewaySchema,
  pfsenseInterfaceSchema as pfsenseInterfaceSchema,
  adguardStatsSchema as adguardStatsSchema,
  npmStatsSchema as npmStatsSchema,
} from './legacy'

// Main config schema (updated)
export { Config as ConfigSchema } from './service'
