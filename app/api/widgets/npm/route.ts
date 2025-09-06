import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if NPM credentials are configured
    const baseUrl = process.env.NPM_BASE_URL
    const token = process.env.NPM_TOKEN

    if (!baseUrl || !token) {
      return NextResponse.json(
        { error: 'NPM credentials not configured' },
        { status: 400 }
      )
    }

    // Mock data for development - replace with actual NPM API calls
    const mockData = {
      total_hosts: 12,
      ssl_certificates: 8,
      expiring_soon: 2,
      expiringCerts: [
        {
          domain: 'example.com',
          expiresIn: 5,
        },
        {
          domain: 'test.local',
          expiresIn: 12,
        },
        {
          domain: 'secure.example.com',
          expiresIn: 45,
        },
        {
          domain: 'api.example.com',
          expiresIn: 67,
        },
        {
          domain: 'admin.example.com',
          expiresIn: 89,
        },
      ],
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching NPM data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NPM data' },
      { status: 500 }
    )
  }
}
