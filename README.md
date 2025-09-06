# Labora - Smart Homelab Dashboard

Ein modernes, selbst-hostbares Homelab-Dashboard mit erweiterten API-Integrationen und Mehrfach-Instanzen-Support.

## ✨ Features

### 🎯 **Grid-Modus**
- **Schöne Kacheln**: Vorgefertigte Service-Presets mit Icons und Beschreibungen
- **Kategorien**: Organisierte Gruppierung nach Infrastruktur, Netzwerk, Medien, etc.
- **Favoriten**: Wichtige Services hervorheben
- **Suchfunktion**: Schnelle Suche über alle Services
- **Responsive Design**: Optimiert für Desktop und Mobile

### 🔧 **Dynamic-Modus**
- **Health Checks**: Ping und HTTP-Status-Überwachung
- **API-Adapter**: Live-Daten von verschiedenen Homelab-Services
- **Mehrfach-Instanzen**: Mehrere Instanzen desselben Service-Typs
- **Authentifizierung**: Basic Auth, JWT, Header-Forward (Authelia/NPM)
- **Automatische Updates**: Regelmäßige Datenaktualisierung

### 🛠️ **Admin-Interface**
- **Service-Management**: Hinzufügen, bearbeiten, duplizieren, löschen
- **Preset-Katalog**: Über 20 vorgefertigte Service-Templates
- **Adapter-Konfiguration**: Ein-/Ausschalten von API-Integrationen
- **Test-Funktionen**: Service-Erreichbarkeit testen
- **Validierung**: Automatische Konfigurationsvalidierung

## 🚀 Quick Start

### Mit Docker Compose (Empfohlen)

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

## ⚙️ Konfiguration

### Service-Presets

Labora bietet vorgefertigte Presets für über 20 Homelab-Services:

#### **Infrastructure & Management**
- **Proxmox VE**: Virtualisierungsplattform
- **Portainer**: Docker Container Management
- **Grafana**: Monitoring und Visualisierung
- **Prometheus**: Metriken-Sammlung

#### **Network & Security**
- **pfSense/OPNsense**: Firewall und Router
- **AdGuard Home**: DNS-basierte Werbeblockierung
- **Pi-hole**: DNS-basierte Werbeblockierung
- **Nginx Proxy Manager**: Reverse Proxy mit SSL

#### **Media & Download**
- **Jellyfin**: Media Server
- **Sonarr**: TV Show Management
- **Radarr**: Movie Management
- **qBittorrent**: BitTorrent Client

#### **Files & Sync**
- **Nextcloud**: Cloud Storage
- **Syncthing**: File Synchronization

#### **Monitoring**
- **Uptime Kuma**: Uptime Monitoring
- **Netdata**: Real-time System Monitoring

#### **Home & IoT**
- **Home Assistant**: Smart Home Automation

### Beispiel-Konfiguration

```yaml
title: "Nucleus"
theme: system
groups:
  - { name: "Infra", icon: "Server" }
  - { name: "Netzwerk", icon: "Globe" }
  - { name: "Medien", icon: "Play" }

services:
  - type: proxmox
    instanceId: main
    name: Proxmox
    url: https://proxmox.lan:8006
    group: Infra
    tags: [vm, infra]
    vlan: 10
    checks:
      adapters:
        proxmox:
          enabled: true
          baseUrl: https://proxmox.lan:8006
          tokenId: ${PROXMOX_TOKEN_ID}
          tokenSecret: ${PROXMOX_TOKEN_SECRET}

  - type: adguard
    instanceId: dns1
    name: AdGuard Home
    url: http://10.0.20.103
    group: Netzwerk
    vlan: 20
    checks:
      adapters:
        adguard:
          enabled: true
          baseUrl: http://10.0.20.103
          username: ${ADGUARD_USER}
          password: ${ADGUARD_PASS}

  - type: qbittorrent
    instanceId: dl-1
    name: qBittorrent
    url: http://10.0.20.60
    group: Medien
    checks:
      http: { enabled: true, url: http://10.0.20.60, expectStatus: 200, intervalSec: 30 }
    auth:
      mode: basic
      basic: { username: admin, password: ${QBIT_PASS} }
```

### Environment Variables

Labora unterstützt Environment-Variablen in verschiedenen Formaten:

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

## 🔧 API-Adapter

### Verfügbare Adapter

| Adapter | Service | Beschreibung |
|---------|---------|--------------|
| `proxmox` | Proxmox VE | Node-Status, VM-Übersicht, Ressourcenverbrauch |
| `adguard` | AdGuard Home | DNS-Statistiken, Block-Rate, Top Domains |
| `pihole` | Pi-hole | DNS-Statistiken, Block-Rate, Top Domains |
| `npm` | Nginx Proxy Manager | Proxy-Hosts, SSL-Zertifikate, Ablaufzeiten |
| `portainer` | Portainer | Container, Images, Volumes, Networks |
| `jellyfin` | Jellyfin | Benutzer, Filme, Serien, Episoden |
| `sonarr` | Sonarr | Serien, Episoden, Queue, Warnings |
| `uptimekuma` | Uptime Kuma | Monitore, Status, Uptime |

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

## 🔒 Authentifizierung

Labora unterstützt verschiedene Authentifizierungsmethoden:

### 1. Keine Authentifizierung
```yaml
auth:
  mode: none
```

### 2. Basic Authentication
```yaml
auth:
  mode: basic
  basic:
    username: admin
    password: ${SERVICE_PASSWORD}
```

### 3. JWT Token
```yaml
auth:
  mode: jwt
  jwt:
    token: ${JWT_TOKEN}
```

### 4. Header Forward (Authelia/NPM)
```yaml
auth:
  mode: header_forward
  header_forward:
    headerName: X-Forwarded-User
```

## 🐳 Docker Setup

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

## 🛠️ Entwicklung

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Validierung**: Zod
- **Konfiguration**: YAML
- **Icons**: Lucide React
- **Suche**: Fuse.js

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

### Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
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
├── __tests__/            # Tests
└── docker-compose.yml    # Docker Setup
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
```

### E2E Tests

```bash
# E2E Tests ausführen
npm run test:e2e

# E2E Tests im UI-Modus
npm run test:e2e:ui
```

## 📱 PWA-Features

- **Installierbar**: Als App auf Desktop/Mobile installieren
- **Offline-fähig**: Grundfunktionen auch ohne Internet
- **Service Worker**: Intelligentes Caching
- **Manifest**: App-Metadaten und Icons

## 🔒 Sicherheit

### Authentifizierung

Das Dashboard unterstützt zwei Authentifizierungsmethoden:

1. **JWT (lokal)**: Einfache Benutzer/Passwort-Authentifizierung
2. **Header-Forward**: Kompatibel mit Authelia/NPM

### Sicherheits-Header

Das Dashboard setzt automatisch Sicherheits-Header:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

### Secrets-Handling

- Environment-Variablen werden sicher verarbeitet
- Secrets werden nie an den Client übertragen
- Automatische Sanitierung für Logs

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

### Entwicklungshinweise

- Verwende TypeScript für alle neuen Dateien
- Schreibe Tests für neue Features
- Dokumentiere API-Änderungen
- Folge den bestehenden Code-Style-Konventionen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- **Grid-Modus** - Inspiriert von klassischen Dashboard-Designs
- **Dynamic-Modus** - Inspiriert von modernen API-basierten Dashboards
- **shadcn/ui** - UI-Komponenten
- **Lucide** - Icons

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfe die [Issues](https://github.com/dandulox/homlab-tracker/issues)
2. Erstelle ein neues Issue mit detaillierter Beschreibung
3. Für Diskussionen nutze die [Discussions](https://github.com/dandulox/homlab-tracker/discussions)

## 📈 Roadmap

### Geplante Features

- [ ] **Erweiterte Widgets**: Grafana, Prometheus, Home Assistant
- [ ] **Service-Discovery**: Automatische Erkennung von Services
- [ ] **Backup/Restore**: Konfigurations-Backup
- [ ] **Themes**: Zusätzliche UI-Themes
- [ ] **Mobile App**: Native Mobile App
- [ ] **Plugin-System**: Erweiterbare Adapter

### Bekannte Einschränkungen

- Widgets verwenden derzeit Mock-Daten (echte API-Integration in Entwicklung)
- Begrenzte Anzahl von Service-Presets (erweiterbar)
- Keine Benutzerverwaltung (geplant)

---

**Viel Spaß mit Labora! 🚀**