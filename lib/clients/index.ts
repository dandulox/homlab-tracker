// Export all adapter clients
export * from './base'
export * from './proxmox'
export * from './adguard'
export * from './pihole'
export * from './npm'
export * from './portainer'
export * from './jellyfin'
export * from './sonarr'
export * from './uptimekuma'

// Adapter factory function
import { BaseAdapter, type AdapterConfig } from './base'
import { ProxmoxAdapter, type ProxmoxConfig } from './proxmox'
import { AdGuardAdapter, type AdGuardConfig } from './adguard'
import { PiHoleAdapter, type PiHoleConfig } from './pihole'
import { NPMAdapter, type NPMConfig } from './npm'
import { PortainerAdapter, type PortainerConfig } from './portainer'
import { JellyfinAdapter, type JellyfinConfig } from './jellyfin'
import { SonarrAdapter, type SonarrConfig } from './sonarr'
import { UptimeKumaAdapter, type UptimeKumaConfig } from './uptimekuma'

export type AdapterType = 'proxmox' | 'adguard' | 'pihole' | 'npm' | 'portainer' | 'jellyfin' | 'sonarr' | 'uptimekuma'

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
    case 'portainer':
      return new PortainerAdapter(config as PortainerConfig)
    case 'jellyfin':
      return new JellyfinAdapter(config as JellyfinConfig)
    case 'sonarr':
      return new SonarrAdapter(config as SonarrConfig)
    case 'uptimekuma':
      return new UptimeKumaAdapter(config as UptimeKumaConfig)
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
  portainer: PortainerAdapter,
  jellyfin: JellyfinAdapter,
  sonarr: SonarrAdapter,
  uptimekuma: UptimeKumaAdapter,
} as const
