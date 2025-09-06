# Labora

Labora ist ein modernes, selbst-hostbares Homelab-Dashboard im Stil von Heimdall/Homer, aber mit erweiterten Funktionen und einem zeitgemäßen Design.

## ✨ Features

- **🎨 Modernes UI**: Responsive Design mit Dark/Light Mode
- **🔍 Intelligente Suche**: Fuzzy-Search über alle Services
- **🏷️ Tag-System**: Organisiere Services mit Tags und VLANs
- **📊 Live-Widgets**: Proxmox, pfSense, AdGuard Home, Nginx Proxy Manager
- **⚡ PWA**: Installierbar, offline-fähig
- **🔧 Admin-Interface**: Grafische Konfiguration über Web-UI
- **🐳 Docker-Ready**: Einfache Bereitstellung mit Docker Compose
- **🔒 Sicherheit**: Optional JWT-Authentifizierung

## 🚀 Quick Start

### Mit Docker Compose (Empfohlen)

1. **Repository klonen**
   ```bash
   git clone https://github.com/your-username/labora.git
   cd labora
   ```

2. **Konfiguration anpassen**
   ```bash
   cp env.example .env
   # Bearbeite .env mit deinen API-Credentials
   ```

3. **Starten**
   ```bash
   docker-compose up -d
   ```

4. **Dashboard öffnen**
   ```
   http://localhost:3000
   ```

### Lokale Entwicklung

1. **Dependencies installieren**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

3. **Build für Produktion**
   ```bash
   npm run build
   npm start
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
  - name: "Netzwerk"
    icon: "Globe"

services:
  - name: "Proxmox"
    url: "https://proxmox.lan:8006"
    icon: "Cpu"
    group: "Core"
    tags: ["vm", "infra"]
    vlan: 10
    health:
      type: "http"
      url: "https://proxmox.lan:8006/api2/json/version"
      interval: 30

widgets:
  proxmox:
    enabled: true
  pfsense:
    enabled: true
  adguard:
    enabled: true
  npm:
    enabled: true
```

### Widget-APIs konfigurieren

Für die Widgets müssen entsprechende API-Credentials in der `.env` gesetzt werden:

```bash
# Proxmox Widget
PROXMOX_BASE_URL=https://proxmox.lan:8006
PROXMOX_TOKEN_ID=dashboard@pve!readonly
PROXMOX_TOKEN_SECRET=your-token-secret

# pfSense Widget
PFSENSE_BASE_URL=https://pfsense.lan
PFSENSE_API_KEY=your-api-key
PFSENSE_API_SECRET=your-api-secret

# AdGuard Home Widget
ADGUARD_BASE_URL=http://10.0.20.103
ADGUARD_USERNAME=admin
ADGUARD_PASSWORD=your-password

# Nginx Proxy Manager Widget
NPM_BASE_URL=http://10.0.20.102
NPM_TOKEN=your-npm-token
```

## 🎯 Verwendung

### Dashboard

- **Suche**: Drücke `/` um die Suche zu fokussieren
- **Favoriten**: Klicke auf den Stern um Services zu favorisieren
- **Filter**: Nutze die Sidebar um nach Gruppen, Tags oder VLANs zu filtern
- **Theme**: Drücke `t` um zwischen Dark/Light Mode zu wechseln
- **Admin**: Drücke `a` um zur Administration zu gelangen

### Administration

1. Gehe zu `/admin` oder klicke auf das Einstellungs-Icon
2. **Services verwalten**: Hinzufügen, bearbeiten, löschen
3. **Gruppen organisieren**: Services in Kategorien einteilen
4. **Widgets konfigurieren**: APIs aktivieren/deaktivieren
5. **Einstellungen**: Titel, Beschreibung, Theme anpassen

### Widgets

#### Proxmox Widget
- Zeigt Node-Status und Ressourcenverbrauch
- VM-Übersicht mit Top 3 nach CPU-Verbrauch
- Automatische Aktualisierung alle 30 Sekunden

#### pfSense Widget
- Gateway-Status und Interface-Übersicht
- WAN-IP-Anzeige
- Automatische Aktualisierung jede Minute

#### AdGuard Home Widget
- DNS-Statistiken des aktuellen Tages
- Block-Rate und Top blockierte Domains
- Automatische Aktualisierung alle 30 Sekunden

#### Nginx Proxy Manager Widget
- Anzahl aktiver Proxy-Hosts
- SSL-Zertifikat-Status und Ablaufzeiten
- Automatische Aktualisierung alle 5 Minuten

## 🔧 API-Endpunkte

### Konfiguration
- `GET /api/config` - Konfiguration laden
- `POST /api/config` - Konfiguration speichern

### Health Checks
- `GET /api/health?service=<name>` - Einzelner Health Check
- `POST /api/health` - Bulk Health Checks

### Discovery
- `GET /api/discovery` - Netzwerk-Scan durchführen
- `POST /api/discovery` - Custom Discovery

### Widgets
- `GET /api/widgets/proxmox` - Proxmox-Daten
- `GET /api/widgets/pfsense` - pfSense-Daten
- `GET /api/widgets/adguard` - AdGuard-Daten
- `GET /api/widgets/npm` - NPM-Daten

## 🐳 Docker Setup

### Standard Setup

```yaml
version: '3.8'
services:
  homelab-dashboard:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./config:/config:ro
    environment:
      - CONFIG_PATH=/config/config.yml
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

### Mit Authelia (Authentifizierung)

```yaml
environment:
  - AUTH_HEADER_NAME=X-Forwarded-User
  - AUTH_HEADER_EMAIL=X-Forwarded-Email
```

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

## 📱 PWA-Features

- **Installierbar**: Als App auf Desktop/Mobile installieren
- **Offline-fähig**: Grundfunktionen auch ohne Internet
- **Service Worker**: Intelligentes Caching
- **Manifest**: App-Metadaten und Icons

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
```

### Projektstruktur

```
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── admin/          # Admin Interface
│   └── page.tsx        # Dashboard
├── components/         # React Komponenten
│   ├── ui/            # shadcn/ui Komponenten
│   └── widgets/       # Widget-Komponenten
├── lib/               # Utilities und Schemas
├── config/            # Konfigurationsdateien
├── public/            # Statische Assets
└── docker-compose.yml # Docker Setup
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [Heimdall](https://github.com/linuxserver/Heimdall) - Inspiration für das Design
- [Homer](https://github.com/bastienwirtz/homer) - Weitere Inspiration
- [shadcn/ui](https://ui.shadcn.com/) - UI-Komponenten
- [Lucide](https://lucide.dev/) - Icons

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfe die [Issues](https://github.com/your-username/labora/issues)
2. Erstelle ein neues Issue mit detaillierter Beschreibung
3. Für Diskussionen nutze die [Discussions](https://github.com/your-username/labora/discussions)

---

**Viel Spaß mit Labora! 🚀**