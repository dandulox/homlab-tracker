# Labora - Smart Homelab Dashboard

## 🎯 Projektübersicht

Labora ist ein modernes, selbst-hostbares Homelab-Dashboard, das die besten Features von Heimdall und Homer kombiniert. Es bietet eine intuitive Benutzeroberfläche für die Verwaltung und Überwachung von Homelab-Services mit erweiterten API-Integrationen.

## ✨ Hauptfeatures

### 🎨 **Dashboard-Features**
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Theme-Support**: Light/Dark/System Themes
- **Suchfunktion**: Fuzzy-Suche über alle Services
- **Favoriten**: Wichtige Services hervorheben
- **Gruppierung**: Organisierte Kategorien
- **PWA**: Installierbar als App

### 🔧 **Service-Management**
- **Preset-System**: 20+ vorgefertigte Service-Templates
- **Mehrfach-Instanzen**: Mehrere Instanzen desselben Typs
- **Health Checks**: Ping und HTTP-Status-Überwachung
- **API-Integration**: Live-Daten von Homelab-Services
- **Authentifizierung**: Basic Auth, JWT, Header-Forward

### 🛠️ **Admin-Interface**
- **Service-CRUD**: Hinzufügen, bearbeiten, duplizieren, löschen
- **Adapter-Konfiguration**: Ein-/Ausschalten von API-Integrationen
- **Test-Funktionen**: Service-Erreichbarkeit testen
- **Validierung**: Automatische Konfigurationsvalidierung
- **Import/Export**: Konfigurations-Backup

## 🏗️ Technische Architektur

### **Frontend**
- **Next.js 14**: App Router, TypeScript, TailwindCSS
- **shadcn/ui**: Moderne UI-Komponenten
- **Lucide React**: Icons
- **Fuse.js**: Suchfunktionalität

### **Backend**
- **Next.js API Routes**: REST-API
- **Zod**: Schema-Validierung
- **Modulare Adapter**: API-Integrationen
- **Caching**: Intelligentes Caching

### **Datenmodell**
- **YAML-Konfiguration**: Menschlich lesbare Konfiguration
- **Environment-Variablen**: Sichere Credential-Verwaltung
- **Schema-Validierung**: Typsichere Konfiguration

## 📋 Service-Presets

### **Infrastructure & Management**
- Proxmox VE, Portainer, Grafana, Prometheus

### **Network & Security**
- pfSense/OPNsense, AdGuard Home, Pi-hole, Nginx Proxy Manager

### **Media & Download**
- Jellyfin, Sonarr, Radarr, qBittorrent

### **Files & Sync**
- Nextcloud, Syncthing

### **Monitoring**
- Uptime Kuma, Netdata

### **Home & IoT**
- Home Assistant

## 🔌 API-Adapter

### **Verfügbare Adapter**
- **Proxmox**: Node-Status, VM-Übersicht, Ressourcenverbrauch
- **AdGuard/Pi-hole**: DNS-Statistiken, Block-Rate, Top Domains
- **NPM**: Proxy-Hosts, SSL-Zertifikate, Ablaufzeiten
- **Portainer**: Container, Images, Volumes, Networks
- **Jellyfin**: Benutzer, Filme, Serien, Episoden
- **Sonarr**: Serien, Episoden, Queue, Warnings
- **Uptime Kuma**: Monitore, Status, Uptime

### **Adapter-Features**
- **Caching**: Intelligentes Caching für bessere Performance
- **Error Handling**: Robuste Fehlerbehandlung
- **Retry Logic**: Automatische Wiederholung bei Fehlern
- **Rate Limiting**: Schutz vor API-Überlastung

## 🔒 Authentifizierung

### **Unterstützte Modi**
- **Keine Authentifizierung**: Für lokale Netzwerke
- **Basic Auth**: Einfache Benutzer/Passwort-Authentifizierung
- **JWT Token**: Token-basierte Authentifizierung
- **Header Forward**: Kompatibel mit Authelia/NPM

### **Sicherheitsfeatures**
- **Secrets-Handling**: Sichere Verarbeitung von Credentials
- **Input-Validierung**: Strikte Validierung aller Eingaben
- **Sanitization**: Automatische Log-Sanitierung

## 🐳 Deployment

### **Docker**
- **Multi-stage Build**: Optimierte Docker-Images
- **Docker Compose**: Einfache Orchestrierung
- **Health Checks**: Automatische Gesundheitsprüfung

### **LXC Container**
- **Installationsskript**: Automatische Installation
- **Systemd Service**: Service-Management
- **Firewall-Konfiguration**: Automatische UFW-Setup

### **Lokale Entwicklung**
- **Node.js**: 18.x oder höher
- **npm**: 9.x oder höher
- **Hot Reload**: Entwicklungsserver

## 🧪 Testing

### **Test-Framework**
- **Vitest**: Unit-Tests
- **Playwright**: E2E-Tests
- **Mock-Support**: Umfassende Mocking-Funktionalität

### **Test-Coverage**
- **Unit Tests**: Alle wichtigen Module
- **Integration Tests**: API-Integrationen
- **E2E Tests**: Benutzer-Workflows

## 📚 Dokumentation

### **Vollständige Dokumentation**
- **Installation**: Docker, LXC, lokale Entwicklung
- **Konfiguration**: Service-Presets, Adapter, Authentifizierung
- **API-Referenz**: Alle Endpunkte und Beispiele
- **Entwicklung**: Code-Standards, Testing, Build-Prozess

### **Beispiele**
- **Konfigurationsbeispiele**: Vollständige YAML-Konfigurationen
- **API-Beispiele**: Python, JavaScript, cURL, PowerShell
- **Deployment-Beispiele**: Docker, Nginx, Apache

## 🚀 Roadmap

### **Geplante Features**
- **Erweiterte Widgets**: Grafana, Prometheus, Home Assistant
- **Service-Discovery**: Automatische Erkennung von Services
- **Backup/Restore**: Konfigurations-Backup
- **Themes**: Zusätzliche UI-Themes
- **Mobile App**: Native Mobile App
- **Plugin-System**: Erweiterbare Adapter

### **Bekannte Einschränkungen**
- Widgets verwenden derzeit Mock-Daten (echte API-Integration in Entwicklung)
- Begrenzte Anzahl von Service-Presets (erweiterbar)
- Keine Benutzerverwaltung (geplant)

## 🤝 Beitragen

### **Entwicklungshinweise**
- **Code-Style**: Prettier und ESLint
- **TypeScript**: Alle neuen Dateien müssen TypeScript verwenden
- **Tests**: Schreibe Tests für neue Features
- **Dokumentation**: Dokumentiere API-Änderungen

### **Pull Request Prozess**
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe Tests
5. Aktualisiere Dokumentation
6. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](../LICENSE) für Details.

## 🙏 Danksagungen

- **Heimdall** - Inspiration für das Design
- **Homer** - Weitere Inspiration
- **shadcn/ui** - UI-Komponenten
- **Lucide** - Icons
- **Next.js Team** - Framework
- **Vercel** - Deployment-Plattform

---

**Labora - Ihr intelligentes Homelab-Dashboard! 🚀**
