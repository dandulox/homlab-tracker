import { Service, ServiceRegistry, ServiceType } from './schemas/service';
import { BaseAdapter } from './adapters/types';
import { adapterFactory } from './adapters/factory';
import { v4 as uuidv4 } from 'uuid';

export interface ServiceInstance {
  service: Service;
  adapters: BaseAdapter[];
  lastHealthCheck?: Date;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ServiceGroup {
  name: string;
  services: ServiceInstance[];
  order: number;
}

export class ServiceRegistryManager {
  private services: Map<string, ServiceInstance> = new Map();
  private groups: Map<string, ServiceGroup> = new Map();
  private config: ServiceRegistry | null = null;

  constructor() {
    this.initializeGroups();
  }

  private initializeGroups() {
    // Standard-Gruppen
    const defaultGroups = [
      'Netzwerk',
      'Medien', 
      'Infra',
      'Monitoring',
      'Info',
      'Development',
      'Security'
    ];

    defaultGroups.forEach((name, index) => {
      this.groups.set(name, {
        name,
        services: [],
        order: index
      });
    });
  }

  // Service-Registry aus Config laden
  async loadFromConfig(config: ServiceRegistry): Promise<void> {
    this.config = config;
    this.services.clear();
    
    // Gruppen zurücksetzen
    this.groups.forEach(group => group.services = []);

    for (const serviceConfig of config.services) {
      await this.addService(serviceConfig);
    }
  }

  // Service hinzufügen
  async addService(serviceConfig: Service): Promise<ServiceInstance> {
    const serviceId = this.generateServiceId(serviceConfig.type, serviceConfig.instanceId);
    
    // Adapter für den Service erstellen
    const adapters = adapterFactory.createAdaptersFromService(serviceConfig);
    
    const serviceInstance: ServiceInstance = {
      service: serviceConfig,
      adapters,
      healthStatus: 'unknown'
    };

    this.services.set(serviceId, serviceInstance);

    // Service zur entsprechenden Gruppe hinzufügen
    this.addToGroup(serviceInstance);

    return serviceInstance;
  }

  // Service entfernen
  removeService(type: ServiceType, instanceId: string): boolean {
    const serviceId = this.generateServiceId(type, instanceId);
    const serviceInstance = this.services.get(serviceId);
    
    if (!serviceInstance) {
      return false;
    }

    // Aus Gruppe entfernen
    this.removeFromGroup(serviceInstance);
    
    // Service entfernen
    this.services.delete(serviceId);
    
    return true;
  }

  // Service duplizieren
  async duplicateService(type: ServiceType, instanceId: string, newInstanceId: string): Promise<ServiceInstance | null> {
    const serviceId = this.generateServiceId(type, instanceId);
    const originalService = this.services.get(serviceId);
    
    if (!originalService) {
      return null;
    }

    const newService: Service = {
      ...originalService.service,
      id: uuidv4(),
      instanceId: newInstanceId,
      name: `${originalService.service.name} (Copy)`
    };

    return await this.addService(newService);
  }

  // Alle Services abrufen
  getAllServices(): ServiceInstance[] {
    return Array.from(this.services.values());
  }

  // Services nach Gruppe abrufen
  getServicesByGroup(): ServiceGroup[] {
    return Array.from(this.groups.values())
      .filter(group => group.services.length > 0)
      .sort((a, b) => a.order - b.order);
  }

  // Service nach ID abrufen
  getService(type: ServiceType, instanceId: string): ServiceInstance | null {
    const serviceId = this.generateServiceId(type, instanceId);
    return this.services.get(serviceId) || null;
  }

  // Services nach Typ abrufen
  getServicesByType(type: ServiceType): ServiceInstance[] {
    return Array.from(this.services.values())
      .filter(instance => instance.service.type === type);
  }

  // Health-Check für alle Services
  async performHealthChecks(): Promise<void> {
    const promises = Array.from(this.services.values()).map(async (serviceInstance) => {
      try {
        await this.checkServiceHealth(serviceInstance);
      } catch (error) {
        console.error(`Health check failed for ${serviceInstance.service.name}:`, error);
        serviceInstance.healthStatus = 'unhealthy';
      }
    });

    await Promise.allSettled(promises);
  }

  // Health-Check für einzelnen Service
  async checkServiceHealth(serviceInstance: ServiceInstance): Promise<void> {
    if (serviceInstance.adapters.length === 0) {
      serviceInstance.healthStatus = 'unknown';
      return;
    }

    const healthChecks = serviceInstance.adapters.map(async (adapter) => {
      if ('checkHealth' in adapter) {
        return await (adapter as any).checkHealth();
      }
      return null;
    });

    const results = await Promise.allSettled(healthChecks);
    const healthResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    if (healthResults.length === 0) {
      serviceInstance.healthStatus = 'unknown';
    } else {
      const hasUnhealthy = healthResults.some(result => result.status === 'unhealthy');
      serviceInstance.healthStatus = hasUnhealthy ? 'unhealthy' : 'healthy';
    }

    serviceInstance.lastHealthCheck = new Date();
  }

  // Service-Statistiken
  getStatistics(): {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
    byGroup: Record<string, number>;
    byType: Record<string, number>;
  } {
    const services = this.getAllServices();
    const stats = {
      total: services.length,
      healthy: 0,
      unhealthy: 0,
      unknown: 0,
      byGroup: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    services.forEach(service => {
      // Health-Status
      switch (service.healthStatus) {
        case 'healthy':
          stats.healthy++;
          break;
        case 'unhealthy':
          stats.unhealthy++;
          break;
        default:
          stats.unknown++;
      }

      // Nach Gruppe
      const group = service.service.group;
      stats.byGroup[group] = (stats.byGroup[group] || 0) + 1;

      // Nach Typ
      const type = service.service.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  // Service-ID generieren
  private generateServiceId(type: ServiceType, instanceId: string): string {
    return `${type}:${instanceId}`;
  }

  // Service zur Gruppe hinzufügen
  private addToGroup(serviceInstance: ServiceInstance): void {
    const groupName = serviceInstance.service.group;
    let group = this.groups.get(groupName);
    
    if (!group) {
      // Neue Gruppe erstellen
      group = {
        name: groupName,
        services: [],
        order: this.groups.size
      };
      this.groups.set(groupName, group);
    }

    group.services.push(serviceInstance);
  }

  // Service aus Gruppe entfernen
  private removeFromGroup(serviceInstance: ServiceInstance): void {
    const groupName = serviceInstance.service.group;
    const group = this.groups.get(groupName);
    
    if (group) {
      const index = group.services.findIndex(s => s.service.id === serviceInstance.service.id);
      if (index !== -1) {
        group.services.splice(index, 1);
      }
    }
  }

  // Config exportieren
  exportConfig(): ServiceRegistry {
    const services = this.getAllServices().map(instance => instance.service);
    return { services };
  }

  // Service-Validierung
  validateService(service: Partial<Service>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!service.type) {
      errors.push('Service type is required');
    }

    if (!service.instanceId) {
      errors.push('Instance ID is required');
    }

    if (!service.name) {
      errors.push('Service name is required');
    }

    if (!service.url) {
      errors.push('Service URL is required');
    } else {
      try {
        new URL(service.url);
      } catch {
        errors.push('Service URL is invalid');
      }
    }

    if (!service.group) {
      errors.push('Service group is required');
    }

    // Prüfe auf doppelte Service-IDs
    if (service.type && service.instanceId) {
      const serviceId = this.generateServiceId(service.type, service.instanceId);
      if (this.services.has(serviceId) && service.id !== this.services.get(serviceId)?.service.id) {
        errors.push(`Service with type '${service.type}' and instance '${service.instanceId}' already exists`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Singleton-Instanz
export const serviceRegistry = new ServiceRegistryManager();
