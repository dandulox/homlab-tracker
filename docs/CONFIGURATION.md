# Konfigurationshandbuch

Dieses Handbuch erklärt die Konfiguration von Labora im Detail.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Konfigurationsdatei](#konfigurationsdatei)
- [Service-Konfiguration](#service-konfiguration)
- [Adapter-Konfiguration](#adapter-konfiguration)
- [Authentifizierung](#authentifizierung)
- [Environment-Variablen](#environment-variablen)
- [Beispiele](#beispiele)
- [Validierung](#validierung)
- [Troubleshooting](#troubleshooting)

## 🎯 Übersicht

Labora verwendet eine YAML-basierte Konfiguration mit folgenden Hauptbereichen:

- **Allgemeine Einstellungen**: Titel, Beschreibung, Theme
- **Authentifizierung**: Auth-Modi und Credentials
- **Gruppen**: Service-Kategorien
- **Services**: Service-Definitionen mit Adaptern
- **Discovery**: Netzwerk-Service-Discovery

## 📄 Konfigurationsdatei

### Dateistruktur

```
config/
├── config.yml          # Hauptkonfiguration
├── config.example.yml  # Beispielkonfiguration
└── config.backup.yml   # Backup (automatisch)
```

### Basis-Konfiguration

```yaml
# Allgemeine Einstellungen
title: "Labora"
description: "Homelab Dashboard - Übersicht Dienste & Status"
theme: "system"  # light | dark | system

# Authentifizierung
auth:
  enabled: false
  jwt_secret: "your-jwt-secret"  # Optional

# Gruppen
groups:
  - name: "Core"
    icon: "Server"
    order: 0
  - name: "Netzwerk"
    icon: "Globe"
    order: 1
  - name: "Apps"
    icon: "Boxes"
    order: 2

# Services
services: []

# Discovery
discovery:
  enabled: true
  cidr: ["10.0.10.0/24", "10.0.20.0/24"]
  http_ports: [80, 443, 3000, 8080, 9000]
  ping_timeout_ms: 600
```

## 🔧 Service-Konfiguration

### Service-Schema

```yaml
services:
  - id: "unique-service-id"           # Eindeutige ID
    type: "service-type"              # Service-Typ (Preset)
    instanceId: "instance-name"       # Instanz-Name
    name: "Service Name"              # Anzeigename
    url: "https://service.example.com" # Service-URL
    icon: "Server"                    # Icon-Name
    group: "Core"                     # Gruppenname
    tags: ["tag1", "tag2"]           # Tags
    vlan: 10                         # VLAN-Nummer (optional)
    description: "Service description" # Beschreibung (optional)
    
    # Template-Konfiguration
    template:
      preset: "foundation"           # foundation | enhanced
      fields: {}                     # Zusätzliche Felder
    
    # Health Checks und Adapter
    checks:
      ping:                          # Ping-Check
        enabled: true
        host: "service.example.com"
        intervalSec: 30
      
      http:                          # HTTP-Check
        enabled: true
        url: "https://service.example.com/health"
        expectStatus: 200
        intervalSec: 30
      
      adapters:                      # API-Adapter
        proxmox:
          enabled: true
          baseUrl: "https://proxmox.lan:8006"
          tokenId: "${PROXMOX_TOKEN_ID}"
          tokenSecret: "${PROXMOX_TOKEN_SECRET}"
    
    # Authentifizierung
    auth:
      mode: "none"                   # none | basic | jwt | header_forward
      basic:                         # Basic Auth
        username: "admin"
        password: "${SERVICE_PASSWORD}"
      jwt:                           # JWT Token
        token: "${JWT_TOKEN}"
      header_forward:                # Header Forward
        headerName: "X-Forwarded-User"
    
    # UI-Einstellungen
    favorite: false                  # Als Favorit markieren
    hidden: false                    # Service verstecken
    order: 0                         # Reihenfolge
```

### Service-Typen (Presets)

#### **Infrastructure & Management**

```yaml
# Proxmox VE
- type: "proxmox"
  checks:
    adapters:
      proxmox:
        enabled: true
        baseUrl: "https://proxmox.lan:8006"
        tokenId: "${PROXMOX_TOKEN_ID}"
        tokenSecret: "${PROXMOX_TOKEN_SECRET}"

# Portainer
- type: "portainer"
  checks:
    adapters:
      portainer:
        enabled: true
        baseUrl: "http://portainer.lan:9000"
        apiKey: "${PORTAINER_API_KEY}"

# Grafana
- type: "grafana"
  checks:
    adapters:
      grafana:
        enabled: true
        baseUrl: "http://grafana.lan:3000"
        apiKey: "${GRAFANA_API_KEY}"
```

#### **Network & Security**

```yaml
# pfSense
- type: "pfsense"
  checks:
    adapters:
      pfsense:
        enabled: true
        baseUrl: "https://pfsense.lan"
        apiKey: "${PFSENSE_API_KEY}"
        apiSecret: "${PFSENSE_API_SECRET}"

# AdGuard Home
- type: "adguard"
  checks:
    adapters:
      adguard:
        enabled: true
        baseUrl: "http://adguard.lan"
        username: "${ADGUARD_USERNAME}"
        password: "${ADGUARD_PASSWORD}"

# Pi-hole
- type: "pihole"
  checks:
    adapters:
      pihole:
        enabled: true
        baseUrl: "http://pihole.lan/admin"
        token: "${PIHOLE_TOKEN}"
        version: "v5"  # v5 | v6

# Nginx Proxy Manager
- type: "npm"
  checks:
    adapters:
      npm:
        enabled: true
        baseUrl: "http://npm.lan:81"
        token: "${NPM_TOKEN}"
```

#### **Media & Download**

```yaml
# Jellyfin
- type: "jellyfin"
  checks:
    adapters:
      jellyfin:
        enabled: true
        baseUrl: "http://jellyfin.lan:8096"
        apiKey: "${JELLYFIN_API_KEY}"

# Sonarr
- type: "sonarr"
  checks:
    adapters:
      sonarr:
        enabled: true
        baseUrl: "http://sonarr.lan:8989"
        apiKey: "${SONARR_API_KEY}"

# qBittorrent
- type: "qbittorrent"
  checks:
    adapters:
      qbittorrent:
        enabled: true
        baseUrl: "http://qbittorrent.lan:8080"
        username: "${QBITTORRENT_USERNAME}"
        password: "${QBITTORRENT_PASSWORD}"
```

#### **Monitoring**

```yaml
# Uptime Kuma
- type: "uptimekuma"
  checks:
    adapters:
      uptimekuma:
        enabled: true
        baseUrl: "http://uptime.lan:3001"
        apiKey: "${UPTIMEKUMA_API_KEY}"

# Netdata
- type: "netdata"
  checks:
    adapters:
      netdata:
        enabled: true
        baseUrl: "http://netdata.lan:19999"
```

## 🔌 Adapter-Konfiguration

### Adapter-Typen

#### **Proxmox Adapter**

```yaml
proxmox:
  enabled: true
  baseUrl: "https://proxmox.lan:8006"
  tokenId: "dashboard@pve!readonly"
  tokenSecret: "your-token-secret"
```

**Daten:**
- Node-Status und Ressourcenverbrauch
- VM-Übersicht mit Top 3 nach CPU-Verbrauch
- Automatische Aktualisierung alle 30 Sekunden

#### **AdGuard Adapter**

```yaml
adguard:
  enabled: true
  baseUrl: "http://adguard.lan"
  username: "admin"
  password: "your-password"
```

**Daten:**
- DNS-Statistiken des aktuellen Tages
- Block-Rate und Top blockierte Domains
- Automatische Aktualisierung alle 30 Sekunden

#### **Pi-hole Adapter**

```yaml
pihole:
  enabled: true
  baseUrl: "http://pihole.lan/admin"
  token: "your-api-token"
  version: "v5"  # v5 | v6
```

**Daten:**
- DNS-Statistiken des aktuellen Tages
- Block-Rate und Top blockierte Domains
- Automatische Aktualisierung alle 30 Sekunden

#### **NPM Adapter**

```yaml
npm:
  enabled: true
  baseUrl: "http://npm.lan:81"
  token: "your-api-token"
```

**Daten:**
- Anzahl aktiver Proxy-Hosts
- SSL-Zertifikat-Status und Ablaufzeiten
- Automatische Aktualisierung alle 5 Minuten

#### **Portainer Adapter**

```yaml
portainer:
  enabled: true
  baseUrl: "http://portainer.lan:9000"
  apiKey: "your-api-key"
```

**Daten:**
- Container-Anzahl und Status
- Images, Volumes, Networks
- Automatische Aktualisierung alle 30 Sekunden

#### **Jellyfin Adapter**

```yaml
jellyfin:
  enabled: true
  baseUrl: "http://jellyfin.lan:8096"
  apiKey: "your-api-key"
```

**Daten:**
- Benutzer-Anzahl
- Filme, Serien, Episoden
- Automatische Aktualisierung alle 5 Minuten

#### **Sonarr Adapter**

```yaml
sonarr:
  enabled: true
  baseUrl: "http://sonarr.lan:8989"
  apiKey: "your-api-key"
```

**Daten:**
- Serien-Anzahl
- Episoden und Queue
- Warnings
- Automatische Aktualisierung alle 5 Minuten

#### **Uptime Kuma Adapter**

```yaml
uptimekuma:
  enabled: true
  baseUrl: "http://uptime.lan:3001"
  apiKey: "your-api-key"
```

**Daten:**
- Monitor-Anzahl
- Status (up/down/maintenance)
- Automatische Aktualisierung jede Minute

### Health Checks

#### **Ping Check**

```yaml
ping:
  enabled: true
  host: "service.example.com"
  intervalSec: 30
```

#### **HTTP Check**

```yaml
http:
  enabled: true
  url: "https://service.example.com/health"
  expectStatus: 200
  intervalSec: 30
```

## 🔒 Authentifizierung

### Authentifizierungsmodi

#### **1. Keine Authentifizierung**

```yaml
auth:
  mode: "none"
```

#### **2. Basic Authentication**

```yaml
auth:
  mode: "basic"
  basic:
    username: "admin"
    password: "${SERVICE_PASSWORD}"
```

#### **3. JWT Token**

```yaml
auth:
  mode: "jwt"
  jwt:
    token: "${JWT_TOKEN}"
```

#### **4. Header Forward (Authelia/NPM)**

```yaml
auth:
  mode: "header_forward"
  header_forward:
    headerName: "X-Forwarded-User"
```

### Authelia Integration

```yaml
# Nginx Proxy Manager Konfiguration
auth:
  mode: "header_forward"
  header_forward:
    headerName: "X-Forwarded-User"

# Authelia Headers
X-Forwarded-User: username
X-Forwarded-Email: user@example.com
X-Forwarded-Groups: admin,users
```

## 🌍 Environment-Variablen

### Unterstützte Formate

Labora unterstützt verschiedene Environment-Variable-Formate:

```bash
# Standard Format
PROXMOX_BASE_URL=https://proxmox.lan:8006
PROXMOX_TOKEN_ID=dashboard@pve!readonly
PROXMOX_TOKEN_SECRET=your-token-secret
```

```yaml
# In der Konfiguration verwenden
baseUrl: ${PROXMOX_BASE_URL}
tokenId: ${PROXMOX_TOKEN_ID}
tokenSecret: ${PROXMOX_TOKEN_SECRET}

# Alternative Formate
baseUrl: env:PROXMOX_BASE_URL
tokenId: $PROXMOX_TOKEN_ID
```

### Vollständige Environment-Variable-Liste

```bash
# Basis-Konfiguration
NODE_ENV=production
CONFIG_PATH=/config/config.yml
PORT=3000
HOSTNAME=0.0.0.0
LOG_LEVEL=info

# Proxmox
PROXMOX_BASE_URL=https://proxmox.lan:8006
PROXMOX_TOKEN_ID=dashboard@pve!readonly
PROXMOX_TOKEN_SECRET=your-token-secret

# pfSense
PFSENSE_BASE_URL=https://pfsense.lan
PFSENSE_API_KEY=your-api-key
PFSENSE_API_SECRET=your-api-secret

# AdGuard Home
ADGUARD_BASE_URL=http://10.0.20.103
ADGUARD_USERNAME=admin
ADGUARD_PASSWORD=your-password

# Pi-hole
PIHOLE_BASE_URL=http://10.0.40.104/admin
PIHOLE_TOKEN=your-pihole-token

# Nginx Proxy Manager
NPM_BASE_URL=http://10.0.20.102
NPM_TOKEN=your-npm-token

# Portainer
PORTAINER_BASE_URL=http://10.0.20.101:9000
PORTAINER_API_KEY=your-portainer-api-key

# Grafana
GRAFANA_BASE_URL=http://10.0.20.100:3000
GRAFANA_API_KEY=your-grafana-api-key

# Jellyfin
JELLYFIN_BASE_URL=http://10.0.20.50:8096
JELLYFIN_API_KEY=your-jellyfin-api-key

# Sonarr
SONARR_BASE_URL=http://10.0.20.60:8989
SONARR_API_KEY=your-sonarr-api-key

# Uptime Kuma
UPTIMEKUMA_BASE_URL=http://10.0.20.70:3001
UPTIMEKUMA_API_KEY=your-uptimekuma-api-key
```

## 📝 Beispiele

### Vollständige Konfiguration

```yaml
title: "Nucleus"
description: "Homelab Dashboard - Übersicht Dienste & Status"
theme: "system"
auth:
  enabled: false

groups:
  - name: "Infra"
    icon: "Server"
    order: 0
  - name: "Netzwerk"
    icon: "Globe"
    order: 1
  - name: "Medien"
    icon: "Play"
    order: 2
  - name: "Monitoring"
    icon: "Activity"
    order: 3

services:
  # Proxmox
  - id: "proxmox-main"
    type: "proxmox"
    instanceId: "main"
    name: "Proxmox"
    url: "https://proxmox.lan:8006"
    icon: "Server"
    group: "Infra"
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

  # pfSense
  - id: "pfsense-edge"
    type: "pfsense"
    instanceId: "edge"
    name: "pfSense"
    url: "https://pfsense.lan"
    icon: "Shield"
    group: "Netzwerk"
    tags: ["firewall", "router"]
    vlan: 10
    checks:
      ping:
        enabled: true
        host: "pfsense.lan"
        intervalSec: 30
      adapters:
        pfsense:
          enabled: false  # Aktivieren wenn API-Key gesetzt
          baseUrl: "https://pfsense.lan"
          apiKey: "${PFSENSE_API_KEY}"
          apiSecret: "${PFSENSE_API_SECRET}"
    auth:
      mode: "none"
    order: 1

  # AdGuard Home
  - id: "adguard-dns1"
    type: "adguard"
    instanceId: "dns1"
    name: "AdGuard Home"
    url: "http://10.0.20.103"
    icon: "Filter"
    group: "Netzwerk"
    tags: ["dns", "adblock"]
    vlan: 20
    checks:
      adapters:
        adguard:
          enabled: true
          baseUrl: "http://10.0.20.103"
          username: "${ADGUARD_USERNAME}"
          password: "${ADGUARD_PASSWORD}"
    auth:
      mode: "none"
    order: 2

  # NPM
  - id: "npm-rp"
    type: "npm"
    instanceId: "rp"
    name: "NPM"
    url: "http://10.0.20.102"
    icon: "Globe"
    group: "Netzwerk"
    tags: ["reverse-proxy", "ssl"]
    vlan: 20
    checks:
      adapters:
        npm:
          enabled: true
          baseUrl: "http://10.0.20.102"
          token: "${NPM_TOKEN}"
    auth:
      mode: "none"
    order: 3

  # Pi-hole (Backup)
  - id: "pihole-dns2"
    type: "pihole"
    instanceId: "dns2"
    name: "Pi-hole (Backup)"
    url: "http://10.0.40.104/admin"
    icon: "Circle"
    group: "Netzwerk"
    tags: ["dns", "adblock", "backup"]
    vlan: 40
    checks:
      adapters:
        pihole:
          enabled: false
          baseUrl: "http://10.0.40.104/admin"
          token: "${PIHOLE_TOKEN}"
          version: "v5"
    auth:
      mode: "none"
    order: 4

  # qBittorrent
  - id: "qbittorrent-dl1"
    type: "qbittorrent"
    instanceId: "dl-1"
    name: "qBittorrent"
    url: "http://10.0.20.60"
    icon: "Download"
    group: "Medien"
    tags: ["torrent", "download"]
    checks:
      http:
        enabled: true
        url: "http://10.0.20.60"
        expectStatus: 200
        intervalSec: 30
    auth:
      mode: "basic"
      basic:
        username: "admin"
        password: "${QBITTORRENT_PASSWORD}"
    order: 5

  # Jellyfin
  - id: "jellyfin-media"
    type: "jellyfin"
    instanceId: "media"
    name: "Jellyfin"
    url: "http://10.0.20.50:8096"
    icon: "Play"
    group: "Medien"
    tags: ["media", "streaming"]
    checks:
      adapters:
        jellyfin:
          enabled: true
          baseUrl: "http://10.0.20.50:8096"
          apiKey: "${JELLYFIN_API_KEY}"
    auth:
      mode: "none"
    order: 6

  # Uptime Kuma
  - id: "uptimekuma-monitoring"
    type: "uptimekuma"
    instanceId: "monitoring"
    name: "Uptime Kuma"
    url: "http://10.0.20.70:3001"
    icon: "Activity"
    group: "Monitoring"
    tags: ["monitoring", "uptime"]
    checks:
      adapters:
        uptimekuma:
          enabled: true
          baseUrl: "http://10.0.20.70:3001"
          apiKey: "${UPTIMEKUMA_API_KEY}"
    auth:
      mode: "none"
    order: 7

discovery:
  enabled: true
  cidr: ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24", "10.0.40.0/24", "10.0.99.0/24"]
  http_ports: [80, 443, 3000, 8080, 9000]
  ping_timeout_ms: 600
```

### Mehrfach-Instanzen

```yaml
services:
  # Proxmox Main
  - id: "proxmox-main"
    type: "proxmox"
    instanceId: "main"
    name: "Proxmox Main"
    url: "https://proxmox1.lan:8006"
    group: "Infra"
    checks:
      adapters:
        proxmox:
          enabled: true
          baseUrl: "https://proxmox1.lan:8006"
          tokenId: "${PROXMOX1_TOKEN_ID}"
          tokenSecret: "${PROXMOX1_TOKEN_SECRET}"

  # Proxmox Backup
  - id: "proxmox-backup"
    type: "proxmox"
    instanceId: "backup"
    name: "Proxmox Backup"
    url: "https://proxmox2.lan:8006"
    group: "Infra"
    checks:
      adapters:
        proxmox:
          enabled: true
          baseUrl: "https://proxmox2.lan:8006"
          tokenId: "${PROXMOX2_TOKEN_ID}"
          tokenSecret: "${PROXMOX2_TOKEN_SECRET}"

  # AdGuard Primary
  - id: "adguard-primary"
    type: "adguard"
    instanceId: "primary"
    name: "AdGuard Primary"
    url: "http://10.0.20.103"
    group: "Netzwerk"
    checks:
      adapters:
        adguard:
          enabled: true
          baseUrl: "http://10.0.20.103"
          username: "${ADGUARD_PRIMARY_USER}"
          password: "${ADGUARD_PRIMARY_PASS}"

  # AdGuard Secondary
  - id: "adguard-secondary"
    type: "adguard"
    instanceId: "secondary"
    name: "AdGuard Secondary"
    url: "http://10.0.20.104"
    group: "Netzwerk"
    checks:
      adapters:
        adguard:
          enabled: true
          baseUrl: "http://10.0.20.104"
          username: "${ADGUARD_SECONDARY_USER}"
          password: "${ADGUARD_SECONDARY_PASS}"
```

## ✅ Validierung

### Schema-Validierung

Labora validiert alle Konfigurationen mit Zod-Schemas:

```bash
# Konfiguration validieren
npm run validate-config

# Spezifische Validierung
npm run test -- --grep "Schema"
```

### Validierungsfehler

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "services[0].url",
      "message": "Invalid URL format"
    },
    {
      "field": "services[0].checks.adapters.proxmox.tokenSecret",
      "message": "Token secret is required when adapter is enabled"
    }
  ]
}
```

### Häufige Validierungsfehler

1. **Ungültige URL**: URL muss gültiges Format haben
2. **Fehlende Credentials**: Adapter aktiviert aber keine Credentials
3. **Duplikate IDs**: Service-IDs müssen eindeutig sein
4. **Ungültige VLAN**: VLAN muss positive Zahl sein
5. **Fehlende Gruppen**: Service-Gruppe muss existieren

## 🔧 Troubleshooting

### Konfigurationsfehler

#### **YAML-Syntax-Fehler**

```bash
# YAML validieren
python -c "import yaml; yaml.safe_load(open('config/config.yml'))"

# Oder online
# https://www.yamllint.com/
```

#### **Environment-Variablen nicht erkannt**

```bash
# Variablen prüfen
echo $PROXMOX_BASE_URL

# In Docker
docker exec labora env | grep PROXMOX
```

#### **Adapter-Fehler**

```bash
# Adapter-Konfiguration testen
curl -H "Authorization: PVEAPIToken=..." https://proxmox.lan:8006/api2/json/version

# Logs prüfen
docker logs labora | grep "Adapter"
```

### Debug-Modus

```bash
# Debug-Logs aktivieren
export DEBUG=labora:*
export LOG_LEVEL=debug

# Oder in .env
DEBUG=labora:*
LOG_LEVEL=debug
```

### Konfiguration zurücksetzen

```bash
# Backup wiederherstellen
cp config/config.backup.yml config/config.yml

# Standard-Konfiguration laden
npm run reset-config
```

---

**Für weitere Hilfe konsultieren Sie die [Hauptdokumentation](README.md) oder erstellen Sie ein [Issue](https://github.com/dandulox/homlab-tracker/issues).**
