import { z } from 'zod';

// Service-Typen
export const ServiceType = z.enum([
  'proxmox',
  'nginxpm', 
  'nextcloud',
  'qbittorrent',
  'radarr',
  'sonarr',
  'sabnzbd',
  'adguard',
  'pihole',
  'portainer',
  'prometheus',
  'openweathermap',
  'lidarr',
  'medusa',
  'paperless',
  'photoprism',
  'homebridge',
  'immich',
  'komga',
  'navidrome',
  'octoprint',
  'generic'
]);

// Auth-Modi
export const AuthMode = z.enum(['none', 'header_forward', 'basic', 'jwt']);

// Template-Presets
export const TemplatePreset = z.enum(['foundation', 'enhanced']);

// Pi-hole Versionen
export const PiholeVersion = z.enum(['v5', 'v6']);

// OpenWeatherMap Einheiten
export const WeatherUnits = z.enum(['metric', 'imperial']);

// Auth-Konfiguration
export const AuthConfig = z.object({
  mode: AuthMode,
  basic: z.object({
    username: z.string(),
    password: z.string()
  }).optional(),
  jwt: z.object({
    token: z.string()
  }).optional(),
  header_forward: z.object({
    headerName: z.string().optional()
  }).optional()
});

// Template-Konfiguration
export const TemplateConfig = z.object({
  preset: TemplatePreset.optional(),
  fields: z.record(z.string()).optional()
});

// Ping-Check
export const PingCheck = z.object({
  enabled: z.boolean(),
  host: z.string().optional(),
  intervalSec: z.number().min(1).max(3600).optional()
});

// HTTP-Check
export const HttpCheck = z.object({
  enabled: z.boolean(),
  url: z.string().url(),
  intervalSec: z.number().min(1).max(3600).optional(),
  expectStatus: z.number().min(100).max(599).optional()
});

// Pi-hole Adapter
export const PiholeAdapter = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  token: z.string().optional(),
  version: PiholeVersion.optional()
});

// Portainer Adapter
export const PortainerAdapter = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional()
});

// Prometheus Adapter
export const PrometheusAdapter = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  query: z.string()
});

// OpenWeatherMap Adapter
export const OpenWeatherMapAdapter = z.object({
  enabled: z.boolean(),
  apiKey: z.string(),
  city: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  units: WeatherUnits.optional()
});

// Lidarr Adapter
export const LidarrAdapter = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  apiKey: z.string()
});

// Medusa Adapter
export const MedusaAdapter = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  apiKey: z.string()
});

// Adapter-Konfiguration
export const AdapterConfig = z.object({
  pihole: PiholeAdapter.optional(),
  portainer: PortainerAdapter.optional(),
  prometheus: PrometheusAdapter.optional(),
  openweathermap: OpenWeatherMapAdapter.optional(),
  lidarr: LidarrAdapter.optional(),
  medusa: MedusaAdapter.optional()
});

// Checks-Konfiguration
export const ChecksConfig = z.object({
  ping: PingCheck.optional(),
  http: HttpCheck.optional(),
  adapters: AdapterConfig.optional()
});

// Haupt-Service-Schema
export const Service = z.object({
  id: z.string().uuid(),
  type: ServiceType,
  instanceId: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
  group: z.string().min(1),
  tags: z.array(z.string()).optional(),
  vlan: z.number().min(1).max(4094).optional(),
  template: TemplateConfig.optional(),
  checks: ChecksConfig.optional(),
  auth: AuthConfig.optional()
});

// Service-Registry Schema
export const ServiceRegistry = z.object({
  services: z.array(Service)
});

// Typen für TypeScript
export type ServiceType = z.infer<typeof ServiceType>;
export type AuthMode = z.infer<typeof AuthMode>;
export type TemplatePreset = z.infer<typeof TemplatePreset>;
export type PiholeVersion = z.infer<typeof PiholeVersion>;
export type WeatherUnits = z.infer<typeof WeatherUnits>;
export type AuthConfig = z.infer<typeof AuthConfig>;
export type TemplateConfig = z.infer<typeof TemplateConfig>;
export type PingCheck = z.infer<typeof PingCheck>;
export type HttpCheck = z.infer<typeof HttpCheck>;
export type PiholeAdapter = z.infer<typeof PiholeAdapter>;
export type PortainerAdapter = z.infer<typeof PortainerAdapter>;
export type PrometheusAdapter = z.infer<typeof PrometheusAdapter>;
export type OpenWeatherMapAdapter = z.infer<typeof OpenWeatherMapAdapter>;
export type LidarrAdapter = z.infer<typeof LidarrAdapter>;
export type MedusaAdapter = z.infer<typeof MedusaAdapter>;
export type AdapterConfig = z.infer<typeof AdapterConfig>;
export type ChecksConfig = z.infer<typeof ChecksConfig>;
export type Service = z.infer<typeof Service>;
export type ServiceRegistry = z.infer<typeof ServiceRegistry>;
