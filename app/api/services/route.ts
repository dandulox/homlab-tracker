import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/service-registry';
import { ServiceRegistry, Service } from '@/lib/schemas/service';

// GET: Alle Services abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    const type = searchParams.get('type');
    const includeHealth = searchParams.get('includeHealth') === 'true';

    let services;
    
    if (group) {
      const groups = serviceRegistry.getServicesByGroup();
      const targetGroup = groups.find(g => g.name === group);
      services = targetGroup?.services || [];
    } else if (type) {
      services = serviceRegistry.getServicesByType(type as any);
    } else {
      services = serviceRegistry.getAllServices();
    }

    // Health-Checks durchführen wenn gewünscht
    if (includeHealth) {
      await serviceRegistry.performHealthChecks();
    }

    const response = {
      services: services.map(instance => ({
        ...instance.service,
        healthStatus: instance.healthStatus,
        lastHealthCheck: instance.lastHealthCheck,
        adapterCount: instance.adapters.length
      })),
      statistics: serviceRegistry.getStatistics()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST: Neuen Service hinzufügen
export async function POST(request: NextRequest) {
  try {
    const serviceData: Service = await request.json();
    
    // Validierung
    const validation = serviceRegistry.validateService(serviceData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const serviceInstance = await serviceRegistry.addService(serviceData);
    
    return NextResponse.json({
      success: true,
      service: {
        ...serviceInstance.service,
        healthStatus: serviceInstance.healthStatus,
        adapterCount: serviceInstance.adapters.length
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT: Service-Registry aus Config laden
export async function PUT(request: NextRequest) {
  try {
    const config: ServiceRegistry = await request.json();
    
    await serviceRegistry.loadFromConfig(config);
    
    return NextResponse.json({
      success: true,
      message: 'Service registry loaded successfully',
      statistics: serviceRegistry.getStatistics()
    });
  } catch (error) {
    console.error('Error loading service registry:', error);
    return NextResponse.json(
      { error: 'Failed to load service registry' },
      { status: 500 }
    );
  }
}
