# API-Dokumentation

Diese Dokumentation beschreibt alle verfügbaren API-Endpunkte von Labora.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Authentifizierung](#authentifizierung)
- [Konfigurations-API](#konfigurations-api)
- [Health Check API](#health-check-api)
- [Widget APIs](#widget-apis)
- [Discovery API](#discovery-api)
- [Fehlerbehandlung](#fehlerbehandlung)
- [Rate Limiting](#rate-limiting)
- [Beispiele](#beispiele)

## 🎯 Übersicht

Labora bietet eine REST-API für alle Dashboard-Funktionen:

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Authentifizierung**: Optional (JWT, Basic Auth, Header Forward)

### Verfügbare Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/config` | GET, POST | Konfigurationsverwaltung |
| `/api/health` | GET, POST | Health Checks |
| `/api/discovery` | GET, POST | Service Discovery |
| `/api/widgets/*` | GET | Widget-Daten |

## 🔒 Authentifizierung

### Authentifizierungsmodi

#### 1. Keine Authentifizierung
```bash
curl http://localhost:3000/api/config
```

#### 2. Basic Authentication
```bash
curl -u username:password http://localhost:3000/api/config
```

#### 3. JWT Token
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/config
```

#### 4. Header Forward (Authelia/NPM)
```bash
curl -H "X-Forwarded-User: username" http://localhost:3000/api/config
```

### JWT Token erhalten

```bash
# Login (falls implementiert)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2024-01-01T12:00:00Z"
}
```

## ⚙️ Konfigurations-API

### `GET /api/config`

Lädt die aktuelle Konfiguration.

**Request:**
```bash
curl http://localhost:3000/api/config
```

**Response:**
```json
{
  "title": "Labora",
  "description": "Homelab Dashboard - Übersicht Dienste & Status",
  "theme": "system",
  "auth": {
    "enabled": false
  },
  "groups": [
    {
      "name": "Core",
      "icon": "Server",
      "order": 0
    }
  ],
  "services": [
    {
      "id": "proxmox-main",
      "type": "proxmox",
      "instanceId": "main",
      "name": "Proxmox",
      "url": "https://proxmox.lan:8006",
      "icon": "Server",
      "group": "Core",
      "tags": ["vm", "infra"],
      "vlan": 10,
      "checks": {
        "adapters": {
          "proxmox": {
            "enabled": true,
            "baseUrl": "https://proxmox.lan:8006",
            "tokenId": "dashboard@pve!readonly",
            "tokenSecret": "***"
          }
        }
      },
      "auth": {
        "mode": "none"
      },
      "favorite": false,
      "hidden": false,
      "order": 0
    }
  ],
  "discovery": {
    "enabled": true,
    "cidr": ["10.0.10.0/24", "10.0.20.0/24"],
    "http_ports": [80, 443, 3000, 8080, 9000],
    "ping_timeout_ms": 600
  }
}
```

### `POST /api/config`

Speichert die Konfiguration.

**Request:**
```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Labora",
    "description": "Updated Description",
    "services": [...]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration saved successfully"
}
```

**Fehler-Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "services[0].url",
      "message": "Invalid URL format"
    }
  ]
}
```

## 🏥 Health Check API

### `GET /api/health?service=<name>`

Führt einen Health Check für einen Service durch.

**Request:**
```bash
curl "http://localhost:3000/api/health?service=proxmox-main"
```

**Response:**
```json
{
  "status": "up",
  "lastCheck": "2024-01-01T12:00:00Z",
  "responseTime": 150,
  "error": null,
  "service": "proxmox-main"
}
```

**Fehler-Response:**
```json
{
  "status": "down",
  "lastCheck": "2024-01-01T12:00:00Z",
  "responseTime": 5000,
  "error": "Connection timeout",
  "service": "proxmox-main"
}
```

### `POST /api/health`

Führt Bulk Health Checks durch.

**Request:**
```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["proxmox-main", "adguard-dns1"]
  }'
```

**Response:**
```json
{
  "results": [
    {
      "service": "proxmox-main",
      "status": "up",
      "lastCheck": "2024-01-01T12:00:00Z",
      "responseTime": 150,
      "error": null
    },
    {
      "service": "adguard-dns1",
      "status": "down",
      "lastCheck": "2024-01-01T12:00:00Z",
      "responseTime": 5000,
      "error": "Connection refused"
    }
  ],
  "summary": {
    "total": 2,
    "up": 1,
    "down": 1
  }
}
```

## 🔌 Widget APIs

### `GET /api/widgets/proxmox`

Lädt Proxmox-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/proxmox
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "node": "pve1",
        "status": "online",
        "cpu": 45,
        "memory": 67,
        "storage": 23
      },
      {
        "node": "pve2",
        "status": "online",
        "cpu": 32,
        "memory": 54,
        "storage": 41
      }
    ],
    "vms": [
      {
        "vmid": "100",
        "name": "docker-host",
        "status": "running",
        "cpu": 25,
        "memory": 40
      },
      {
        "vmid": "101",
        "name": "web-server",
        "status": "running",
        "cpu": 15,
        "memory": 30
      }
    ]
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 250
}
```

### `GET /api/widgets/adguard`

Lädt AdGuard-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/adguard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queries_today": 15420,
    "blocked_today": 3240,
    "blocked_percentage": 21.0,
    "top_domains": [
      {
        "domain": "googleads.g.doubleclick.net",
        "count": 450
      },
      {
        "domain": "googlesyndication.com",
        "count": 320
      }
    ]
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 180
}
```

### `GET /api/widgets/pihole`

Lädt Pi-hole-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/pihole
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queries_today": 12350,
    "blocked_today": 2100,
    "blocked_percentage": 17.0,
    "top_domains": [
      {
        "domain": "ads.example.com",
        "count": 300
      }
    ]
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 120
}
```

### `GET /api/widgets/npm`

Lädt Nginx Proxy Manager-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/npm
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_hosts": 15,
    "ssl_certificates": 12,
    "expiring_soon": 2
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 200
}
```

### `GET /api/widgets/portainer`

Lädt Portainer-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/portainer
```

**Response:**
```json
{
  "success": true,
  "data": {
    "containers": 25,
    "images": 45,
    "volumes": 12,
    "networks": 8
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 300
}
```

### `GET /api/widgets/jellyfin`

Lädt Jellyfin-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/jellyfin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": 5,
    "movies": 1250,
    "shows": 85,
    "episodes": 2150
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 400
}
```

### `GET /api/widgets/sonarr`

Lädt Sonarr-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/sonarr
```

**Response:**
```json
{
  "success": true,
  "data": {
    "series": 45,
    "episodes": 1250,
    "queue": 3,
    "warnings": 1
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 350
}
```

### `GET /api/widgets/uptimekuma`

Lädt Uptime Kuma-Daten.

**Request:**
```bash
curl http://localhost:3000/api/widgets/uptimekuma
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monitors": 25,
    "up": 23,
    "down": 2,
    "maintenance": 0
  },
  "lastUpdate": "2024-01-01T12:00:00Z",
  "responseTime": 280
}
```

## 🔍 Discovery API

### `GET /api/discovery`

Führt Service Discovery durch.

**Request:**
```bash
curl http://localhost:3000/api/discovery
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "host": "10.0.20.100",
      "port": 3000,
      "service": "grafana",
      "title": "Grafana",
      "status": "up",
      "responseTime": 120
    },
    {
      "host": "10.0.20.101",
      "port": 9000,
      "service": "portainer",
      "title": "Portainer",
      "status": "up",
      "responseTime": 95
    },
    {
      "host": "10.0.20.102",
      "port": 81,
      "service": "npm",
      "title": "Nginx Proxy Manager",
      "status": "up",
      "responseTime": 150
    }
  ],
  "scanTime": "2024-01-01T12:00:00Z",
  "duration": 2500
}
```

### `POST /api/discovery`

Führt Custom Service Discovery durch.

**Request:**
```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "cidr": ["10.0.30.0/24"],
    "ports": [8080, 9000],
    "timeout": 1000
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "host": "10.0.30.10",
      "port": 8080,
      "service": "unknown",
      "title": "Web Service",
      "status": "up",
      "responseTime": 200
    }
  ],
  "scanTime": "2024-01-01T12:00:00Z",
  "duration": 1500
}
```

## ❌ Fehlerbehandlung

### HTTP-Status-Codes

| Code | Bedeutung | Beschreibung |
|------|-----------|--------------|
| 200 | OK | Erfolgreiche Anfrage |
| 400 | Bad Request | Ungültige Anfrage |
| 401 | Unauthorized | Authentifizierung erforderlich |
| 403 | Forbidden | Keine Berechtigung |
| 404 | Not Found | Endpunkt nicht gefunden |
| 422 | Unprocessable Entity | Validierungsfehler |
| 500 | Internal Server Error | Server-Fehler |
| 503 | Service Unavailable | Service nicht verfügbar |

### Fehler-Response-Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional information"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Häufige Fehler

#### **400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid request format",
  "code": "INVALID_REQUEST"
}
```

#### **401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

#### **422 Unprocessable Entity**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "services[0].url",
      "message": "Invalid URL format"
    }
  ]
}
```

#### **500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## 🚦 Rate Limiting

### Limits

- **Standard**: 100 Anfragen pro Minute
- **Health Checks**: 10 Anfragen pro Minute
- **Discovery**: 5 Anfragen pro Minute

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

## 📝 Beispiele

### Python

```python
import requests
import json

# Konfiguration laden
response = requests.get('http://localhost:3000/api/config')
config = response.json()

# Health Check
response = requests.get('http://localhost:3000/api/health?service=proxmox-main')
health = response.json()

# Proxmox-Daten laden
response = requests.get('http://localhost:3000/api/widgets/proxmox')
proxmox_data = response.json()

# Service Discovery
response = requests.post('http://localhost:3000/api/discovery', 
    json={'cidr': ['10.0.20.0/24'], 'ports': [80, 443]})
discovery = response.json()
```

### JavaScript

```javascript
// Konfiguration laden
const config = await fetch('/api/config').then(r => r.json());

// Health Check
const health = await fetch('/api/health?service=proxmox-main').then(r => r.json());

// Proxmox-Daten laden
const proxmoxData = await fetch('/api/widgets/proxmox').then(r => r.json());

// Service Discovery
const discovery = await fetch('/api/discovery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cidr: ['10.0.20.0/24'], ports: [80, 443] })
}).then(r => r.json());
```

### cURL

```bash
# Alle Services
curl http://localhost:3000/api/config

# Spezifischer Service
curl "http://localhost:3000/api/health?service=proxmox-main"

# Widget-Daten
curl http://localhost:3000/api/widgets/proxmox

# Discovery
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"cidr": ["10.0.20.0/24"]}'
```

### PowerShell

```powershell
# Konfiguration laden
$config = Invoke-RestMethod -Uri "http://localhost:3000/api/config"

# Health Check
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/health?service=proxmox-main"

# Proxmox-Daten laden
$proxmoxData = Invoke-RestMethod -Uri "http://localhost:3000/api/widgets/proxmox"

# Service Discovery
$discovery = Invoke-RestMethod -Uri "http://localhost:3000/api/discovery" -Method POST -Body '{"cidr": ["10.0.20.0/24"]}' -ContentType "application/json"
```

---

**Für weitere Informationen konsultieren Sie die [Hauptdokumentation](README.md) oder erstellen Sie ein [Issue](https://github.com/dandulox/homlab-tracker/issues).**
