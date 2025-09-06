import { BaseAdapterImpl, HttpHealthAdapter } from './base';
import { HealthStatus, AdapterData, AuthCredentials } from './types';
import { PiholeAdapter, PortainerAdapter, PrometheusAdapter, OpenWeatherMapAdapter, LidarrAdapter, MedusaAdapter } from '../schemas/service';

// Pi-hole Adapter
export class PiholeAdapterImpl extends HttpHealthAdapter {
  get name(): string { return 'pihole'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Pi-hole adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const version = this.config.version || 'v5';
      const endpoint = version === 'v6' 
        ? `${this.config.baseUrl}/api/v1/status`
        : `${this.config.baseUrl}/admin/api.php?status`;

      const headers: Record<string, string> = {};
      if (this.config.token) {
        headers['X-Pi-hole-Authenticate'] = this.config.token;
      }

      const response = await this.makeRequest(endpoint, { headers });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const isEnabled = version === 'v6' ? data.status === 'enabled' : data.status === 'enabled';
        
        return this.createHealthStatus(
          isEnabled ? 'healthy' : 'unhealthy',
          `Pi-hole ${isEnabled ? 'active' : 'disabled'}`,
          responseTime,
          { version, data }
        );
      } else {
        return this.createHealthStatus('unhealthy', `Pi-hole API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Pi-hole connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('Pi-hole adapter disabled');
    }

    const version = this.config.version || 'v5';
    const endpoint = version === 'v6' 
      ? `${this.config.baseUrl}/api/v1/stats`
      : `${this.config.baseUrl}/admin/api.php?summary`;

    const headers: Record<string, string> = {};
    if (this.config.token) {
      headers['X-Pi-hole-Authenticate'] = this.config.token;
    }

    const response = await this.makeRequest(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Pi-hole API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'pihole');
  }
}

// Portainer Adapter
export class PortainerAdapterImpl extends HttpHealthAdapter {
  get name(): string { return 'portainer'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Portainer adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const endpoint = `${this.config.baseUrl}/api/status`;
      const response = await this.makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return this.createHealthStatus(
          'healthy',
          'Portainer is running',
          responseTime,
          { version: data.Version }
        );
      } else {
        return this.createHealthStatus('unhealthy', `Portainer API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Portainer connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('Portainer adapter disabled');
    }

    const endpoint = `${this.config.baseUrl}/api/endpoints`;
    const response = await this.makeRequest(endpoint);
    
    if (!response.ok) {
      throw new Error(`Portainer API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'portainer');
  }
}

// Prometheus Adapter
export class PrometheusAdapterImpl extends HttpHealthAdapter {
  get name(): string { return 'prometheus'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Prometheus adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const endpoint = `${this.config.baseUrl}/api/v1/query?query=${encodeURIComponent(this.config.query)}`;
      const response = await this.makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const hasData = data.data?.result && data.data.result.length > 0;
        
        return this.createHealthStatus(
          hasData ? 'healthy' : 'unhealthy',
          hasData ? 'Query returned data' : 'Query returned no data',
          responseTime,
          { query: this.config.query, resultCount: data.data?.result?.length || 0 }
        );
      } else {
        return this.createHealthStatus('unhealthy', `Prometheus API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Prometheus connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('Prometheus adapter disabled');
    }

    const endpoint = `${this.config.baseUrl}/api/v1/query?query=${encodeURIComponent(this.config.query)}`;
    const response = await this.makeRequest(endpoint);
    
    if (!response.ok) {
      throw new Error(`Prometheus API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'prometheus');
  }
}

// OpenWeatherMap Adapter
export class OpenWeatherMapAdapterImpl extends BaseAdapterImpl {
  get name(): string { return 'openweathermap'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'OpenWeatherMap adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const city = this.config.city || 'London';
      const units = this.config.units || 'metric';
      const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.config.apiKey}&units=${units}`;
      
      const response = await this.makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return this.createHealthStatus(
          'healthy',
          `Weather data for ${data.name}`,
          responseTime,
          { 
            city: data.name, 
            temperature: data.main?.temp,
            description: data.weather?.[0]?.description 
          }
        );
      } else {
        return this.createHealthStatus('unhealthy', `OpenWeatherMap API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `OpenWeatherMap connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('OpenWeatherMap adapter disabled');
    }

    const city = this.config.city || 'London';
    const units = this.config.units || 'metric';
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.config.apiKey}&units=${units}`;
    
    const response = await this.makeRequest(endpoint);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'openweathermap');
  }
}

// Lidarr Adapter
export class LidarrAdapterImpl extends HttpHealthAdapter {
  get name(): string { return 'lidarr'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Lidarr adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const endpoint = `${this.config.baseUrl}/api/v1/system/status`;
      const headers = { 'X-Api-Key': this.config.apiKey };
      
      const response = await this.makeRequest(endpoint, { headers });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return this.createHealthStatus(
          'healthy',
          `Lidarr is running (v${data.version})`,
          responseTime,
          { version: data.version, appName: data.appName }
        );
      } else {
        return this.createHealthStatus('unhealthy', `Lidarr API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Lidarr connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('Lidarr adapter disabled');
    }

    const endpoint = `${this.config.baseUrl}/api/v1/queue`;
    const headers = { 'X-Api-Key': this.config.apiKey };
    
    const response = await this.makeRequest(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Lidarr API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'lidarr');
  }
}

// Medusa Adapter
export class MedusaAdapterImpl extends HttpHealthAdapter {
  get name(): string { return 'medusa'; }
  get version(): string { return '1.0.0'; }

  async checkHealth(): Promise<HealthStatus> {
    if (!this.isEnabled()) {
      return this.createHealthStatus('unknown', 'Medusa adapter disabled');
    }

    const startTime = Date.now();
    
    try {
      const endpoint = `${this.config.baseUrl}/api/v1/system/status`;
      const headers = { 'X-Api-Key': this.config.apiKey };
      
      const response = await this.makeRequest(endpoint, { headers });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return this.createHealthStatus(
          'healthy',
          `Medusa is running (v${data.version})`,
          responseTime,
          { version: data.version, appName: data.appName }
        );
      } else {
        return this.createHealthStatus('unhealthy', `Medusa API error: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.createHealthStatus('unhealthy', `Medusa connection failed: ${error}`, responseTime);
    }
  }

  async fetchData(): Promise<AdapterData> {
    if (!this.isEnabled()) {
      throw new Error('Medusa adapter disabled');
    }

    const endpoint = `${this.config.baseUrl}/api/v1/queue`;
    const headers = { 'X-Api-Key': this.config.apiKey };
    
    const response = await this.makeRequest(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Medusa API error: ${response.status}`);
    }

    const data = await response.json();
    return this.createAdapterData(data, 'medusa');
  }
}
