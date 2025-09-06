# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Geplant
- Erweiterte Widget-Implementierungen mit echten API-Calls
- Service-Discovery für automatische Erkennung
- Backup/Restore-Funktionalität
- Zusätzliche Service-Presets
- Plugin-System für erweiterbare Adapter

## [2.0.0] - 2024-01-XX

### Hinzugefügt
- **Service-Preset-System**: Über 20 vorgefertigte Service-Templates
- **Mehrfach-Instanzen**: Unterstützung für mehrere Instanzen desselben Service-Typs
- **Erweiterte Authentifizierung**: Basic Auth, JWT, Header-Forward (Authelia/NPM)
- **API-Adapter-System**: Modulare Adapter für verschiedene Homelab-Services
- **Environment-Variable-Support**: `${VAR}`, `env:VAR`, `$VAR` Formate
- **Admin-Interface**: Vollständige Service-Verwaltung mit GUI
- **Service-Validierung**: Automatische Konfigurationsvalidierung mit Zod
- **Test-Framework**: Unit-Tests mit Vitest
- **Erweiterte Widgets**: Proxmox, AdGuard, Pi-hole, NPM, Portainer, Jellyfin, Sonarr, Uptime Kuma

### Geändert
- **Schema-Refactoring**: Neue, erweiterte Zod-Schemas für Services und Adapter
- **Adapter-Architektur**: Modulare Adapter-Clients in `/lib/clients/*`
- **Konfigurationsstruktur**: Erweiterte Service-Definition mit Checks und Auth
- **Admin-UI**: Komplett überarbeitete Benutzeroberfläche
- **TypeScript**: Vollständige Typsicherheit für alle neuen Features

### Entfernt
- **Legacy-Schemas**: Alte, vereinfachte Service-Schemas (zugunsten der neuen)
- **Hardcoded Widgets**: Ersetzt durch konfigurierbare Adapter

### Behoben
- **Widget-Container**: Syntax-Fehler in der Widget-Container-Komponente
- **Fehlerbehandlung**: Verbesserte Fehlerbehandlung in API-Routen
- **Validierung**: Konsistente Validierung in allen API-Endpunkten

### Sicherheit
- **Secrets-Handling**: Sichere Verarbeitung von Environment-Variablen
- **Input-Validierung**: Strikte Validierung aller Benutzereingaben
- **Sanitization**: Automatische Sanitierung für Logs

## [1.0.0] - 2024-01-XX

### Hinzugefügt
- **Basis-Dashboard**: Service-Kacheln mit Icons und Gruppierung
- **Widget-System**: Proxmox, pfSense, AdGuard, NPM Widgets (Mock-Daten)
- **Admin-Interface**: Grundlegende Konfigurationsverwaltung
- **Docker-Support**: Dockerfile und docker-compose.yml
- **PWA-Features**: Installierbar, offline-fähig
- **Theme-Support**: Light/Dark/System Themes
- **Suchfunktion**: Fuzzy-Suche über Services
- **Health-Checks**: Ping und HTTP-Status-Überwachung
- **Discovery**: Netzwerk-Service-Discovery

### Technische Details
- **Next.js 14**: App Router, TypeScript, TailwindCSS
- **shadcn/ui**: Moderne UI-Komponenten
- **Zod**: Schema-Validierung
- **Lucide React**: Icons
- **Fuse.js**: Suchfunktionalität

---

## Migration Guide

### Von v1.0.0 zu v2.0.0

#### Konfigurationsänderungen

**Alte Konfiguration:**
```yaml
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
    order: 0
```

**Neue Konfiguration:**
```yaml
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
```

#### Wichtige Änderungen

1. **Service-ID**: Jeder Service benötigt eine eindeutige `id`
2. **Service-Typ**: Neues `type`-Feld für Preset-Zuordnung
3. **Instanz-ID**: `instanceId` für Mehrfach-Instanzen
4. **Checks-Struktur**: Neue `checks.adapters`-Struktur
5. **Auth-Konfiguration**: Explizite `auth`-Konfiguration

#### Migration-Skript

```bash
# Automatische Migration (geplant für v2.1.0)
npm run migrate:v2
```

#### Manuelle Migration

1. **Backup erstellen**:
   ```bash
   cp config/config.yml config/config.yml.backup
   ```

2. **Services aktualisieren**:
   - Füge `id` und `type` zu jedem Service hinzu
   - Konvertiere `health` zu `checks.adapters`
   - Füge `auth`-Konfiguration hinzu

3. **Environment-Variablen**:
   - Verwende `${VAR}`-Format für Secrets
   - Definiere alle API-Credentials in `.env`

4. **Testen**:
   ```bash
   npm run test
   npm run build
   ```

### Breaking Changes

- **Service-Schema**: Vollständig neue Service-Definition
- **Widget-APIs**: Neue Adapter-basierte Architektur
- **Admin-UI**: Komplett neue Benutzeroberfläche
- **Konfigurationsformat**: Erweiterte YAML-Struktur

### Deprecation Warnings

- **Legacy-Schemas**: Werden in v2.1.0 entfernt
- **Alte Widget-APIs**: Werden durch Adapter ersetzt
- **Hardcoded Widgets**: Werden durch konfigurierbare Adapter ersetzt
