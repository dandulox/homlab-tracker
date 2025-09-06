import { BaseAdapter, type AdapterConfig, type AdapterResponse } from './base'
import { ProxmoxNodeSchema, ProxmoxVMSchema, type ProxmoxNode, type ProxmoxVM } from '@/lib/schemas/widgets'

export interface ProxmoxConfig extends AdapterConfig {
  tokenId: string
  tokenSecret: string
}

export interface ProxmoxData {
  nodes: ProxmoxNode[]
  vms: ProxmoxVM[]
}

export class ProxmoxAdapter extends BaseAdapter<ProxmoxConfig, ProxmoxData> {
  constructor(config: ProxmoxConfig) {
    super(config)
  }

  validateConfig(): boolean {
    return !!(
      this.config.baseUrl &&
      this.config.tokenId &&
      this.config.tokenSecret
    )
  }

  async fetchData(): Promise<AdapterResponse<ProxmoxData>> {
    try {
      // Get nodes
      const nodesResponse = await this.makeRequest('/api2/json/cluster/resources', {
        headers: {
          'Authorization': `PVEAPIToken=${this.config.tokenId}=${this.config.tokenSecret}`
        }
      })

      if (!nodesResponse.ok) {
        throw new Error(`Proxmox API error: ${nodesResponse.status} ${nodesResponse.statusText}`)
      }

      const nodesData = await nodesResponse.json()
      
      // Parse nodes and VMs from cluster resources
      const nodes: ProxmoxNode[] = []
      const vms: ProxmoxVM[] = []
      
      if (nodesData.data) {
        for (const resource of nodesData.data) {
          if (resource.type === 'node') {
            // Get node stats
            const nodeStatsResponse = await this.makeRequest(`/api2/json/nodes/${resource.node}/status`, {
              headers: {
                'Authorization': `PVEAPIToken=${this.config.tokenId}=${this.config.tokenSecret}`
              }
            })
            
            if (nodeStatsResponse.ok) {
              const nodeStats = await nodeStatsResponse.json()
              const node: ProxmoxNode = {
                node: resource.node,
                status: nodeStats.data.status || 'unknown',
                cpu: Math.round((nodeStats.data.cpu || 0) * 100),
                memory: Math.round((nodeStats.data.memory?.used || 0) / (nodeStats.data.memory?.total || 1) * 100),
                storage: Math.round((nodeStats.data.rootfs?.used || 0) / (nodeStats.data.rootfs?.total || 1) * 100)
              }
              nodes.push(node)
            }
          } else if (resource.type === 'qemu' || resource.type === 'lxc') {
            // Get VM stats
            const vmStatsResponse = await this.makeRequest(`/api2/json/nodes/${resource.node}/${resource.type}/${resource.vmid}/status/current`, {
              headers: {
                'Authorization': `PVEAPIToken=${this.config.tokenId}=${this.config.tokenSecret}`
              }
            })
            
            if (vmStatsResponse.ok) {
              const vmStats = await vmStatsResponse.json()
              const vm: ProxmoxVM = {
                vmid: resource.vmid.toString(),
                name: resource.name || `VM ${resource.vmid}`,
                status: vmStats.data.status || 'unknown',
                cpu: Math.round((vmStats.data.cpu || 0) * 100),
                memory: Math.round((vmStats.data.mem || 0) / (vmStats.data.maxmem || 1) * 100)
              }
              vms.push(vm)
            }
          }
        }
      }

      const data: ProxmoxData = { nodes, vms }
      
      // Validate data with Zod schemas
      const validatedNodes = nodes.map(node => ProxmoxNodeSchema.parse(node))
      const validatedVMs = vms.map(vm => ProxmoxVMSchema.parse(vm))
      
      const validatedData: ProxmoxData = {
        nodes: validatedNodes,
        vms: validatedVMs
      }

      this.setCache(validatedData)
      
      return {
        success: true,
        data: validatedData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
