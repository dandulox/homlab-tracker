#!/bin/bash

# Labora Homelab Tracker - Update Script für LXC Container (Ubuntu)
# Dieses Skript aktualisiert Labora auf die neueste Version

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
echo "║                    Labora Update                            ║"
echo "║              Homelab Tracker Update Script                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Überprüfung ob als Root ausgeführt
if [[ $EUID -ne 0 ]]; then
   error "Dieses Skript muss als Root ausgeführt werden!"
   echo "Verwenden Sie: sudo $0"
   exit 1
fi

# Labora Verzeichnis
LABORA_DIR="/opt/labora"

# Überprüfung ob Labora installiert ist
if [ ! -d "$LABORA_DIR" ]; then
    error "Labora ist nicht in $LABORA_DIR installiert!"
    echo "Bitte führen Sie zuerst install-labora.sh aus."
    exit 1
fi

cd "$LABORA_DIR"

# Backup der aktuellen Konfiguration erstellen
log "Erstelle Backup der aktuellen Konfiguration..."
BACKUP_DIR="/opt/labora-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r config/ "$BACKUP_DIR/" 2>/dev/null || true
cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true
success "Backup erstellt in: $BACKUP_DIR"

# Git Repository aktualisieren
if [ -d ".git" ]; then
    log "Aktualisiere Labora Repository..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main
    success "Repository erfolgreich aktualisiert"
else
    error "Kein Git Repository gefunden in $LABORA_DIR"
    error "Bitte führen Sie zuerst install-labora.sh aus oder klonen Sie das Repository manuell:"
    error "git clone https://github.com/dandulox/homlab-tracker.git $LABORA_DIR"
    exit 1
fi

# Docker Images pullen (mit Überschreibung)
log "Lade neue Docker Images herunter..."
docker-compose pull --ignore-pull-failures

# Bestehende Container stoppen
log "Stoppe bestehende Container..."
docker-compose down

# Bestehende Images entfernen (um sicherzustellen, dass neue Versionen verwendet werden)
log "Entferne alte Docker Images..."
docker image prune -f
docker system prune -f

# Container neu erstellen und starten
log "Erstelle und starte Labora Container mit neuer Version..."
docker-compose up -d --build --force-recreate

# Warten bis Container gestartet ist
log "Warte auf Container-Start..."
sleep 10

# Health Check
log "Führe Health Check durch..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        success "Labora wurde erfolgreich aktualisiert und ist erreichbar!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log "Health Check $RETRY_COUNT/$MAX_RETRIES - Warte 5 Sekunden..."
        sleep 5
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Labora konnte nach dem Update nicht gestartet werden!"
    error "Stelle Backup wieder her..."
    
    # Backup wiederherstellen
    cp -r "$BACKUP_DIR/config/" ./ 2>/dev/null || true
    cp "$BACKUP_DIR/docker-compose.yml" ./ 2>/dev/null || true
    
    # Alte Version starten
    docker-compose up -d --build --force-recreate
    
    error "Backup wurde wiederhergestellt. Überprüfen Sie die Logs:"
    docker-compose logs
    exit 1
fi

# Status anzeigen
log "Aktueller Status:"
docker-compose ps

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Update Abgeschlossen!                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

success "Labora wurde erfolgreich aktualisiert!"
echo ""
echo -e "${BLUE}Zugriff:${NC}"
echo "  Web-Interface: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Health Check:  http://$(hostname -I | awk '{print $1}'):3000/api/health"
echo ""
echo -e "${BLUE}Backup:${NC}"
echo "  Backup-Verzeichnis: $BACKUP_DIR"
echo ""

# Alte Backups aufräumen (behalte nur die letzten 5)
log "Räume alte Backups auf..."
ls -t /opt/labora-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf

success "Update erfolgreich abgeschlossen!"
