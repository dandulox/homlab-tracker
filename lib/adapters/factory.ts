import { BaseAdapter, AuthCredentials, AdapterFactory } from './types';
import { PiholeAdapterImpl } from './implementations';
import { PortainerAdapterImpl } from './implementations';
import { PrometheusAdapterImpl } from './implementations';
import { OpenWeatherMapAdapterImpl } from './implementations';
import { LidarrAdapterImpl } from './implementations';
import { MedusaAdapterImpl } from './implementations';
import { PingAdapter } from './base';
import { PiholeAdapter, PortainerAdapter, PrometheusAdapter, OpenWeatherMapAdapter, LidarrAdapter, MedusaAdapter } from '../schemas/service';

export class AdapterFactoryImpl implements AdapterFactory {
  private static instance: AdapterFactoryImpl;

  private constructor() {}

  static getInstance(): AdapterFactoryImpl {
    if (!AdapterFactoryImpl.instance) {
      AdapterFactoryImpl.instance = new AdapterFactoryImpl();
    }
    return AdapterFactoryImpl.instance;
  }

  createAdapter(type: string, config: any, auth?: AuthCredentials): BaseAdapter {
    switch (type.toLowerCase()) {
      case 'pihole':
        return new PiholeAdapterImpl(config, auth);
      
      case 'portainer':
        return new PortainerAdapterImpl(config, auth);
      
      case 'prometheus':
        return new PrometheusAdapterImpl(config, auth);
      
      case 'openweathermap':
        return new OpenWeatherMapAdapterImpl(config, auth);
      
      case 'lidarr':
        return new LidarrAdapterImpl(config, auth);
      
      case 'medusa':
        return new MedusaAdapterImpl(config, auth);
      
      case 'ping':
        return new PingAdapter(config, auth);
      
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }
  }

  getSupportedTypes(): string[] {
    return [
      'pihole',
      'portainer', 
      'prometheus',
      'openweathermap',
      'lidarr',
      'medusa',
      'ping'
    ];
  }

  // Hilfsmethode für Auth-Credentials aus Service-Config
  createAuthCredentials(authConfig: any): AuthCredentials | undefined {
    if (!authConfig || authConfig.mode === 'none') {
      return undefined;
    }

    switch (authConfig.mode) {
      case 'basic':
        return {
          type: 'basic',
          username: authConfig.basic?.username,
          password: authConfig.basic?.password
        };
      
      case 'jwt':
        return {
          type: 'jwt',
          token: authConfig.jwt?.token
        };
      
      case 'header_forward':
        return {
          type: 'header_forward',
          headerName: authConfig.header_forward?.headerName || 'X-Forwarded-User',
          headerValue: 'authenticated' // Wird von Reverse Proxy gesetzt
        };
      
      default:
        return undefined;
    }
  }

  // Erstelle Adapter aus Service-Checks
  createAdaptersFromService(service: any): BaseAdapter[] {
    const adapters: BaseAdapter[] = [];
    
    if (!service.checks) {
      return adapters;
    }

    const auth = this.createAuthCredentials(service.auth);

    // Ping-Adapter
    if (service.checks.ping?.enabled) {
      const pingConfig = {
        enabled: true,
        baseUrl: service.url,
        host: service.checks.ping.host || service.url,
        intervalSec: service.checks.ping.intervalSec || 30
      };
      adapters.push(this.createAdapter('ping', pingConfig, auth));
    }

    // HTTP-Adapter (als Ping-Adapter implementiert)
    if (service.checks.http?.enabled) {
      const httpConfig = {
        enabled: true,
        baseUrl: service.checks.http.url,
        intervalSec: service.checks.http.intervalSec || 30,
        expectStatus: service.checks.http.expectStatus || 200
      };
      adapters.push(this.createAdapter('ping', httpConfig, auth));
    }

    // Spezifische Adapter
    if (service.checks.adapters) {
      const adaptersConfig = service.checks.adapters;
      
      if (adaptersConfig.pihole?.enabled) {
        adapters.push(this.createAdapter('pihole', adaptersConfig.pihole, auth));
      }
      
      if (adaptersConfig.portainer?.enabled) {
        adapters.push(this.createAdapter('portainer', adaptersConfig.portainer, auth));
      }
      
      if (adaptersConfig.prometheus?.enabled) {
        adapters.push(this.createAdapter('prometheus', adaptersConfig.prometheus, auth));
      }
      
      if (adaptersConfig.openweathermap?.enabled) {
        adapters.push(this.createAdapter('openweathermap', adaptersConfig.openweathermap, auth));
      }
      
      if (adaptersConfig.lidarr?.enabled) {
        adapters.push(this.createAdapter('lidarr', adaptersConfig.lidarr, auth));
      }
      
      if (adaptersConfig.medusa?.enabled) {
        adapters.push(this.createAdapter('medusa', adaptersConfig.medusa, auth));
      }
    }

    return adapters;
  }
}

// Singleton-Instanz exportieren
export const adapterFactory = AdapterFactoryImpl.getInstance();
