# Labora Dokumentation

Willkommen zur Labora-Dokumentation! Diese Dokumentation hilft Ihnen dabei, Labora zu installieren, zu konfigurieren und zu verwenden.

## 📚 Dokumentationsübersicht

### 🚀 [Installation](INSTALLATION.md)
- Docker-Installation
- LXC Container Setup
- Lokale Entwicklung
- Erste Schritte
- Troubleshooting

### ⚙️ [Konfiguration](CONFIGURATION.md)
- Konfigurationsdatei
- Service-Presets
- API-Adapter
- Authentifizierung
- Environment-Variablen

### 🔌 [API-Referenz](API.md)
- REST-API-Endpunkte
- Authentifizierung
- Widget-APIs
- Health Checks
- Service Discovery

### 🛠️ [Entwicklung](DEVELOPMENT.md)
- Entwicklungsumgebung
- Projektstruktur
- Code-Standards
- Testing
- Build-Prozess

## 🎯 Schnellstart

### 1. Installation

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Mit Docker starten
docker-compose up -d

# Dashboard öffnen
open http://localhost:3000
```

### 2. Erste Konfiguration

1. Gehen Sie zu `/admin`
2. Fügen Sie Ihren ersten Service hinzu
3. Konfigurieren Sie API-Adapter
4. Speichern Sie die Konfiguration

### 3. Services hinzufügen

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

## 🔧 Verfügbare Presets

### Infrastructure & Management
- **Proxmox VE**: Virtualisierungsplattform
- **Portainer**: Docker Container Management
- **Grafana**: Monitoring und Visualisierung
- **Prometheus**: Metriken-Sammlung

### Network & Security
- **pfSense/OPNsense**: Firewall und Router
- **AdGuard Home**: DNS-basierte Werbeblockierung
- **Pi-hole**: DNS-basierte Werbeblockierung
- **Nginx Proxy Manager**: Reverse Proxy mit SSL

### Media & Download
- **Jellyfin**: Media Server
- **Sonarr**: TV Show Management
- **Radarr**: Movie Management
- **qBittorrent**: BitTorrent Client

### Files & Sync
- **Nextcloud**: Cloud Storage
- **Syncthing**: File Synchronization

### Monitoring
- **Uptime Kuma**: Uptime Monitoring
- **Netdata**: Real-time System Monitoring

### Home & IoT
- **Home Assistant**: Smart Home Automation

## 🆘 Hilfe

### Häufige Probleme

#### **Service nicht erreichbar**
- Prüfen Sie die URL und Netzwerkverbindung
- Überprüfen Sie Firewall-Einstellungen
- Testen Sie die API-Credentials

#### **Adapter-Fehler**
- Überprüfen Sie Environment-Variablen
- Prüfen Sie API-Credentials
- Schauen Sie in die Logs

#### **Konfigurationsfehler**
- Validieren Sie die YAML-Syntax
- Überprüfen Sie die Schema-Validierung
- Prüfen Sie Environment-Variablen

### Support erhalten

1. **Dokumentation durchsuchen**: Verwenden Sie die Suchfunktion
2. **Issues durchsuchen**: Schauen Sie in die [GitHub Issues](https://github.com/dandulox/homlab-tracker/issues)
3. **Neues Issue erstellen**: Erstellen Sie ein detailliertes Issue
4. **Discussions**: Nutzen Sie die [GitHub Discussions](https://github.com/dandulox/homlab-tracker/discussions)

### Logs sammeln

```bash
# Docker Logs
docker logs labora > labora-logs.txt

# Konfiguration
cat config/config.yml > config-backup.yml
cat .env > env-backup.txt

# System-Informationen
uname -a > system-info.txt
docker --version >> system-info.txt
```

## 📖 Weitere Ressourcen

- **GitHub Repository**: [https://github.com/dandulox/homlab-tracker](https://github.com/dandulox/homlab-tracker)
- **Issues**: [https://github.com/dandulox/homlab-tracker/issues](https://github.com/dandulox/homlab-tracker/issues)
- **Discussions**: [https://github.com/dandulox/homlab-tracker/discussions](https://github.com/dandulox/homlab-tracker/discussions)
- **Releases**: [https://github.com/dandulox/homlab-tracker/releases](https://github.com/dandulox/homlab-tracker/releases)

## 🤝 Beitragen

Wir freuen uns über Beiträge! Schauen Sie in die [Entwicklungsdokumentation](DEVELOPMENT.md) für Details.

### Quick Contribution

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe Tests
5. Erstelle einen Pull Request

---

**Viel Spaß mit Labora! 🚀**
