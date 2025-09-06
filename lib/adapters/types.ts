// Basis-Interface für alle Adapter
export interface BaseAdapter {
  readonly name: string;
  readonly version: string;
  isEnabled(): boolean;
  validate(): Promise<boolean>;
}

// Health-Check Interface
export interface HealthCheckAdapter extends BaseAdapter {
  checkHealth(): Promise<HealthStatus>;
}

// Daten-Adapter Interface
export interface DataAdapter extends BaseAdapter {
  fetchData(): Promise<AdapterData>;
}

// Kombinierter Adapter (Health + Data)
export interface FullAdapter extends HealthCheckAdapter, DataAdapter {}

// Health-Status
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  message?: string;
  lastCheck: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

// Adapter-Daten
export interface AdapterData {
  data: Record<string, any>;
  lastUpdate: Date;
  source: string;
}

// Adapter-Konfiguration
export interface AdapterConfig {
  enabled: boolean;
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

// HTTP-Request-Optionen
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Authentifizierung
export interface AuthCredentials {
  type: 'none' | 'basic' | 'jwt' | 'api_key' | 'header_forward';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  headerName?: string;
  headerValue?: string;
}

// Adapter-Factory
export interface AdapterFactory {
  createAdapter(config: any, auth?: AuthCredentials): BaseAdapter;
  getSupportedTypes(): string[];
}
