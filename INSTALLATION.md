# Labora Installation

## 🚀 Schnellstart

### Option 1: Lokale Installation (Empfohlen)

```bash
# Repository klonen
git clone https://github.com/your-username/labora.git
cd labora

# Starten
chmod +x start-labora.sh
./start-labora.sh
```

### Option 2: Docker Compose (Einfach)

```bash
# Repository klonen
git clone https://github.com/your-username/labora.git
cd labora

# Starten
docker-compose -f docker-compose.simple.yml up -d
```

### Option 3: Docker Compose (Produktion)

```bash
# Repository klonen
git clone https://github.com/your-username/labora.git
cd labora

# Konfiguration anpassen
cp env.example .env
# Bearbeite .env mit deinen API-Credentials

# Starten
docker-compose up -d
```

## 📋 Voraussetzungen

- **Node.js**: Version 18 oder höher
- **Docker**: Version 20 oder höher (für Docker-Installation)
- **Docker Compose**: Version 2 oder höher (für Docker-Installation)

## 🔧 Konfiguration

### Umgebungsvariablen

Kopiere `env.example` zu `.env` und passe die Werte an:

```bash
cp env.example .env
```

### Widget-APIs (Optional)

Für die Widget-Funktionalität müssen entsprechende API-Credentials gesetzt werden:

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

## 🌐 Zugriff

Nach dem Start ist Labora verfügbar unter:

- **Dashboard**: http://localhost:3000
- **Admin-Interface**: http://localhost:3000/admin

## 🐳 Docker-Volumes

Das Docker-Setup verwendet folgende Volumes:

- `./config:/config:ro` - Konfigurationsdateien (read-only)
- `labora-config:/app/config` - App-interne Konfiguration

## 🔍 Troubleshooting

### Build-Fehler

Falls der Docker-Build fehlschlägt:

1. **Cache leeren**:
   ```bash
   docker system prune -a
   ```

2. **Einfache Docker-Compose verwenden**:
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **Lokale Installation**:
   ```bash
   ./start-labora.sh
   ```

### Port bereits belegt

Falls Port 3000 bereits belegt ist, ändere den Port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Ändere 3001 zu einem freien Port
```

### Konfigurationsfehler

Falls die Konfiguration nicht geladen wird:

1. Überprüfe die `config/config.yml` Datei
2. Stelle sicher, dass die Datei gültiges YAML ist
3. Überprüfe die Dateiberechtigungen

## 📞 Support

Bei Problemen:

1. Überprüfe die [Issues](https://github.com/your-username/labora/issues)
2. Erstelle ein neues Issue mit detaillierter Beschreibung
3. Für Diskussionen nutze die [Discussions](https://github.com/your-username/labora/discussions)