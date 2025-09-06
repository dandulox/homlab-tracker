import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if AdGuard credentials are configured
    const baseUrl = process.env.ADGUARD_BASE_URL
    const username = process.env.ADGUARD_USERNAME
    const password = process.env.ADGUARD_PASSWORD

    if (!baseUrl || !username || !password) {
      return NextResponse.json(
        { error: 'AdGuard credentials not configured' },
        { status: 400 }
      )
    }

    // Mock data for development - replace with actual AdGuard API calls
    const mockData = {
      queries_today: 15420,
      blocked_today: 3240,
      blocked_percentage: 21.0,
      top_domains: [
        { domain: 'googleads.g.doubleclick.net', count: 450 },
        { domain: 'googlesyndication.com', count: 320 },
        { domain: 'facebook.com', count: 280 },
        { domain: 'amazon-adsystem.com', count: 190 },
        { domain: 'outbrain.com', count: 150 },
        { domain: 'adsystem.amazon.com', count: 120 },
        { domain: 'googletagmanager.com', count: 100 },
        { domain: 'google-analytics.com', count: 90 },
        { domain: 'doubleclick.net', count: 80 },
        { domain: 'adsystem.amazon.de', count: 70 },
      ],
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching AdGuard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AdGuard data' },
      { status: 500 }
    )
  }
}
