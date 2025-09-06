import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/service-registry';
import { ServiceType } from '@/lib/schemas/service';

// GET: Einzelnen Service abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;
    const { searchParams } = new URL(request.url);
    const includeHealth = searchParams.get('includeHealth') === 'true';

    const serviceInstance = serviceRegistry.getService(type as ServiceType, instanceId);
    
    if (!serviceInstance) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Health-Check durchführen wenn gewünscht
    if (includeHealth) {
      await serviceRegistry.checkServiceHealth(serviceInstance);
    }

    return NextResponse.json({
      ...serviceInstance.service,
      healthStatus: serviceInstance.healthStatus,
      lastHealthCheck: serviceInstance.lastHealthCheck,
      adapters: serviceInstance.adapters.map(adapter => ({
        name: adapter.name,
        version: adapter.version,
        enabled: adapter.isEnabled()
      }))
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT: Service aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;
    const updateData = await request.json();

    const existingService = serviceRegistry.getService(type as ServiceType, instanceId);
    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Service entfernen und neu hinzufügen mit aktualisierten Daten
    serviceRegistry.removeService(type as ServiceType, instanceId);
    
    const updatedService = {
      ...existingService.service,
      ...updateData,
      id: existingService.service.id, // ID beibehalten
      type: type as ServiceType,
      instanceId
    };

    const validation = serviceRegistry.validateService(updatedService);
    if (!validation.valid) {
      // Service wiederherstellen bei Validierungsfehler
      await serviceRegistry.addService(existingService.service);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const serviceInstance = await serviceRegistry.addService(updatedService);

    return NextResponse.json({
      success: true,
      service: {
        ...serviceInstance.service,
        healthStatus: serviceInstance.healthStatus,
        adapterCount: serviceInstance.adapters.length
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE: Service entfernen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;

    const success = serviceRegistry.removeService(type as ServiceType, instanceId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
