# Installation Guide

Diese Anleitung führt Sie durch die Installation von Labora auf verschiedenen Plattformen.

## 📋 Inhaltsverzeichnis

- [Voraussetzungen](#voraussetzungen)
- [Docker Installation](#docker-installation)
- [LXC Container Installation](#lxc-container-installation)
- [Lokale Installation](#lokale-installation)
- [Konfiguration](#konfiguration)
- [Erste Schritte](#erste-schritte)
- [Troubleshooting](#troubleshooting)

## 🔧 Voraussetzungen

### System-Anforderungen

- **RAM**: Mindestens 2GB (4GB empfohlen)
- **Speicher**: Mindestens 10GB freier Speicherplatz
- **CPU**: 1 Core (2 Cores empfohlen)
- **Netzwerk**: Internetverbindung für Dependencies

### Software-Anforderungen

#### Für Docker-Installation
- **Docker**: 20.x oder höher
- **Docker Compose**: 2.x oder höher

#### Für LXC Container
- **LXC Container**: Ubuntu 20.04+ oder Debian 11+
- **Root-Zugriff**: Erforderlich für Installation

#### Für lokale Installation
- **Node.js**: 18.x oder höher
- **npm**: 9.x oder höher
- **Git**: Für Repository-Klonen

## 🐳 Docker Installation

### Schnellstart

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Konfiguration anpassen
cp env.example .env
# Bearbeite .env mit deinen API-Credentials

# Starten
docker-compose up -d

# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f
```

### Erweiterte Docker-Konfiguration

#### Custom Docker Compose

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
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - CONFIG_PATH=/config/config.yml
      - LOG_LEVEL=info
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
      start_period: 40s

volumes:
  labora-config:

networks:
  labora:
    driver: bridge
```

#### Docker Image bauen

```bash
# Image bauen
docker build -t labora:latest .

# Mit Tags
docker build -t labora:2.0.0 -t labora:latest .

# Image testen
docker run --rm -p 3000:3000 labora:latest
```

### Docker-Verwaltung

```bash
# Container starten
docker-compose up -d

# Container stoppen
docker-compose down

# Container neu starten
docker-compose restart

# Logs anzeigen
docker-compose logs -f labora

# In Container einsteigen
docker-compose exec labora sh

# Container aktualisieren
docker-compose pull
docker-compose up -d --build
```

## 🖥️ LXC Container Installation

### Automatische Installation

Verwenden Sie das bereitgestellte Installationsskript:

```bash
# Skript herunterladen
wget https://raw.githubusercontent.com/dandulox/homlab-tracker/main/install-labora.sh

# Berechtigungen setzen
chmod +x install-labora.sh

# Installation starten
sudo ./install-labora.sh
```

### Manuelle Installation

#### 1. System vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Notwendige Pakete installieren
sudo apt install -y curl wget git unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release jq htop nano ufw
```

#### 2. Docker installieren

```bash
# Docker GPG Key hinzufügen
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker Repository hinzufügen
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Pakete aktualisieren und Docker installieren
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker Service starten und aktivieren
sudo systemctl start docker
sudo systemctl enable docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

#### 3. Labora installieren

```bash
# Verzeichnis erstellen
sudo mkdir -p /opt/labora
cd /opt/labora

# Repository klonen
sudo git clone https://github.com/dandulox/homlab-tracker.git .

# Berechtigungen setzen
sudo chown -R $USER:$USER /opt/labora
chmod +x *.sh

# Konfiguration anpassen
cp env.example .env
nano .env
```

#### 4. Systemd Service erstellen

```bash
# Service-Datei erstellen
sudo tee /etc/systemd/system/labora.service > /dev/null <<EOF
[Unit]
Description=Labora Homelab Tracker
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/labora
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable labora.service
```

#### 5. Firewall konfigurieren

```bash
# Firewall aktivieren
sudo ufw --force enable

# Ports öffnen
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Labora
sudo ufw allow 80/tcp    # HTTP (optional)
sudo ufw allow 443/tcp   # HTTPS (optional)

# Status prüfen
sudo ufw status
```

## 💻 Lokale Installation

### Node.js installieren

#### Mit Node Version Manager (nvm)

```bash
# nvm installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Shell neu laden
source ~/.bashrc

# Node.js installieren
nvm install 18
nvm use 18
nvm alias default 18
```

#### Direkte Installation

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS
brew install node@18
```

### Labora installieren

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Dependencies installieren
npm install

# Konfiguration anpassen
cp env.example .env
# Bearbeite .env

# Entwicklungsserver starten
npm run dev

# Oder für Produktion
npm run build
npm start
```

## ⚙️ Konfiguration

### Environment-Variablen

Erstellen Sie eine `.env`-Datei:

```bash
# Basis-Konfiguration
NODE_ENV=production
CONFIG_PATH=/config/config.yml
PORT=3000
HOSTNAME=0.0.0.0

# Logging
LOG_LEVEL=info

# Widget API credentials
PROXMOX_BASE_URL=https://proxmox.lan:8006
PROXMOX_TOKEN_ID=dashboard@pve!readonly
PROXMOX_TOKEN_SECRET=your-token-secret

PFSENSE_BASE_URL=https://pfsense.lan
PFSENSE_API_KEY=your-api-key
PFSENSE_API_SECRET=your-api-secret

ADGUARD_BASE_URL=http://10.0.20.103
ADGUARD_USERNAME=admin
ADGUARD_PASSWORD=your-password

NPM_BASE_URL=http://10.0.20.102
NPM_TOKEN=your-npm-token

PIHOLE_BASE_URL=http://10.0.40.104/admin
PIHOLE_TOKEN=your-pihole-token

PORTAINER_BASE_URL=http://10.0.20.101:9000
PORTAINER_API_KEY=your-portainer-api-key

GRAFANA_BASE_URL=http://10.0.20.100:3000
GRAFANA_API_KEY=your-grafana-api-key

JELLYFIN_BASE_URL=http://10.0.20.50:8096
JELLYFIN_API_KEY=your-jellyfin-api-key

SONARR_BASE_URL=http://10.0.20.60:8989
SONARR_API_KEY=your-sonarr-api-key

UPTIMEKUMA_BASE_URL=http://10.0.20.70:3001
UPTIMEKUMA_API_KEY=your-uptimekuma-api-key
```

### Konfigurationsdatei

Erstellen Sie `config/config.yml`:

```yaml
title: "Labora"
description: "Homelab Dashboard - Übersicht Dienste & Status"
theme: "system"
auth:
  enabled: false

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
    order: 1

discovery:
  enabled: true
  cidr: ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24", "10.0.40.0/24"]
  http_ports: [80, 443, 3000, 8080, 9000]
  ping_timeout_ms: 600
```

## 🚀 Erste Schritte

### 1. Installation testen

```bash
# Health Check
curl -f http://localhost:3000/api/health

# Dashboard öffnen
open http://localhost:3000
```

### 2. Admin-Interface aufrufen

```bash
# Admin-Interface öffnen
open http://localhost:3000/admin
```

### 3. Ersten Service hinzufügen

1. Gehen Sie zu `/admin`
2. Klicken Sie auf "Service hinzufügen"
3. Wählen Sie einen Preset (z.B. "Proxmox VE")
4. Füllen Sie die Konfiguration aus
5. Speichern Sie den Service

### 4. API-Adapter konfigurieren

1. Bearbeiten Sie den Service
2. Gehen Sie zum Tab "Adapter"
3. Aktivieren Sie den gewünschten Adapter
4. Füllen Sie die API-Credentials aus
5. Testen Sie die Verbindung

### 5. Dashboard anpassen

1. Gehen Sie zu `/admin`
2. Passen Sie Titel und Beschreibung an
3. Konfigurieren Sie Gruppen
4. Aktivieren Sie Widgets

## 🔧 Troubleshooting

### Häufige Probleme

#### **Port bereits belegt**

```bash
# Prüfen welcher Prozess Port 3000 verwendet
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000

# Port ändern
export PORT=3001
```

#### **Docker-Probleme**

```bash
# Docker Service neu starten
sudo systemctl restart docker

# Container-Logs prüfen
docker logs labora

# Container neu erstellen
docker-compose down
docker-compose up -d --build
```

#### **Permission-Probleme**

```bash
# Berechtigungen korrigieren
sudo chown -R $USER:$USER /opt/labora
chmod +x /opt/labora/*.sh
```

#### **Environment-Variablen nicht erkannt**

```bash
# .env-Datei prüfen
cat .env

# Environment-Variablen testen
echo $PROXMOX_BASE_URL

# Container mit Environment-Variablen starten
docker run -e PROXMOX_BASE_URL=https://proxmox.lan:8006 labora
```

#### **API-Verbindungsfehler**

```bash
# API-Endpunkt testen
curl -k https://proxmox.lan:8006/api2/json/version

# Firewall prüfen
sudo ufw status

# Netzwerk-Konnektivität testen
ping proxmox.lan
telnet proxmox.lan 8006
```

### Logs analysieren

#### **Application Logs**

```bash
# Docker Logs
docker logs -f labora

# Systemd Logs
journalctl -u labora -f

# Application Logs
tail -f /opt/labora/logs/labora.log
```

#### **Debug-Modus aktivieren**

```bash
# Environment-Variable setzen
export DEBUG=labora:*

# Oder in .env
DEBUG=labora:*
LOG_LEVEL=debug
```

### Performance-Optimierung

#### **Ressourcen überwachen**

```bash
# CPU und RAM
htop

# Docker-Container
docker stats labora

# Disk-Usage
df -h
du -sh /opt/labora
```

#### **Caching optimieren**

```bash
# Docker-Volumes prüfen
docker volume ls
docker volume inspect labora-config

# Cache leeren
docker system prune -f
```

### Backup und Wiederherstellung

#### **Konfiguration sichern**

```bash
# Backup erstellen
tar -czf labora-backup-$(date +%Y%m%d).tar.gz \
    /opt/labora/config \
    /opt/labora/.env \
    /opt/labora/docker-compose.yml

# Backup wiederherstellen
tar -xzf labora-backup-20240101.tar.gz -C /
```

#### **Docker-Volumes sichern**

```bash
# Volume-Backup
docker run --rm -v labora-config:/data -v $(pwd):/backup alpine \
    tar czf /backup/labora-config-backup.tar.gz -C /data .

# Volume-Wiederherstellung
docker run --rm -v labora-config:/data -v $(pwd):/backup alpine \
    tar xzf /backup/labora-config-backup.tar.gz -C /data
```

### Support erhalten

#### **Logs sammeln**

```bash
# System-Informationen
uname -a
docker --version
docker-compose --version

# Labora-Status
docker-compose ps
docker logs labora > labora-logs.txt

# Konfiguration
cat config/config.yml > config-backup.yml
cat .env > env-backup.txt
```

#### **Issue erstellen**

Erstellen Sie ein Issue auf GitHub mit:

1. **Beschreibung** des Problems
2. **Schritte zur Reproduktion**
3. **Erwartetes vs. tatsächliches Verhalten**
4. **System-Informationen** (OS, Docker-Version, etc.)
5. **Logs** (anonymisiert)
6. **Konfiguration** (ohne Secrets)

---

**Bei weiteren Fragen konsultieren Sie die [Hauptdokumentation](README.md) oder erstellen Sie ein [Issue](https://github.com/dandulox/homlab-tracker/issues).**
