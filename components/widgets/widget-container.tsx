'use client'

import { ProxmoxWidget } from './proxmox-widget'
import { PfSenseWidget } from './pfsense-widget'
import { AdGuardWidget } from './adguard-widget'
import { NPMWidget } from './npm-widget'
import { type Widgets } from '@/lib/schemas'

interface WidgetContainerProps {
  widgets: Widgets
}

export function WidgetContainer({ widgets }: WidgetContainerProps) {
  const enabledWidgets = [
    { key: 'proxmox', enabled: widgets.proxmox.enabled, component: ProxmoxWidget },
    { key: 'pfsense', enabled: widgets.pfsense.enabled, component: PfSenseWidget },
    { key: 'adguard', enabled: widgets.adguard.enabled, component: AdGuardWidget },
    { key: 'npm', enabled: widgets.npm.enabled, component: NPMWidget },
  ].filter(widget => widget.enabled)

  if (enabledWidgets.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {enabledWidgets.map(({ key, component: WidgetComponent }) => (
        <WidgetComponent key={key} enabled={true} />
      ))}
    </div>
  )
}