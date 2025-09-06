# Labora Installation für LXC Container (Ubuntu)

Dieses Verzeichnis enthält Installations- und Wartungsskripte für Labora auf einem LXC Container mit Ubuntu.

## Verfügbare Skripte

### 1. `install-labora.sh` - Vollständige Installation
Das Hauptinstallationsskript, das alle notwendigen Komponenten installiert und konfiguriert.

**Funktionen:**
- Systemaktualisierung
- Docker und Docker Compose Installation
- Labora Repository Setup
- Container-Erstellung und -Start
- Firewall-Konfiguration
- Systemd Service Einrichtung
- Automatische Updates (wöchentlich)

**Verwendung:**
```bash
sudo ./install-labora.sh
```

### 2. `update-labora.sh` - Update-Skript
Aktualisiert Labora auf die neueste Version mit automatischem Backup.

**Funktionen:**
- Backup der aktuellen Konfiguration
- Repository-Update
- Docker Images Update
- Container-Neustart
- Rollback bei Fehlern

**Verwendung:**
```bash
sudo ./update-labora.sh
```

### 3. `labora-maintenance.sh` - Wartungsskript
Interaktives Wartungstool für die tägliche Verwaltung.

**Funktionen:**
- Status-Anzeige
- Log-Viewing
- Container-Verwaltung
- System-Bereinigung
- Backup-Erstellung
- Konfigurations-Editor
- Health Checks

**Verwendung:**
```bash
sudo ./labora-maintenance.sh
```

## Voraussetzungen

- Ubuntu LXC Container
- Root-Zugriff
- Internetverbindung
- Mindestens 2GB RAM
- Mindestens 10GB freier Speicherplatz

## Installation

1. **Skripte herunterladen:**
   ```bash
   # Alle Skripte in ein Verzeichnis kopieren
   mkdir -p /tmp/labora-install
   cd /tmp/labora-install
   # Skripte von GitHub herunterladen oder manuell kopieren
   ```

   **GitHub Repository:** [https://github.com/dandulox/homlab-tracker](https://github.com/dandulox/homlab-tracker)

2. **Berechtigungen setzen:**
   ```bash
   chmod +x *.sh
   ```

3. **Installation starten:**
   ```bash
   sudo ./install-labora.sh
   ```

## Nach der Installation

### Zugriff auf Labora
- **Web-Interface:** `http://[IP-Adresse]:3000`
- **Health Check:** `http://[IP-Adresse]:3000/api/health`

### Wichtige Verzeichnisse
- **Installation:** `/opt/labora`
- **Konfiguration:** `/opt/labora/config/config.yml`
- **Backups:** `/opt/labora-backup-*`
- **Logs:** `docker-compose logs`

### Nützliche Befehle

```bash
# Status anzeigen
cd /opt/labora && docker-compose ps

# Logs anzeigen
cd /opt/labora && docker-compose logs -f

# Container neu starten
cd /opt/labora && docker-compose restart

# Service verwalten
sudo systemctl start/stop/restart labora

# Wartungstool starten
sudo /opt/labora/labora-maintenance.sh
```

## Konfiguration

Die Hauptkonfiguration befindet sich in `/opt/labora/config/config.yml`. 

**Wichtige Einstellungen:**
- `title`: Dashboard-Titel
- `auth.enabled`: Authentifizierung aktivieren/deaktivieren
- `services`: Ihre Homelab-Services
- `widgets`: Widget-Konfiguration
- `discovery`: Netzwerk-Discovery-Einstellungen

## Updates

### Automatische Updates
Das System führt automatisch jeden Sonntag um 2:00 Uhr Updates durch.

### Manuelle Updates
```bash
sudo /opt/labora/update-labora.sh
```

### Update-Skript ausführen
```bash
sudo /usr/local/bin/labora-update.sh
```

## Troubleshooting

### Container startet nicht
```bash
cd /opt/labora
docker-compose logs
docker-compose down
docker-compose up -d --build
```

### Port bereits belegt
```bash
# Prüfen welcher Prozess Port 3000 verwendet
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000
```

### Docker-Probleme
```bash
# Docker Service neu starten
sudo systemctl restart docker

# Docker System bereinigen
sudo docker system prune -f
```

### Backup wiederherstellen
```bash
# Backup-Verzeichnis finden
ls -la /opt/labora-backup-*

# Konfiguration wiederherstellen
cp -r /opt/labora-backup-[DATUM]/config/ /opt/labora/
cd /opt/labora && docker-compose restart
```

## Sicherheit

- Firewall ist standardmäßig aktiviert
- Nur notwendige Ports sind geöffnet (22, 3000, 80, 443)
- Container läuft mit eingeschränkten Rechten
- Regelmäßige automatische Updates

## Support

Bei Problemen:
1. Überprüfen Sie die Logs: `docker-compose logs`
2. Führen Sie einen Health Check durch
3. Verwenden Sie das Wartungstool
4. Erstellen Sie ein Backup vor Änderungen

## Changelog

- **v1.0.0** - Erste Version mit vollständiger Installation
- Automatische Updates
- Wartungstool
- Backup-System
