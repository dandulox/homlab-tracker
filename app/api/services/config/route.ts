import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ServiceRegistry } from '@/lib/schemas/service';

// GET: Service-Config aus Datei laden
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configFile = searchParams.get('file') || 'services-example.json';
    
    // Sicherheitsprüfung: Nur erlaubte Dateien
    const allowedFiles = [
      'services-example.json',
      'services-grid-example.json',
      'services.json'
    ];
    
    if (!allowedFiles.includes(configFile)) {
      return NextResponse.json(
        { error: 'Config file not allowed' },
        { status: 400 }
      );
    }

    const configPath = join(process.cwd(), 'config', configFile);
    const configContent = await readFile(configPath, 'utf-8');
    const config: ServiceRegistry = JSON.parse(configContent);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading service config:', error);
    return NextResponse.json(
      { error: 'Failed to load service config' },
      { status: 500 }
    );
  }
}

// POST: Service-Config in Datei speichern
export async function POST(request: NextRequest) {
  try {
    const config: ServiceRegistry = await request.json();
    const { searchParams } = new URL(request.url);
    const configFile = searchParams.get('file') || 'services.json';
    
    // Sicherheitsprüfung: Nur erlaubte Dateien
    const allowedFiles = ['services.json'];
    
    if (!allowedFiles.includes(configFile)) {
      return NextResponse.json(
        { error: 'Config file not allowed' },
        { status: 400 }
      );
    }

    const configPath = join(process.cwd(), 'config', configFile);
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Service config saved successfully'
    });
  } catch (error) {
    console.error('Error saving service config:', error);
    return NextResponse.json(
      { error: 'Failed to save service config' },
      { status: 500 }
    );
  }
}
