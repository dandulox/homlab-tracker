import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/service-registry';
import { ServiceType } from '@/lib/schemas/service';

// POST: Service duplizieren
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; instanceId: string } }
) {
  try {
    const { type, instanceId } = params;
    const { newInstanceId } = await request.json();

    if (!newInstanceId) {
      return NextResponse.json(
        { error: 'newInstanceId is required' },
        { status: 400 }
      );
    }

    // Prüfe ob Ziel-Service bereits existiert
    const existingService = serviceRegistry.getService(type as ServiceType, newInstanceId);
    if (existingService) {
      return NextResponse.json(
        { error: `Service with instanceId '${newInstanceId}' already exists` },
        { status: 409 }
      );
    }

    const duplicatedService = await serviceRegistry.duplicateService(
      type as ServiceType,
      instanceId,
      newInstanceId
    );

    if (!duplicatedService) {
      return NextResponse.json(
        { error: 'Source service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service: {
        ...duplicatedService.service,
        healthStatus: duplicatedService.healthStatus,
        adapterCount: duplicatedService.adapters.length
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating service:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate service' },
      { status: 500 }
    );
  }
}
