import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config'
import { configSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const config = await configManager.loadConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error loading config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the config
    const validatedConfig = configSchema.parse(body)
    
    // Save the config
    await configManager.saveConfig(validatedConfig)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 400 }
    )
  }
}