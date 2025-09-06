import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/service-registry';
import { ServiceType } from '@/lib/schemas/service';

// POST: Health-Check für Service durchführen
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;

    const serviceInstance = serviceRegistry.getService(type as ServiceType, instanceId);
    
    if (!serviceInstance) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Health-Check durchführen
    await serviceRegistry.checkServiceHealth(serviceInstance);

    // Detaillierte Adapter-Ergebnisse sammeln
    const adapterResults = [];
    for (const adapter of serviceInstance.adapters) {
      if ('checkHealth' in adapter) {
        try {
          const healthResult = await (adapter as any).checkHealth();
          adapterResults.push({
            name: adapter.name,
            version: adapter.version,
            enabled: adapter.isEnabled(),
            health: healthResult
          });
        } catch (error) {
          adapterResults.push({
            name: adapter.name,
            version: adapter.version,
            enabled: adapter.isEnabled(),
            health: {
              status: 'unhealthy',
              message: `Health check failed: ${error}`,
              lastCheck: new Date()
            }
          });
        }
      }
    }

    return NextResponse.json({
      serviceId: `${type}:${instanceId}`,
      serviceName: serviceInstance.service.name,
      overallStatus: serviceInstance.healthStatus,
      lastCheck: serviceInstance.lastHealthCheck,
      adapters: adapterResults,
      statistics: {
        totalAdapters: serviceInstance.adapters.length,
        enabledAdapters: serviceInstance.adapters.filter(a => a.isEnabled()).length,
        healthyAdapters: adapterResults.filter(a => a.health?.status === 'healthy').length,
        unhealthyAdapters: adapterResults.filter(a => a.health?.status === 'unhealthy').length
      }
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    return NextResponse.json(
      { error: 'Failed to perform health check' },
      { status: 500 }
    );
  }
}

// GET: Letzten Health-Status abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;

    const serviceInstance = serviceRegistry.getService(type as ServiceType, instanceId);
    
    if (!serviceInstance) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      serviceId: `${type}:${instanceId}`,
      serviceName: serviceInstance.service.name,
      status: serviceInstance.healthStatus,
      lastCheck: serviceInstance.lastHealthCheck,
      adapterCount: serviceInstance.adapters.length,
      enabledAdapterCount: serviceInstance.adapters.filter(a => a.isEnabled()).length
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health status' },
      { status: 500 }
    );
  }
}
