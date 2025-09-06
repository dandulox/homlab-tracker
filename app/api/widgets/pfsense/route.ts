import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if pfSense credentials are configured
    const baseUrl = process.env.PFSENSE_BASE_URL
    const apiKey = process.env.PFSENSE_API_KEY
    const apiSecret = process.env.PFSENSE_API_SECRET

    if (!baseUrl || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'pfSense credentials not configured' },
        { status: 400 }
      )
    }

    // Mock data for development - replace with actual pfSense API calls
    const mockData = {
      gateways: [
        {
          name: 'WAN_DHCP',
          status: 'online',
          monitor: '8.8.8.8',
        },
        {
          name: 'WAN_STATIC',
          status: 'offline',
          monitor: '1.1.1.1',
        },
      ],
      interfaces: [
        {
          name: 'WAN',
          status: 'up',
          ip: '192.168.1.100',
        },
        {
          name: 'LAN',
          status: 'up',
          ip: '10.0.10.1',
        },
        {
          name: 'OPT1',
          status: 'up',
          ip: '10.0.20.1',
        },
        {
          name: 'OPT2',
          status: 'down',
          ip: undefined,
        },
      ],
      wanIp: '203.0.113.42',
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching pfSense data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pfSense data' },
      { status: 500 }
    )
  }
}
