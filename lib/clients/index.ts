// Export all adapter clients
export * from './base'
export * from './proxmox'
export * from './adguard'
export * from './pihole'
export * from './npm'

// Adapter factory function
import { BaseAdapter, type AdapterConfig } from './base'
import { ProxmoxAdapter, type ProxmoxConfig } from './proxmox'
import { AdGuardAdapter, type AdGuardConfig } from './adguard'
import { PiHoleAdapter, type PiHoleConfig } from './pihole'
import { NPMAdapter, type NPMConfig } from './npm'

export type AdapterType = 'proxmox' | 'adguard' | 'pihole' | 'npm'

export function createAdapter(
  type: AdapterType,
  config: AdapterConfig
): BaseAdapter<any, any> {
  switch (type) {
    case 'proxmox':
      return new ProxmoxAdapter(config as ProxmoxConfig)
    case 'adguard':
      return new AdGuardAdapter(config as AdGuardConfig)
    case 'pihole':
      return new PiHoleAdapter(config as PiHoleConfig)
    case 'npm':
      return new NPMAdapter(config as NPMConfig)
    default:
      throw new Error(`Unknown adapter type: ${type}`)
  }
}

// Adapter registry for easy access
export const ADAPTER_REGISTRY = {
  proxmox: ProxmoxAdapter,
  adguard: AdGuardAdapter,
  pihole: PiHoleAdapter,
  npm: NPMAdapter,
} as const
