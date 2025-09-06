#!/bin/bash

# Labora Homelab Tracker - Wartungsskript
# Dieses Skript führt verschiedene Wartungsaufgaben für Labora durch

set -e

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
echo "║                  Labora Wartung                             ║"
echo "║              Homelab Tracker Maintenance                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Labora Verzeichnis
LABORA_DIR="/opt/labora"

# Überprüfung ob Labora installiert ist
if [ ! -d "$LABORA_DIR" ]; then
    error "Labora ist nicht in $LABORA_DIR installiert!"
    exit 1
fi

cd "$LABORA_DIR"

# Menü anzeigen
show_menu() {
    echo ""
    echo -e "${BLUE}Wählen Sie eine Option:${NC}"
    echo "1) Status anzeigen"
    echo "2) Logs anzeigen"
    echo "3) Container neu starten"
    echo "4) Container stoppen"
    echo "5) Container starten"
    echo "6) Docker System bereinigen"
    echo "7) Backup erstellen"
    echo "8) Konfiguration bearbeiten"
    echo "9) Health Check"
    echo "10) Alle Optionen"
    echo "0) Beenden"
    echo ""
}

# Status anzeigen
show_status() {
    log "Aktueller Status:"
    docker-compose ps
    echo ""
    log "System-Informationen:"
    echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "  RAM: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo "  Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
    echo "  Uptime: $(uptime -p)"
}

# Logs anzeigen
show_logs() {
    log "Zeige Labora Logs (letzte 50 Zeilen):"
    docker-compose logs --tail=50
}

# Container neu starten
restart_containers() {
    log "Starte Labora Container neu..."
    docker-compose restart
    sleep 5
    show_status
}

# Container stoppen
stop_containers() {
    log "Stoppe Labora Container..."
    docker-compose down
    success "Container gestoppt"
}

# Container starten
start_containers() {
    log "Starte Labora Container..."
    docker-compose up -d
    sleep 5
    show_status
}

# Docker System bereinigen
cleanup_docker() {
    log "Bereinige Docker System..."
    docker system prune -f
    docker volume prune -f
    docker network prune -f
    success "Docker System bereinigt"
}

# Backup erstellen
create_backup() {
    log "Erstelle Backup..."
    BACKUP_DIR="/opt/labora-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r config/ "$BACKUP_DIR/" 2>/dev/null || true
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true
    cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
    success "Backup erstellt in: $BACKUP_DIR"
}

# Konfiguration bearbeiten
edit_config() {
    log "Öffne Konfigurationsdatei..."
    if command -v nano &> /dev/null; then
        nano config/config.yml
    elif command -v vim &> /dev/null; then
        vim config/config.yml
    else
        error "Kein Texteditor gefunden. Bitte installieren Sie nano oder vim."
    fi
}

# Health Check
health_check() {
    log "Führe Health Check durch..."
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        success "Labora ist gesund und erreichbar!"
        echo "  Web-Interface: http://$(hostname -I | awk '{print $1}'):3000"
    else
        error "Labora ist nicht erreichbar!"
        echo "Überprüfen Sie die Logs mit Option 2"
    fi
}

# Alle Optionen ausführen
run_all() {
    log "Führe alle Wartungsaufgaben aus..."
    show_status
    echo ""
    health_check
    echo ""
    cleanup_docker
    echo ""
    create_backup
    echo ""
    success "Alle Wartungsaufgaben abgeschlossen!"
}

# Hauptschleife
while true; do
    show_menu
    read -p "Ihre Wahl: " choice
    
    case $choice in
        1)
            show_status
            ;;
        2)
            show_logs
            ;;
        3)
            restart_containers
            ;;
        4)
            stop_containers
            ;;
        5)
            start_containers
            ;;
        6)
            cleanup_docker
            ;;
        7)
            create_backup
            ;;
        8)
            edit_config
            ;;
        9)
            health_check
            ;;
        10)
            run_all
            ;;
        0)
            log "Auf Wiedersehen!"
            exit 0
            ;;
        *)
            error "Ungültige Option. Bitte wählen Sie 0-10."
            ;;
    esac
    
    echo ""
    read -p "Drücken Sie Enter, um fortzufahren..."
done
