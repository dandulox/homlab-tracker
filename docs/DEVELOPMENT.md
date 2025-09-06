# Entwicklungsdokumentation

Diese Dokumentation richtet sich an Entwickler, die zu Labora beitragen möchten.

## 📋 Inhaltsverzeichnis

- [Entwicklungsumgebung](#entwicklungsumgebung)
- [Projektstruktur](#projektstruktur)
- [Architektur](#architektur)
- [Code-Standards](#code-standards)
- [Testing](#testing)
- [Build-Prozess](#build-prozess)
- [Debugging](#debugging)
- [Performance](#performance)
- [Beitragen](#beitragen)

## 🛠️ Entwicklungsumgebung

### Voraussetzungen

- **Node.js**: 18.x oder höher
- **npm**: 9.x oder höher
- **Git**: Für Versionskontrolle
- **Docker**: Optional für Container-Entwicklung
- **VS Code**: Empfohlener Editor

### Setup

```bash
# Repository klonen
git clone https://github.com/dandulox/homlab-tracker.git
cd homlab-tracker

# Dependencies installieren
npm install

# Environment-Variablen setzen
cp env.example .env
# Bearbeite .env

# Entwicklungsserver starten
npm run dev
```

### VS Code Extensions

Empfohlene Extensions für die Entwicklung:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

### Entwicklungsskripte

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run start        # Produktions-Server
npm run lint         # ESLint
npm run lint:fix     # ESLint mit Auto-Fix
npm run test         # Unit Tests
npm run test:watch   # Tests im Watch-Modus
npm run test:coverage # Test-Coverage
npm run test:e2e     # E2E Tests
npm run type-check   # TypeScript Check
npm run validate-config # Konfiguration validieren
```

## 📁 Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── config/        # Konfigurations-API
│   │   ├── health/        # Health Check API
│   │   ├── discovery/     # Service Discovery API
│   │   └── widgets/       # Widget APIs
│   ├── admin/             # Admin Interface
│   │   └── page.tsx       # Admin-Seite
│   ├── globals.css        # Globale Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Dashboard
├── components/            # React Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── widgets/          # Widget-Komponenten
│   │   ├── widget-container.tsx
│   │   ├── proxmox-widget.tsx
│   │   ├── adguard-widget.tsx
│   │   └── ...
│   ├── admin/            # Admin-Komponenten
│   │   ├── service-form.tsx
│   │   ├── service-list.tsx
│   │   └── ...
│   ├── header.tsx        # Header-Komponente
│   ├── sidebar.tsx       # Sidebar-Komponente
│   └── service-card.tsx  # Service-Karte
├── lib/                  # Utilities und Schemas
│   ├── clients/          # API-Adapter
│   │   ├── base.ts       # Basis-Adapter
│   │   ├── proxmox.ts    # Proxmox-Adapter
│   │   ├── adguard.ts    # AdGuard-Adapter
│   │   └── ...
│   ├── schemas/          # Zod-Schemas
│   │   ├── service.ts    # Service-Schemas
│   │   ├── widgets.ts    # Widget-Schemas
│   │   ├── presets.ts    # Preset-Schemas
│   │   └── legacy.ts     # Legacy-Schemas
│   ├── config.ts         # Konfigurations-Manager
│   ├── env.ts            # Environment-Handling
│   ├── presets.ts        # Preset-Manager
│   ├── utils.ts          # Utility-Funktionen
│   └── health.ts         # Health Check-Logik
├── config/               # Konfigurationsdateien
│   ├── config.yml        # Hauptkonfiguration
│   └── config.example.yml # Beispielkonfiguration
├── docs/                 # Dokumentation
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── API.md
│   ├── CONFIGURATION.md
│   └── DEVELOPMENT.md
├── __tests__/            # Tests
│   ├── lib/              # Unit Tests
│   ├── components/       # Komponenten-Tests
│   ├── e2e/              # E2E Tests
│   └── setup.ts          # Test-Setup
├── public/               # Statische Assets
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   ├── manifest.json
│   └── sw.js
├── docker-compose.yml    # Docker Setup
├── Dockerfile            # Docker Image
├── next.config.js        # Next.js Konfiguration
├── tailwind.config.ts    # TailwindCSS Konfiguration
├── tsconfig.json         # TypeScript Konfiguration
├── vitest.config.ts      # Vitest Konfiguration
└── package.json          # Dependencies
```

## 🏗️ Architektur

### Frontend-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Dashboard (/)     │  Admin (/admin)  │  API (/api/*)      │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Widgets   │  │    Admin    │  │      UI     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Schemas   │  │   Clients   │  │   Utils     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Config    │  │   External  │  │   Cache     │        │
│  │   Manager   │  │    APIs     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Backend-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    API Routes                              │
├─────────────────────────────────────────────────────────────┤
│  /api/config    │  /api/health   │  /api/widgets/*         │
├─────────────────────────────────────────────────────────────┤
│  Adapter Layer                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Proxmox   │  │   AdGuard   │  │     NPM     │        │
│  │   Adapter   │  │   Adapter   │  │   Adapter   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Base Adapter                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Caching   │  │   Retry     │  │   Error     │        │
│  │   Logic     │  │   Logic     │  │  Handling   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Datenfluss

```
User Action → Component → API Route → Adapter → External API
     ↓              ↓           ↓         ↓           ↓
   State      Validation   Business   Caching    Response
   Update     (Zod)       Logic      Layer      Processing
     ↓              ↓           ↓         ↓           ↓
   UI Update   Error       Data      Cache      Formatted
   Render      Handling    Transform Update     Response
```

## 📝 Code-Standards

### TypeScript

- **Strikte Typisierung**: Alle Variablen und Funktionen müssen typisiert sein
- **Interface-First**: Verwende Interfaces für Objekt-Typen
- **Generics**: Nutze Generics für wiederverwendbare Komponenten
- **Enums**: Verwende Enums für Konstanten

```typescript
// ✅ Gut
interface ServiceConfig {
  id: string
  name: string
  url: string
  enabled: boolean
}

const createService = <T extends ServiceConfig>(config: T): T => {
  // Implementation
}

// ❌ Schlecht
const createService = (config: any): any => {
  // Implementation
}
```

### React

- **Functional Components**: Verwende Function Components mit Hooks
- **Custom Hooks**: Extrahiere wiederverwendbare Logik in Custom Hooks
- **Props Interface**: Definiere Props-Interfaces für alle Komponenten
- **Error Boundaries**: Verwende Error Boundaries für Fehlerbehandlung

```typescript
// ✅ Gut
interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleEdit = useCallback(() => {
    onEdit(service)
  }, [service, onEdit])
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  )
}

// ❌ Schlecht
export function ServiceCard(props: any) {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### Styling

- **TailwindCSS**: Verwende TailwindCSS für Styling
- **CSS Modules**: Für komplexe Styles
- **Responsive Design**: Mobile-First Approach
- **Dark Mode**: Unterstütze Dark Mode

```typescript
// ✅ Gut
<div className="flex flex-col md:flex-row gap-4 p-6 bg-background text-foreground">
  <Card className="flex-1 hover:shadow-md transition-shadow">
    <CardContent className="pt-6">
      {/* Content */}
    </CardContent>
  </Card>
</div>

// ❌ Schlecht
<div style={{ display: 'flex', padding: '24px' }}>
  <div style={{ backgroundColor: 'white' }}>
    {/* Content */}
  </div>
</div>
```

### API-Design

- **RESTful**: Folge REST-Prinzipien
- **Konsistente Responses**: Einheitliches Response-Format
- **Error Handling**: Strukturierte Fehlerbehandlung
- **Validierung**: Zod-Schema-Validierung

```typescript
// ✅ Gut
export async function GET(request: NextRequest) {
  try {
    const config = await configManager.loadConfig()
    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ❌ Schlecht
export async function GET() {
  const config = await configManager.loadConfig()
  return NextResponse.json(config)
}
```

### Naming Conventions

- **Dateien**: kebab-case (`service-form.tsx`)
- **Komponenten**: PascalCase (`ServiceForm`)
- **Funktionen**: camelCase (`handleSubmit`)
- **Konstanten**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase mit I-Prefix (`IServiceConfig`)

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/lib/clients/proxmox.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ProxmoxAdapter } from '@/lib/clients/proxmox'

describe('ProxmoxAdapter', () => {
  it('should validate config correctly', () => {
    const adapter = new ProxmoxAdapter({
      enabled: true,
      baseUrl: 'https://proxmox.lan:8006',
      tokenId: 'test-token',
      tokenSecret: 'test-secret'
    })
    
    expect(adapter.validateConfig()).toBe(true)
  })
  
  it('should handle API errors gracefully', async () => {
    const adapter = new ProxmoxAdapter({
      enabled: true,
      baseUrl: 'https://invalid-url',
      tokenId: 'test-token',
      tokenSecret: 'test-secret'
    })
    
    const result = await adapter.getData()
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

### Komponenten-Tests

```typescript
// __tests__/components/service-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceCard } from '@/components/service-card'

describe('ServiceCard', () => {
  const mockService = {
    id: 'test-service',
    name: 'Test Service',
    url: 'https://test.com',
    // ... other properties
  }
  
  it('should render service information', () => {
    render(<ServiceCard service={mockService} />)
    
    expect(screen.getByText('Test Service')).toBeInTheDocument()
    expect(screen.getByText('https://test.com')).toBeInTheDocument()
  })
  
  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    render(<ServiceCard service={mockService} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith(mockService)
  })
})
```

### E2E Tests

```typescript
// __tests__/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should display services', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('[data-testid="service-card"]')).toBeVisible()
    await expect(page.locator('text=Proxmox')).toBeVisible()
  })
  
  test('should navigate to admin', async ({ page }) => {
    await page.goto('/')
    
    await page.click('[data-testid="admin-link"]')
    await expect(page).toHaveURL('/admin')
  })
})
```

### Test-Coverage

```bash
# Coverage anzeigen
npm run test:coverage

# Coverage-Report öffnen
open coverage/index.html
```

## 🔨 Build-Prozess

### Development Build

```bash
# Entwicklungsserver
npm run dev

# TypeScript Check
npm run type-check

# Linting
npm run lint
```

### Production Build

```bash
# Build erstellen
npm run build

# Build testen
npm run start

# Build analysieren
npm run analyze
```

### Docker Build

```bash
# Image bauen
docker build -t labora:latest .

# Multi-stage Build
docker build --target production -t labora:prod .

# Build mit BuildKit
DOCKER_BUILDKIT=1 docker build -t labora:latest .
```

### Build-Optimierung

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  images: {
    formats: ['image/webp', 'image/avif']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
```

## 🐛 Debugging

### Development Debugging

```bash
# Debug-Modus aktivieren
DEBUG=labora:* npm run dev

# Spezifische Module debuggen
DEBUG=labora:clients npm run dev

# Log-Level setzen
LOG_LEVEL=debug npm run dev
```

### Browser Debugging

```typescript
// React DevTools
import { Profiler } from 'react'

function MyComponent() {
  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      {/* Component content */}
    </Profiler>
  )
}

// Performance Monitoring
const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration })
}
```

### API Debugging

```typescript
// API Route Debugging
export async function GET(request: NextRequest) {
  console.log('Request URL:', request.url)
  console.log('Request Headers:', Object.fromEntries(request.headers))
  
  try {
    // API Logic
  } catch (error) {
    console.error('API Error:', error)
    // Error handling
  }
}
```

### Docker Debugging

```bash
# Container-Logs
docker logs -f labora

# In Container einsteigen
docker exec -it labora sh

# Debug-Container
docker run --rm -it \
  -e DEBUG=labora:* \
  -e LOG_LEVEL=debug \
  labora:latest
```

## ⚡ Performance

### Frontend-Performance

```typescript
// Lazy Loading
import { lazy, Suspense } from 'react'

const AdminPage = lazy(() => import('./admin/page'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPage />
    </Suspense>
  )
}

// Memoization
import { memo, useMemo, useCallback } from 'react'

const ServiceCard = memo(({ service, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(service)
  }, [service, onEdit])
  
  const serviceData = useMemo(() => {
    return processServiceData(service)
  }, [service])
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  )
})
```

### Backend-Performance

```typescript
// Caching
import { cache } from 'react'

const getConfig = cache(async () => {
  return await configManager.loadConfig()
})

// Connection Pooling
const adapter = new ProxmoxAdapter({
  baseUrl: 'https://proxmox.lan:8006',
  timeout: 10000,
  retries: 3
})
```

### Bundle-Analyse

```bash
# Bundle-Größe analysieren
npm run analyze

# Bundle-Report
npx @next/bundle-analyzer
```

## 🤝 Beitragen

### Development Workflow

1. **Fork Repository**
2. **Feature-Branch erstellen**
3. **Änderungen implementieren**
4. **Tests schreiben**
5. **Linting und Formatting**
6. **Pull Request erstellen**

### Commit-Messages

```
feat: add new Proxmox adapter
fix: resolve configuration validation error
docs: update API documentation
test: add unit tests for service validation
refactor: extract common adapter logic
```

### Pull Request Template

```markdown
## Beschreibung
Kurze Beschreibung der Änderungen.

## Änderungen
- [ ] Feature hinzugefügt
- [ ] Bug behoben
- [ ] Dokumentation aktualisiert
- [ ] Tests hinzugefügt

## Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests
- [ ] Manual Testing

## Screenshots
Falls zutreffend, füge Screenshots hinzu.

## Checkliste
- [ ] Code folgt den Style-Guides
- [ ] Tests wurden hinzugefügt/aktualisiert
- [ ] Dokumentation wurde aktualisiert
- [ ] Keine Breaking Changes (oder dokumentiert)
```

### Code Review

- **Funktionalität**: Funktioniert der Code wie erwartet?
- **Performance**: Gibt es Performance-Probleme?
- **Sicherheit**: Sind there Sicherheitslücken?
- **Wartbarkeit**: Ist der Code wartbar und verständlich?
- **Tests**: Sind ausreichend Tests vorhanden?

---

**Für weitere Informationen konsultieren Sie die [Hauptdokumentation](README.md) oder erstellen Sie ein [Issue](https://github.com/dandulox/homlab-tracker/issues).**
