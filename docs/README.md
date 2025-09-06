# Labora - Smart Homelab Dashboard

Ein modernes, selbst-hostbares Homelab-Dashboard im Stil von Heimdall/Homer mit erweiterten API-Integrationen und Mehrfach-Instanzen-Support.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Features](#features)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Service-Presets](#service-presets)
- [API-Adapter](#api-adapter)
- [Authentifizierung](#authentifizierung)
- [Admin-Interface](#admin-interface)
- [Docker-Setup](#docker-setup)
- [Entwicklung](#entwicklung)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [API-Referenz](#api-referenz)
- [Beitragen](#beitragen)

## 🎯 Übersicht

Labora ist ein modernes Homelab-Dashboard, das die besten Features von Heimdall und Homer kombiniert:

- **Heimdall-Modus**: Schöne Kacheln mit vorgefertigten Presets
- **Homer-Modus**: Live-Daten über API-Adapter
- **Mehrfach-Instanzen**: Mehrere Instanzen desselben Service-Typs
- **Admin-Interface**: Vollständige GUI-Verwaltung
- **Moderne Architektur**: Next.js 14, TypeScript, TailwindCSS

## ✨ Features

### 🎨 **Dashboard-Features**
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Theme-Support**: Light/Dark/System Themes
- **Suchfunktion**: Fuzzy-Suche über alle Services
- **Favoriten**: Wichtige Services hervorheben
- **Gruppierung**: Organisierte Kategorien
- **PWA**: Installierbar als App

### 🔧 **Service-Management**
- **Preset-System**: 20+ vorgefertigte Service-Templates
- **Mehrfach-Instanzen**: Mehrere Instanzen desselben Typs
- **Health Checks**: Ping und HTTP-Status-Überwachung
- **API-Integration**: Live-Daten von Homelab-Services
- **Authentifizierung**: Basic Auth, JWT, Header-Forward

### 🛠️ **Admin-Interface**
- **Service-CRUD**: Hinzufügen, bearbeiten, duplizieren, löschen
- **Adapter-Konfiguration**: Ein-/Ausschalten von API-Integrationen
- **Test-Funktionen**: Service-Erreichbarkeit testen
- **Validierung**: Automatische Konfigurationsvalidierung
- **Import/Export**: Konfigurations-Backup

## 🚀 Installation

### Voraussetzungen

- **Node.js**: 18.x oder höher
- **Docker**: 20.x oder höher (optional)
- **RAM**: Mindestens 2GB
- **Speicher**: Mindestens 10GB freier Speicherplatz

### Schnellstart mit Docker

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Konfiguration anpassen
cp env.example .env
# Bearbeite .env mit deinen API-Credentials

# Starten
docker-compose up -d

# Dashboard öffnen
open http://localhost:3000
```

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build für Produktion
npm run build
npm start
```

### LXC Container Installation

Für LXC Container mit Ubuntu verwenden Sie das bereitgestellte Installationsskript:

```bash
# Skript herunterladen und ausführen
chmod +x install-labora.sh
sudo ./install-labora.sh
```

## ⚙️ Konfiguration

### Basis-Konfiguration

Die Hauptkonfiguration erfolgt über `config/config.yml`:

```yaml
title: "Labora"
description: "Homelab Dashboard - Übersicht Dienste & Status"
theme: "system"  # light | dark | system
auth:
  enabled: false

groups:
  - name: "Core"
    icon: "Server"
    order: 0
  - name: "Netzwerk"
    icon: "Globe"
    order: 1

services:
  - id: "proxmox-main"
    type: "proxmox"
    instanceId: "main"
    name: "Proxmox"
    url: "https://proxmox.lan:8006"
    icon: "Server"
    group: "Core"
    tags: ["vm", "infra"]
    vlan: 10
    checks:
      adapters:
        proxmox:
          enabled: true
          baseUrl: "https://proxmox.lan:8006"
          tokenId: "${PROXMOX_TOKEN_ID}"
          tokenSecret: "${PROXMOX_TOKEN_SECRET}"
    auth:
      mode: "none"
    order: 0

discovery:
  enabled: true
  cidr: ["10.0.10.0/24", "10.0.20.0/24"]
  http_ports: [80, 443, 3000, 8080, 9000]
  ping_timeout_ms: 600
```

### Environment-Variablen

Labora unterstützt verschiedene Environment-Variable-Formate:

```bash
# Standard Format
PROXMOX_BASE_URL=https://proxmox.lan:8006
PROXMOX_TOKEN_ID=dashboard@pve!readonly
PROXMOX_TOKEN_SECRET=your-token-secret

# In der Konfiguration verwenden
baseUrl: ${PROXMOX_BASE_URL}
tokenId: ${PROXMOX_TOKEN_ID}
tokenSecret: ${PROXMOX_TOKEN_SECRET}

# Alternative Formate
baseUrl: env:PROXMOX_BASE_URL
tokenId: $PROXMOX_TOKEN_ID
```

## 📋 Service-Presets

Labora bietet vorgefertigte Presets für über 20 Homelab-Services:

### **Infrastructure & Management**
- **Proxmox VE**: Virtualisierungsplattform
- **Portainer**: Docker Container Management
- **Grafana**: Monitoring und Visualisierung
- **Prometheus**: Metriken-Sammlung

### **Network & Security**
- **pfSense/OPNsense**: Firewall und Router
- **AdGuard Home**: DNS-basierte Werbeblockierung
- **Pi-hole**: DNS-basierte Werbeblockierung
- **Nginx Proxy Manager**: Reverse Proxy mit SSL

### **Media & Download**
- **Jellyfin**: Media Server
- **Sonarr**: TV Show Management
- **Radarr**: Movie Management
- **qBittorrent**: BitTorrent Client

### **Files & Sync**
- **Nextcloud**: Cloud Storage
- **Syncthing**: File Synchronization

### **Monitoring**
- **Uptime Kuma**: Uptime Monitoring
- **Netdata**: Real-time System Monitoring

### **Home & IoT**
- **Home Assistant**: Smart Home Automation

### Preset verwenden

```yaml
services:
  - type: proxmox
    instanceId: main
    name: Proxmox
    url: https://proxmox.lan:8006
    group: Infrastructure
    checks:
      adapters:
        proxmox:
          enabled: true
          baseUrl: https://proxmox.lan:8006
          tokenId: ${PROXMOX_TOKEN_ID}
          tokenSecret: ${PROXMOX_TOKEN_SECRET}
```

## 🔌 API-Adapter

### Verfügbare Adapter

| Adapter | Service | Beschreibung | Konfiguration |
|---------|---------|--------------|---------------|
| `proxmox` | Proxmox VE | Node-Status, VM-Übersicht, Ressourcenverbrauch | `baseUrl`, `tokenId`, `tokenSecret` |
| `adguard` | AdGuard Home | DNS-Statistiken, Block-Rate, Top Domains | `baseUrl`, `username`, `password` |
| `pihole` | Pi-hole | DNS-Statistiken, Block-Rate, Top Domains | `baseUrl`, `token`, `version` |
| `npm` | Nginx Proxy Manager | Proxy-Hosts, SSL-Zertifikate, Ablaufzeiten | `baseUrl`, `token` |
| `portainer` | Portainer | Container, Images, Volumes, Networks | `baseUrl`, `apiKey` |
| `jellyfin` | Jellyfin | Benutzer, Filme, Serien, Episoden | `baseUrl`, `apiKey` |
| `sonarr` | Sonarr | Serien, Episoden, Queue, Warnings | `baseUrl`, `apiKey` |
| `uptimekuma` | Uptime Kuma | Monitore, Status, Uptime | `baseUrl`, `apiKey` |

### Adapter konfigurieren

```yaml
checks:
  adapters:
    proxmox:
      enabled: true
      baseUrl: https://proxmox.lan:8006
      tokenId: ${PROXMOX_TOKEN_ID}
      tokenSecret: ${PROXMOX_TOKEN_SECRET}
    
    adguard:
      enabled: true
      baseUrl: http://adguard.lan
      username: ${ADGUARD_USER}
      password: ${ADGUARD_PASS}
```

### Health Checks

```yaml
checks:
  ping:
    enabled: true
    host: example.com
    intervalSec: 30
  
  http:
    enabled: true
    url: https://example.com/health
    expectStatus: 200
    intervalSec: 30
```

## 🔒 Authentifizierung

### Authentifizierungsmodi

#### 1. Keine Authentifizierung
```yaml
auth:
  mode: none
```

#### 2. Basic Authentication
```yaml
auth:
  mode: basic
  basic:
    username: admin
    password: ${SERVICE_PASSWORD}
```

#### 3. JWT Token
```yaml
auth:
  mode: jwt
  jwt:
    token: ${JWT_TOKEN}
```

#### 4. Header Forward (Authelia/NPM)
```yaml
auth:
  mode: header_forward
  header_forward:
    headerName: X-Forwarded-User
```

### Authelia Integration

```yaml
# Nginx Proxy Manager Konfiguration
auth:
  mode: header_forward
  header_forward:
    headerName: X-Forwarded-User

# Authelia Headers
X-Forwarded-User: username
X-Forwarded-Email: user@example.com
X-Forwarded-Groups: admin,users
```

## 🎛️ Admin-Interface

### Service-Management

Das Admin-Interface ist unter `/admin` erreichbar und bietet:

#### **Service-Liste**
- Übersicht aller Services
- Such- und Filterfunktionen
- Status-Anzeige (API aktiv, überwacht, statisch)
- Schnellaktionen (Bearbeiten, Duplizieren, Löschen, Testen)

#### **Service-Formular**
- **Grundlagen**: Name, URL, Gruppe, Tags, VLAN
- **Adapter**: Konfiguration der API-Adapter
- **Authentifizierung**: Auth-Modus und Credentials
- **Erweitert**: Favoriten, Verstecken, Reihenfolge

#### **Preset-Katalog**
- Kategorisierte Service-Presets
- Vorgefertigte Konfigurationen
- Adapter-Integration

### Konfigurationsverwaltung

#### **Allgemeine Einstellungen**
- Dashboard-Titel und -Beschreibung
- Theme-Auswahl
- Authentifizierung aktivieren/deaktivieren

#### **Gruppen-Verwaltung**
- Gruppen hinzufügen, bearbeiten, löschen
- Icon-Auswahl
- Reihenfolge-Anpassung

#### **Widget-Verwaltung**
- Widgets aktivieren/deaktivieren
- Status-Anzeige

## 🐳 Docker-Setup

### Standard Setup

```yaml
version: '3.8'
services:
  labora:
    build: .
    container_name: labora
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./config:/config:ro
      - labora-config:/app/config
    environment:
      - NODE_ENV=production
      - CONFIG_PATH=/config/config.yml
      # Widget API credentials
      - PROXMOX_BASE_URL=https://proxmox.lan:8006
      - PROXMOX_TOKEN_ID=dashboard@pve!readonly
      - PROXMOX_TOKEN_SECRET=your-token-secret
      - ADGUARD_BASE_URL=http://10.0.20.103
      - ADGUARD_USERNAME=admin
      - ADGUARD_PASSWORD=your-password
    networks:
      - labora
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  labora-config:

networks:
  labora:
    driver: bridge
```

### Mit Nginx Proxy Manager

1. **NPM-Proxy-Host erstellen**:
   - Domain: `dashboard.lan`
   - Forward Hostname/IP: `labora`
   - Forward Port: `3000`
   - SSL: Aktiviert

2. **Docker Compose erweitern**:
```yaml
networks:
  - npm-network

services:
  labora:
    networks:
      - npm-network
```

### Mit Authelia

```yaml
environment:
  - AUTH_HEADER_NAME=X-Forwarded-User
  - AUTH_HEADER_EMAIL=X-Forwarded-Email
```

## 🛠️ Entwicklung

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Validierung**: Zod
- **Konfiguration**: YAML
- **Icons**: Lucide React
- **Suche**: Fuse.js
- **Testing**: Vitest, Playwright

### Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── config/        # Konfigurations-API
│   │   ├── health/        # Health Check API
│   │   ├── discovery/     # Service Discovery API
│   │   └── widgets/       # Widget APIs
│   ├── admin/             # Admin Interface
│   └── page.tsx           # Dashboard
├── components/            # React Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   ├── widgets/          # Widget-Komponenten
│   └── admin/            # Admin-Komponenten
├── lib/                  # Utilities und Schemas
│   ├── clients/          # API-Adapter
│   ├── schemas/          # Zod-Schemas
│   └── presets.ts        # Service-Presets
├── config/               # Konfigurationsdateien
├── docs/                 # Dokumentation
├── __tests__/            # Tests
├── public/               # Statische Assets
└── docker-compose.yml    # Docker Setup
```

### Scripts

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run start        # Produktions-Server
npm run lint         # ESLint
npm run test         # Unit Tests
npm run test:e2e     # E2E Tests
npm run type-check   # TypeScript Check
```

### Entwicklungsumgebung einrichten

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Dependencies installieren
npm install

# Environment-Variablen setzen
cp env.example .env
# Bearbeite .env

# Entwicklungsserver starten
npm run dev
```

## 🧪 Testing

### Unit Tests

```bash
# Alle Tests ausführen
npm run test

# Tests im Watch-Modus
npm run test:watch

# Test-Coverage
npm run test:coverage

# Spezifische Tests
npm run test -- --grep "Adapter"
```

### E2E Tests

```bash
# E2E Tests ausführen
npm run test:e2e

# E2E Tests im UI-Modus
npm run test:e2e:ui

# E2E Tests für Admin-Interface
npm run test:e2e -- --grep "Admin"
```

### Test-Struktur

```
__tests__/
├── lib/
│   ├── clients/          # Adapter-Tests
│   ├── schemas/          # Schema-Tests
│   └── presets.test.ts   # Preset-Tests
├── components/           # Komponenten-Tests
├── e2e/                  # E2E-Tests
└── setup.ts              # Test-Setup
```

## 🚀 Deployment

### Produktions-Build

```bash
# Build erstellen
npm run build

# Produktions-Server starten
npm start
```

### Docker Deployment

```bash
# Image bauen
docker build -t labora .

# Container starten
docker run -d \
  --name labora \
  -p 3000:3000 \
  -v ./config:/config:ro \
  -e CONFIG_PATH=/config/config.yml \
  labora
```

### LXC Container

```bash
# Installationsskript ausführen
sudo ./install-labora.sh

# Service verwalten
sudo systemctl start/stop/restart labora
```

### Reverse Proxy

#### Nginx

```nginx
server {
    listen 80;
    server_name dashboard.lan;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache

```apache
<VirtualHost *:80>
    ServerName dashboard.lan
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

## 🔧 Troubleshooting

### Häufige Probleme

#### **Service nicht erreichbar**
```bash
# Health Check testen
curl -f http://localhost:3000/api/health

# Logs überprüfen
docker logs labora
```

#### **Adapter-Fehler**
```bash
# Environment-Variablen prüfen
echo $PROXMOX_BASE_URL

# Adapter-Konfiguration testen
curl -H "Authorization: PVEAPIToken=..." https://proxmox.lan:8006/api2/json/version
```

#### **Konfigurationsfehler**
```bash
# YAML-Syntax prüfen
npm run validate-config

# Schema-Validierung
npm run test -- --grep "Schema"
```

### Debug-Modus

```bash
# Debug-Logs aktivieren
DEBUG=labora:* npm run dev

# Docker Debug
docker run -e DEBUG=labora:* labora
```

### Logs

```bash
# Application Logs
tail -f logs/labora.log

# Docker Logs
docker logs -f labora

# System Logs
journalctl -u labora -f
```

## 📚 API-Referenz

### Konfigurations-API

#### `GET /api/config`
Lädt die aktuelle Konfiguration.

**Response:**
```json
{
  "title": "Labora",
  "description": "Homelab Dashboard",
  "theme": "system",
  "auth": { "enabled": false },
  "groups": [...],
  "services": [...],
  "discovery": {...}
}
```

#### `POST /api/config`
Speichert die Konfiguration.

**Request:**
```json
{
  "title": "Labora",
  "services": [...]
}
```

**Response:**
```json
{ "success": true }
```

### Health Check API

#### `GET /api/health?service=<name>`
Führt einen Health Check für einen Service durch.

**Response:**
```json
{
  "status": "up",
  "lastCheck": "2024-01-01T12:00:00Z",
  "responseTime": 150,
  "error": null
}
```

#### `POST /api/health`
Führt Bulk Health Checks durch.

**Request:**
```json
{
  "services": ["proxmox", "adguard"]
}
```

### Widget APIs

#### `GET /api/widgets/proxmox`
Lädt Proxmox-Daten.

**Response:**
```json
{
  "nodes": [
    {
      "node": "pve1",
      "status": "online",
      "cpu": 45,
      "memory": 67,
      "storage": 23
    }
  ],
  "vms": [...],
  "lastUpdate": "2024-01-01T12:00:00Z"
}
```

#### `GET /api/widgets/adguard`
Lädt AdGuard-Daten.

**Response:**
```json
{
  "queries_today": 15420,
  "blocked_today": 3240,
  "blocked_percentage": 21.0,
  "top_domains": [...]
}
```

### Discovery API

#### `GET /api/discovery`
Führt Service Discovery durch.

**Response:**
```json
[
  {
    "host": "10.0.20.100",
    "port": 3000,
    "service": "grafana",
    "title": "Grafana",
    "status": "up",
    "responseTime": 120
  }
]
```

## 🤝 Beitragen

### Entwicklungshinweise

1. **Code-Style**: Verwende Prettier und ESLint
2. **TypeScript**: Alle neuen Dateien müssen TypeScript verwenden
3. **Tests**: Schreibe Tests für neue Features
4. **Dokumentation**: Dokumentiere API-Änderungen
5. **Commits**: Verwende aussagekräftige Commit-Messages

### Pull Request Prozess

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe Tests
5. Aktualisiere Dokumentation
6. Erstelle einen Pull Request

### Issue-Template

```markdown
## Beschreibung
Kurze Beschreibung des Problems oder Features.

## Schritte zur Reproduktion
1. Gehe zu '...'
2. Klicke auf '...'
3. Siehe Fehler

## Erwartetes Verhalten
Was sollte passieren?

## Screenshots
Falls zutreffend, füge Screenshots hinzu.

## Umgebung
- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 2.0.0]
```

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](../LICENSE) für Details.

## 🙏 Danksagungen

- **Heimdall** - Inspiration für das Design
- **Homer** - Weitere Inspiration
- **shadcn/ui** - UI-Komponenten
- **Lucide** - Icons
- **Next.js Team** - Framework
- **Vercel** - Deployment-Plattform

---

**Viel Spaß mit Labora! 🚀**
