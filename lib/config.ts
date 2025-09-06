import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { configSchema, type Config } from './schemas'

const CONFIG_PATH = process.env.CONFIG_PATH || '/config/config.yml'
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'config', 'config.yml')

export class ConfigManager {
  private config: Config | null = null
  private lastModified: number = 0

  async loadConfig(): Promise<Config> {
    try {
      // Try custom config path first, then default
      const configPath = fs.existsSync(CONFIG_PATH) ? CONFIG_PATH : DEFAULT_CONFIG_PATH
      
      if (!fs.existsSync(configPath)) {
        console.warn(`Config file not found at ${configPath}, using defaults`)
        return this.getDefaultConfig()
      }

      const stats = fs.statSync(configPath)
      if (stats.mtime.getTime() === this.lastModified && this.config) {
        return this.config
      }

      const fileContent = fs.readFileSync(configPath, 'utf8')
      const rawConfig = yaml.load(fileContent) as any
      
      // Validate and parse config
      const validatedConfig = configSchema.parse(rawConfig)
      
      this.config = validatedConfig
      this.lastModified = stats.mtime.getTime()
      
      return validatedConfig
    } catch (error) {
      console.error('Error loading config:', error)
      return this.getDefaultConfig()
    }
  }

  async saveConfig(config: Config): Promise<void> {
    try {
      // Validate config before saving
      const validatedConfig = configSchema.parse(config)
      
      const configPath = fs.existsSync(CONFIG_PATH) ? CONFIG_PATH : DEFAULT_CONFIG_PATH
      const configDir = path.dirname(configPath)
      
      // Ensure directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
      }
      
      const yamlContent = yaml.dump(validatedConfig, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      })
      
      fs.writeFileSync(configPath, yamlContent, 'utf8')
      
      // Update cache
      this.config = validatedConfig
      this.lastModified = Date.now()
      
    } catch (error) {
      console.error('Error saving config:', error)
      throw new Error('Failed to save configuration')
    }
  }

  getDefaultConfig(): Config {
    return {
      title: 'Labora',
      description: 'Homelab Dashboard - Übersicht Dienste & Status',
      theme: 'system',
      auth: {
        enabled: false,
      },
      groups: [
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          name: 'Core',
          icon: 'Server',
          order: 0,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          name: 'Netzwerk',
          icon: 'Globe',
          order: 1,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440012',
          name: 'Apps',
          icon: 'Boxes',
          order: 2,
        },
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
          health: {
            type: 'http',
            url: 'https://proxmox.lan:8006/api2/json/version',
            interval: 30,
          },
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
          health: {
            type: 'ping',
            host: 'pfsense.lan',
            interval: 30,
          },
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
  }

  getConfig(): Config | null {
    return this.config
  }

  isConfigLoaded(): boolean {
    return this.config !== null
  }
}

// Singleton instance
export const configManager = new ConfigManager()
