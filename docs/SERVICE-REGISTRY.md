# Service Registry - Homelab Dashboard

Das Service Registry System ermöglicht es, Services in zwei Modi zu verwalten: **Heimdall-Modus** (reine Links/Kacheln) und **Homer-Modus** (mit Live-Checks und Widgets).

## Übersicht

### Heimdall-Modus
- **Zweck**: Reine Link-Sammlung ohne Live-Daten
- **Verwendung**: Schneller Zugriff auf externe Services
- **Features**: 
  - Kachel-basierte Darstellung
  - Template-Presets (foundation/enhanced)
  - Custom Fields für Deep-Links
  - Keine API-Calls oder Health-Checks

### Homer-Modus
- **Zweck**: Live-Monitoring mit Health-Checks
- **Verwendung**: Überwachung interner Services
- **Features**:
  - Ping/HTTP Health-Checks
  - Spezifische Adapter (Pi-hole, Portainer, etc.)
  - Real-time Status-Updates
  - Detaillierte Metriken

## Service-Schema

### Basis-Felder
```json
{
  "id": "string (UUID)",
  "type": "ServiceType",
  "instanceId": "string",
  "name": "string",
  "url": "string (URL)",
  "icon": "string (Lucide Icon)",
  "group": "string",
  "tags": ["string[]"],
  "vlan": "number (optional)"
}
```

### Service-Typen
- **Infrastructure**: `proxmox`, `portainer`, `nginxpm`
- **Media**: `qbittorrent`, `radarr`, `sonarr`, `lidarr`, `medusa`
- **Network**: `pihole`, `adguard`
- **Monitoring**: `prometheus`
- **External**: `openweathermap`
- **Generic**: `generic` (für externe Links)

### Authentifizierung
```json
{
  "auth": {
    "mode": "none" | "header_forward" | "basic" | "jwt",
    "basic": {
      "username": "string",
      "password": "string"
    },
    "jwt": {
      "token": "string"
    },
    "header_forward": {
      "headerName": "string (optional)"
    }
  }
}
```

## Heimdall-Modus Konfiguration

### Template-System
```json
{
  "template": {
    "preset": "foundation" | "enhanced",
    "fields": {
      "customField": "value"
    }
  }
}
```

**Presets:**
- `foundation`: Einfache Kachel mit Icon, Name, URL
- `enhanced`: Erweiterte Kachel mit zusätzlichen Feldern

### Beispiel (Heimdall)
```json
{
  "id": "github-001",
  "type": "generic",
  "instanceId": "main",
  "name": "GitHub",
  "url": "https://github.com",
  "icon": "Github",
  "group": "Development",
  "tags": ["git", "code"],
  "template": {
    "preset": "enhanced",
    "fields": {
      "description": "Code Repository",
      "repository": "username/repo"
    }
  },
  "auth": {
    "mode": "none"
  }
}
```

## Homer-Modus Konfiguration

### Health-Checks
```json
{
  "checks": {
    "ping": {
      "enabled": true,
      "host": "10.0.1.100",
      "intervalSec": 30
    },
    "http": {
      "enabled": true,
      "url": "http://10.0.1.100/api/health",
      "intervalSec": 60,
      "expectStatus": 200
    }
  }
}
```

### Adapter-Konfiguration
```json
{
  "checks": {
    "adapters": {
      "pihole": {
        "enabled": true,
        "baseUrl": "http://10.0.1.100/admin",
        "token": "env:PIHOLE_TOKEN",
        "version": "v5"
      },
      "portainer": {
        "enabled": true,
        "baseUrl": "http://10.0.1.100/api",
        "apiKey": "env:PORTAINER_API_KEY"
      },
      "prometheus": {
        "enabled": true,
        "baseUrl": "http://10.0.1.100",
        "query": "up"
      }
    }
  }
}
```

### Beispiel (Homer)
```json
{
  "id": "pihole-main-001",
  "type": "pihole",
  "instanceId": "main",
  "name": "Pi-hole (Main)",
  "url": "http://10.0.1.100/admin",
  "icon": "Shield",
  "group": "Netzwerk",
  "tags": ["dns", "adblock"],
  "checks": {
    "ping": {
      "enabled": true,
      "host": "10.0.1.100",
      "intervalSec": 30
    },
    "adapters": {
      "pihole": {
        "enabled": true,
        "baseUrl": "http://10.0.1.100/admin",
        "token": "env:PIHOLE_TOKEN",
        "version": "v5"
      }
    }
  },
  "auth": {
    "mode": "header_forward"
  }
}
```

## Mehrfach-Instanzen

Services können mehrfach mit unterschiedlichen `instanceId` angelegt werden:

```json
{
  "services": [
    {
      "type": "pihole",
      "instanceId": "main",
      "name": "Pi-hole (Main)",
      "url": "http://10.0.1.100/admin"
    },
    {
      "type": "pihole", 
      "instanceId": "backup",
      "name": "Pi-hole (Backup)",
      "url": "http://10.0.1.101/admin"
    },
    {
      "type": "qbittorrent",
      "instanceId": "movies",
      "name": "qBittorrent (Movies)",
      "url": "http://10.0.1.200"
    },
    {
      "type": "qbittorrent",
      "instanceId": "tv",
      "name": "qBittorrent (TV)",
      "url": "http://10.0.1.201"
    }
  ]
}
```

## Umgebungsvariablen

Sensible Daten sollten als Umgebungsvariablen referenziert werden:

```json
{
  "auth": {
    "mode": "basic",
    "basic": {
      "username": "admin",
      "password": "env:QBIT_PASSWORD"
    }
  },
  "checks": {
    "adapters": {
      "pihole": {
        "token": "env:PIHOLE_TOKEN"
      }
    }
  }
}
```

## API-Endpunkte

### Services verwalten
- `GET /api/services` - Alle Services abrufen
- `POST /api/services` - Neuen Service hinzufügen
- `PUT /api/services` - Service-Registry aus Config laden
- `GET /api/services/{type}/{instanceId}` - Einzelnen Service abrufen
- `PUT /api/services/{type}/{instanceId}` - Service aktualisieren
- `DELETE /api/services/{type}/{instanceId}` - Service entfernen

### Service-Operationen
- `POST /api/services/{type}/{instanceId}/duplicate` - Service duplizieren
- `POST /api/services/{type}/{instanceId}/health` - Health-Check durchführen
- `GET /api/services/{type}/{instanceId}/health` - Health-Status abrufen

## Admin-UI

Die Admin-UI (`/admin/services`) bietet:

### Service-Management
- Services hinzufügen/bearbeiten/entfernen
- Service duplizieren
- Health-Checks testen
- Einfach/Erweitert-Modus

### Konfiguration
- Service-Typ auswählen
- Authentifizierung konfigurieren
- Health-Checks aktivieren/deaktivieren
- Adapter konfigurieren

### Validierung
- Automatische Validierung der Service-Konfiguration
- Fehlerbehandlung und Benutzer-Feedback
- Test-Buttons für Health-Checks

## Best Practices

### Sicherheit
- Verwende `header_forward` für NPM/Authelia-Integration
- Speichere Passwörter als Umgebungsvariablen
- Deaktiviere API-Calls bei fehlenden Credentials

### Performance
- Setze angemessene Check-Intervalle (30-120 Sekunden)
- Deaktiviere nicht benötigte Adapter
- Verwende Ping-Checks für schnelle Verfügbarkeitsprüfungen

### Organisation
- Verwende aussagekräftige `instanceId` (z.B. `main`, `backup`, `movies`)
- Gruppiere Services logisch
- Verwende Tags für bessere Filterung

## Migration

### Von bestehender Config
1. Services in neues Schema konvertieren
2. `instanceId` für jeden Service definieren
3. Health-Checks optional aktivieren
4. Authentifizierung konfigurieren

### Beispiel-Migration
```bash
# Alte Config
{
  "services": [
    {
      "name": "Pi-hole",
      "url": "http://10.0.1.100/admin"
    }
  ]
}

# Neue Config
{
  "services": [
    {
      "id": "pihole-001",
      "type": "pihole",
      "instanceId": "main",
      "name": "Pi-hole",
      "url": "http://10.0.1.100/admin",
      "group": "Netzwerk",
      "tags": ["dns"],
      "checks": {
        "ping": { "enabled": true, "host": "10.0.1.100" }
      },
      "auth": { "mode": "none" }
    }
  ]
}
```
