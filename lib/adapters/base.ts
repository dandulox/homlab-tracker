import { BaseAdapter, HealthStatus, AdapterData, HttpRequestOptions, AuthCredentials } from './types';

// Basis-Adapter-Implementierung
export abstract class BaseAdapterImpl implements BaseAdapter {
  protected config: any;
  protected auth?: AuthCredentials;
  protected lastCheck?: Date;
  protected lastStatus?: HealthStatus;

  constructor(config: any, auth?: AuthCredentials) {
    this.config = config;
    this.auth = auth;
  }

  abstract get name(): string;
  abstract get version(): string;

  isEnabled(): boolean {
    return this.config?.enabled === true;
  }

  async validate(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      // Basis-Validierung: URL erreichbar?
      if (this.config.baseUrl) {
        const response = await this.makeRequest(this.config.baseUrl, {
          method: 'HEAD',
          timeout: 5000
        });
        return response.ok;
      }
      return true;
    } catch (error) {
      console.warn(`Adapter ${this.name} validation failed:`, error);
      return false;
    }
  }

  protected async makeRequest(url: string, options: HttpRequestOptions = {}): Promise<Response> {
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      signal: AbortSignal.timeout(options.timeout || 10000)
    };

    if (options.body) {
      requestOptions.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }

    let lastError: Error | null = null;
    const retries = options.retries || 0;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  protected getAuthHeaders(): Record<string, string> {
    if (!this.auth) return {};

    switch (this.auth.type) {
      case 'basic':
        if (this.auth.username && this.auth.password) {
          const credentials = btoa(`${this.auth.username}:${this.auth.password}`);
          return { Authorization: `Basic ${credentials}` };
        }
        break;
      
      case 'jwt':
        if (this.auth.token) {
          return { Authorization: `Bearer ${this.auth.token}` };
        }
        break;
      
      case 'api_key':
        if (this.auth.apiKey) {
          return { 'X-API-Key': this.auth.apiKey };
        }
        break;
      
      case 'header_forward':
        if (this.auth.headerName && this.auth.headerValue) {
          return { [this.auth.headerName]: this.auth.headerValue };
        }
        break;
    }

    return {};
  }

  protected createHealthStatus(
    status: 'healthy' | 'unhealthy' | 'unknown',
    message?: string,
    responseTime?: number,
    details?: Record<string, any>
  ): HealthStatus {
    return {
      status,
      message,
      lastCheck: new Date(),
      responseTime,
      details
    };
  }

  protected createAdapterData(data: Record<string, any>, source: string): AdapterData {
    return {
      data,
      lastUpdate: new Date(),
      source
    };
  }
}

// HTTP Health Check Adapter
export abstract class HttpHealthAdapter extends BaseAdapterImpl {
  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(this.config.baseUrl, {
        method: 'HEAD',
        timeout: 5000
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return this.createHealthStatus('healthy', 'Service is reachable', responseTime);
      } else {
        return this.createHealthStatus('unhealthy', `HTTP ${response.status}: ${response.statusText}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Connection failed: ${error}`, responseTime);
    }
  }
}

// Ping Adapter (ICMP Simulation via HTTP)
export class PingAdapter extends BaseAdapterImpl {
  get name(): string { return 'ping'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Ping disabled');
    }

    const host = this.config.host || this.config.baseUrl;
    const startTime = Date.now();

    try {
      // Simuliere ICMP-Ping durch HTTP-HEAD Request
      const response = await this.makeRequest(host, {
        method: 'HEAD',
        timeout: 3000
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return this.createHealthStatus('healthy', `Ping successful (${responseTime}ms)`, responseTime);
      } else {
        return this.createHealthStatus('unhealthy', `Ping failed: HTTP ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Ping failed: ${error}`, responseTime);
    }
  }
}
