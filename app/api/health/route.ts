import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check for Docker
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'labora'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}