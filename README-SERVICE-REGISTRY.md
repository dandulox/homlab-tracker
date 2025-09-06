# Service Registry System

Ein umfassendes Service-Management-System für das Homelab-Dashboard mit Unterstützung für Grid- und Dynamic-Modi.

## 🚀 Features

### ✅ Implementiert
- **TypeScript-Schemas** mit Zod-Validierung
- **Adapter-System** für verschiedene Service-Typen
- **Service-Registry** mit Mehrfach-Instanzen
- **Admin-UI** für Service-Management
- **API-Endpunkte** für alle CRUD-Operationen
- **Health-Check-System** mit verschiedenen Adaptern
- **Authentifizierung** (none, basic, jwt, header_forward)
- **Beispiel-Konfigurationen** für beide Modi

### 🔧 Service-Typen
- **Infrastructure**: Proxmox, Portainer, Nginx Proxy Manager
- **Media**: qBittorrent, Radarr, Sonarr, Lidarr, Medusa
- **Network**: Pi-hole, AdGuard Home
- **Monitoring**: Prometheus
- **External**: OpenWeatherMap
- **Generic**: Für externe Links

### 🎯 Modi

#### Grid-Modus
- Reine Link-Sammlung ohne Live-Daten
- Template-System (foundation/enhanced)
- Custom Fields für Deep-Links
- Keine API-Calls

#### Dynamic-Modus
- Live-Monitoring mit Health-Checks
- Ping/HTTP-Checks
- Spezifische Adapter (Pi-hole, Portainer, etc.)
- Real-time Status-Updates

## 📁 Projektstruktur

```
lib/
├── schemas/
│   └── service.ts              # Zod-Schemas für Service-Definitionen
├── adapters/
│   ├── types.ts                # Adapter-Interfaces
│   ├── base.ts                 # Basis-Adapter-Implementierung
│   ├── implementations.ts      # Spezifische Adapter
│   └── factory.ts              # Adapter-Factory
└── service-registry.ts         # Service-Registry-Manager

app/api/services/
├── route.ts                    # Services CRUD
├── [type]/[instanceId]/
│   ├── route.ts                # Einzelner Service
│   ├── duplicate/route.ts      # Service duplizieren
│   └── health/route.ts         # Health-Checks
└── config/route.ts             # Config-Dateien

app/admin/services/
└── page.tsx                    # Admin-UI

config/
├── services-example.json       # Homer-Modus Beispiel
└── services-heimdall-example.json # Heimdall-Modus Beispiel

docs/
└── SERVICE-REGISTRY.md         # Vollständige Dokumentation
```

## 🛠️ Installation

1. **Dependencies installieren**:
```bash
npm install uuid @types/uuid
```

2. **Service-Config laden**:
```bash
# Beispiel-Config laden
curl -X PUT http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d @config/services-example.json
```

3. **Admin-UI öffnen**:
```
http://localhost:3000/admin/services
```

## 📖 Verwendung

### Service hinzufügen

```typescript
const newService: Service = {
  id: uuidv4(),
  type: 'pihole',
  instanceId: 'main',
  name: 'Pi-hole (Main)',
  url: 'http://10.0.1.100/admin',
  group: 'Netzwerk',
  tags: ['dns', 'adblock'],
  checks: {
    ping: { enabled: true, host: '10.0.1.100' },
    adapters: {
      pihole: {
        enabled: true,
        baseUrl: 'http://10.0.1.100/admin',
        token: 'env:PIHOLE_TOKEN'
      }
    }
  },
  auth: { mode: 'header_forward' }
}
```

### Health-Check durchführen

```typescript
const response = await fetch('/api/services/pihole/main/health', {
  method: 'POST'
})
const result = await response.json()
console.log(result.overallStatus) // 'healthy' | 'unhealthy' | 'unknown'
```

### Service duplizieren

```typescript
const response = await fetch('/api/services/pihole/main/duplicate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newInstanceId: 'backup' })
})
```

## 🔐 Authentifizierung

### Header Forward (NPM/Authelia)
```json
{
  "auth": {
    "mode": "header_forward",
    "header_forward": {
      "headerName": "X-Forwarded-User"
    }
  }
}
```

### Basic Auth
```json
{
  "auth": {
    "mode": "basic",
    "basic": {
      "username": "admin",
      "password": "env:QBIT_PASSWORD"
    }
  }
}
```

### JWT Token
```json
{
  "auth": {
    "mode": "jwt",
    "jwt": {
      "token": "env:PORTAINER_JWT"
    }
  }
}
```

## 🔍 Health-Checks

### Ping-Check
```json
{
  "checks": {
    "ping": {
      "enabled": true,
      "host": "10.0.1.100",
      "intervalSec": 30
    }
  }
}
```

### HTTP-Check
```json
{
  "checks": {
    "http": {
      "enabled": true,
      "url": "http://10.0.1.100/api/health",
      "intervalSec": 60,
      "expectStatus": 200
    }
  }
}
```

### Pi-hole Adapter
```json
{
  "checks": {
    "adapters": {
      "pihole": {
        "enabled": true,
        "baseUrl": "http://10.0.1.100/admin",
        "token": "env:PIHOLE_TOKEN",
        "version": "v5"
      }
    }
  }
}
```

## 📊 API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/services` | GET | Alle Services abrufen |
| `/api/services` | POST | Neuen Service hinzufügen |
| `/api/services` | PUT | Service-Registry aus Config laden |
| `/api/services/{type}/{instanceId}` | GET | Einzelnen Service abrufen |
| `/api/services/{type}/{instanceId}` | PUT | Service aktualisieren |
| `/api/services/{type}/{instanceId}` | DELETE | Service entfernen |
| `/api/services/{type}/{instanceId}/duplicate` | POST | Service duplizieren |
| `/api/services/{type}/{instanceId}/health` | POST | Health-Check durchführen |
| `/api/services/{type}/{instanceId}/health` | GET | Health-Status abrufen |
| `/api/services/config` | GET | Config-Datei laden |
| `/api/services/config` | POST | Config-Datei speichern |

## 🎨 Admin-UI Features

- **Service-Management**: Hinzufügen, Bearbeiten, Entfernen
- **Duplizierung**: Services mit neuer instanceId kopieren
- **Health-Checks**: Test-Buttons für alle Adapter
- **Validierung**: Automatische Validierung der Konfiguration
- **Einfach/Erweitert**: Zwei Modi für verschiedene Nutzer
- **Real-time Updates**: Live-Status der Services

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# Pi-hole
PIHOLE_TOKEN_MAIN=your_token_here
PIHOLE_TOKEN_BACKUP=your_backup_token_here

# Portainer
PORTAINER_API_KEY=your_api_key_here
PORTAINER_JWT=your_jwt_token_here

# qBittorrent
QBIT_PASSWORD=your_password_here
QBIT_PASS_2=your_backup_password_here

# OpenWeatherMap
OWM_API_KEY=your_api_key_here

# Radarr/Lidarr
RADARR_API_KEY=your_api_key_here
LIDARR_API_KEY=your_api_key_here
```

### Beispiel-Konfigurationen
- `config/services-example.json` - Homer-Modus mit Health-Checks
- `config/services-heimdall-example.json` - Heimdall-Modus mit Templates

## 🚀 Nächste Schritte

1. **Widget-Integration**: Services in Dashboard-Widgets einbinden
2. **Dashboard-View**: Service-Kacheln auf der Hauptseite anzeigen
3. **Health-Monitoring**: Automatische Health-Checks mit WebSocket-Updates
4. **Alerting**: Benachrichtigungen bei Service-Ausfällen
5. **Metrics**: Detaillierte Statistiken und Trends

## 📚 Dokumentation

- [Vollständige Dokumentation](docs/SERVICE-REGISTRY.md)
- [API-Referenz](docs/API-REFERENCE.md)
- [Beispiel-Konfigurationen](config/)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.
