import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Proxmox credentials are configured
    const baseUrl = process.env.PROXMOX_BASE_URL
    const tokenId = process.env.PROXMOX_TOKEN_ID
    const tokenSecret = process.env.PROXMOX_TOKEN_SECRET

    if (!baseUrl || !tokenId || !tokenSecret) {
      return NextResponse.json(
        { error: 'Proxmox credentials not configured' },
        { status: 400 }
      )
    }

    // Mock data for development - replace with actual Proxmox API calls
    const mockData = {
      nodes: [
        {
          node: 'pve1',
          status: 'online',
          cpu: 45,
          memory: 67,
          storage: 23,
        },
        {
          node: 'pve2',
          status: 'online',
          cpu: 32,
          memory: 54,
          storage: 41,
        },
      ],
      vms: [
        {
          vmid: '100',
          name: 'docker-host',
          status: 'running',
          cpu: 25,
          memory: 40,
        },
        {
          vmid: '101',
          name: 'web-server',
          status: 'running',
          cpu: 15,
          memory: 30,
        },
        {
          vmid: '102',
          name: 'database',
          status: 'stopped',
          cpu: 0,
          memory: 0,
        },
      ],
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching Proxmox data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Proxmox data' },
      { status: 500 }
    )
  }
}