#!/bin/bash

# Labora Homelab Tracker - Installation Script für LXC Container (Ubuntu)
# Dieses Skript installiert und konfiguriert Labora auf einem Ubuntu LXC Container

set -e  # Beende bei Fehlern

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktion
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Labora Installation                       ║"
echo "║              Homelab Tracker für LXC Container              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Überprüfung ob als Root ausgeführt
if [[ $EUID -ne 0 ]]; then
   error "Dieses Skript muss als Root ausgeführt werden!"
   echo "Verwenden Sie: sudo $0"
   exit 1
fi

# Überprüfung der Ubuntu-Version
if ! command -v lsb_release &> /dev/null; then
    log "Installiere lsb-release..."
    apt-get update && apt-get install -y lsb-release
fi

UBUNTU_VERSION=$(lsb_release -rs)
log "Erkannte Ubuntu Version: $UBUNTU_VERSION"

# System aktualisieren
log "Aktualisiere Systempakete..."
apt-get update
apt-get upgrade -y

# Notwendige Pakete installieren
log "Installiere notwendige Systempakete..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    jq \
    htop \
    nano \
    ufw

# Docker installieren
log "Installiere Docker..."
if ! command -v docker &> /dev/null; then
    # Docker GPG Key hinzufügen
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Docker Repository hinzufügen
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Pakete aktualisieren und Docker installieren
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Docker Service starten und aktivieren
    systemctl start docker
    systemctl enable docker
    
    success "Docker erfolgreich installiert"
else
    log "Docker ist bereits installiert"
fi

# Docker Compose installieren (falls nicht vorhanden)
if ! docker compose version &> /dev/null; then
    log "Installiere Docker Compose..."
    apt-get install -y docker-compose-plugin
    success "Docker Compose erfolgreich installiert"
else
    log "Docker Compose ist bereits installiert"
fi

# Labora Verzeichnis erstellen
LABORA_DIR="/opt/labora"
log "Erstelle Labora Verzeichnis: $LABORA_DIR"
mkdir -p "$LABORA_DIR"
cd "$LABORA_DIR"

# Git Repository klonen oder aktualisieren
if [ -d ".git" ]; then
    log "Aktualisiere Labora Repository..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main
    success "Repository erfolgreich aktualisiert"
else
    log "Klone Labora Repository..."
    git clone https://github.com/dandulox/homlab-tracker.git .
    success "Repository erfolgreich geklont"
fi

# Überprüfung ob notwendige Dateien vorhanden sind
REQUIRED_FILES=("docker-compose.yml" "Dockerfile" "package.json" "config/config.yml")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Erforderliche Datei fehlt: $file"
        error "Bitte stellen Sie sicher, dass alle Projektdateien in $LABORA_DIR vorhanden sind"
        exit 1
    fi
done

# Berechtigungen setzen
log "Setze Dateiberechtigungen..."
chmod +x *.sh 2>/dev/null || true
chown -R root:root "$LABORA_DIR"
chmod -R 755 "$LABORA_DIR"

# Docker Images pullen (mit Überschreibung)
log "Lade Docker Images herunter..."
docker compose pull --ignore-pull-failures

# Bestehende Container stoppen und entfernen
log "Stoppe und entferne bestehende Container..."
docker compose down --remove-orphans 2>/dev/null || true

# Bestehende Images entfernen (um sicherzustellen, dass neue Versionen verwendet werden)
log "Entferne alte Docker Images..."
docker image prune -f
docker system prune -f

# Container neu erstellen und starten
log "Erstelle und starte Labora Container..."
docker compose up -d --build --force-recreate

# Warten bis Container gestartet ist
log "Warte auf Container-Start..."
sleep 10

# Health Check
log "Führe Health Check durch..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        success "Labora ist erfolgreich gestartet und erreichbar!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log "Health Check $RETRY_COUNT/$MAX_RETRIES - Warte 5 Sekunden..."
        sleep 5
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Labora konnte nicht gestartet werden. Überprüfen Sie die Logs:"
    docker compose logs
    exit 1
fi

# Firewall konfigurieren
log "Konfiguriere Firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Labora
ufw allow 80/tcp    # HTTP (falls später benötigt)
ufw allow 443/tcp   # HTTPS (falls später benötigt)

# Systemd Service erstellen (optional)
log "Erstelle Systemd Service..."
cat > /etc/systemd/system/labora.service << EOF
[Unit]
Description=Labora Homelab Tracker
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$LABORA_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable labora.service

# Status anzeigen
log "Aktueller Status:"
docker compose ps

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Installation Abgeschlossen!              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

success "Labora wurde erfolgreich installiert!"
echo ""
echo -e "${BLUE}Zugriff:${NC}"
echo "  Web-Interface: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Health Check:  http://$(hostname -I | awk '{print $1}'):3000/api/health"
echo ""
echo -e "${BLUE}Nützliche Befehle:${NC}"
echo "  Status anzeigen:    docker compose ps"
echo "  Logs anzeigen:      docker compose logs -f"
echo "  Container stoppen:  docker compose down"
echo "  Container starten:  docker compose up -d"
echo "  Service verwalten:  systemctl start/stop/restart labora"
echo ""
echo -e "${BLUE}Konfiguration:${NC}"
echo "  Config-Datei:       $LABORA_DIR/config/config.yml"
echo "  Logs:               docker compose logs"
echo ""

# Automatische Updates einrichten (optional)
log "Richte automatische Updates ein..."
cat > /usr/local/bin/labora-update.sh << 'EOF'
#!/bin/bash
cd /opt/labora
git fetch --all
git reset --hard origin/main
git pull origin main
docker compose pull
docker compose up -d --build --force-recreate
docker system prune -f
EOF

chmod +x /usr/local/bin/labora-update.sh

# Cron Job für wöchentliche Updates
(crontab -l 2>/dev/null; echo "0 2 * * 0 /usr/local/bin/labora-update.sh >> /var/log/labora-update.log 2>&1") | crontab -

success "Automatische Updates eingerichtet (jeden Sonntag um 2:00 Uhr)"

echo -e "${GREEN}Installation erfolgreich abgeschlossen!${NC}"
