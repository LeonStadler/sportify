# Entwicklung

Diese Dokumentation beschreibt Entwicklungshinweise, Best Practices und Workflows für Sportify.

## Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js 18+ installiert
- PostgreSQL-Datenbank verfügbar
- Git installiert

### Setup

1. Repository klonen
2. Dependencies installieren: `npm install`
3. `.env` Datei erstellen (siehe `.env.example`)
4. Datenbank-Verbindung konfigurieren
5. Entwicklungsserver starten: `npm run dev`

## Code-Struktur

### Frontend

#### Komponenten

- **UI-Komponenten**: In `src/components/ui/` (shadcn/ui)
- **Feature-Komponenten**: In `src/components/`
- **Seiten**: In `src/pages/`

#### Naming Conventions

- **Komponenten**: PascalCase (`WorkoutForm.tsx`)
- **Hooks**: camelCase mit `use` Präfix (`useAuth.ts`)
- **Utilities**: camelCase (`apiClient.ts`)
- **Types**: PascalCase (`User.ts`)

#### Datei-Struktur

```typescript
// Komponente Beispiel
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const [state, setState] = useState();
  
  return <Button>Click me</Button>;
}
```

### Backend

#### Route Handler

- **Struktur**: `routes/[feature].routes.js`
- **Export**: Factory-Funktion die Router zurückgibt
- **Middleware**: Auth-Middleware für geschützte Routes

#### Beispiel

```javascript
export const createMyRouter = (pool) => {
  const router = express.Router();
  
  router.get('/', authMiddleware, async (req, res) => {
    // Handler Logic
  });
  
  return router;
};
```

## Best Practices

### TypeScript

- **Strict Mode**: Immer aktiviert
- **Type Definitions**: Explizite Typen für Funktionen
- **Interfaces**: Für Objekt-Strukturen
- **Types**: Für Union Types und Utility Types

### React

- **Hooks**: Funktionale Komponenten mit Hooks
- **Custom Hooks**: Für wiederverwendbare Logik
- **Error Boundaries**: Für Fehlerbehandlung
- **Lazy Loading**: Für große Komponenten

### Code-Qualität

- **ESLint**: Automatische Code-Qualitätsprüfung
- **Prettier**: Code-Formatierung
- **Type Checking**: `npm run type-check` vor Commit

### Git Workflow

1. Feature-Branch erstellen: `git checkout -b feature/my-feature`
2. Änderungen committen: `git commit -m "feat: add feature"`
3. Push: `git push origin feature/my-feature`
4. Pull Request erstellen

### Commit Messages

Verwende konventionelle Commits:

- `feat:` Neue Feature
- `fix:` Bug-Fix
- `docs:` Dokumentation
- `style:` Formatierung
- `refactor:` Code-Refactoring
- `test:` Tests
- `chore:` Wartungsaufgaben

## Testing

### Frontend Tests

```bash
npm run test        # Einmalig
npm run test:watch # Watch-Modus
```

### Test-Struktur

- Tests neben Komponenten: `Component.test.tsx`
- Oder in `src/pages/__tests__/`

### Beispiel Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Debugging

### Frontend

- **React DevTools**: Browser-Erweiterung
- **Console Logs**: `console.log()` für Debugging
- **React Query DevTools**: Für API-State-Debugging

### Backend

- **Console Logs**: Server-Logs im Terminal
- **Postman/Insomnia**: API-Testing
- **Database Tools**: pgAdmin oder ähnlich

### Vercel

- **Vercel Logs**: In Vercel Dashboard verfügbar
- **Function Logs**: Serverless Function Logs

## Performance-Optimierung

### Frontend

- **Code Splitting**: Lazy Loading für Routes
- **Memoization**: `useMemo` und `useCallback` wo nötig
- **Virtual Scrolling**: Für große Listen
- **Image Optimization**: WebP, Lazy Loading

### Backend

- **Database Indexes**: Für häufig abgefragte Spalten
- **Query Optimization**: Effiziente SQL-Queries
- **Connection Pooling**: Optimierte Pool-Größe

## Sicherheit

### Frontend

- **Input Validation**: Zod-Schemas für Forms
- **XSS Prevention**: React escaped automatisch
- **CSRF**: Token-basierte Authentifizierung

### Backend

- **SQL Injection**: Parameterized Queries
- **Password Hashing**: bcryptjs
- **Rate Limiting**: (Zukünftig) für API-Endpunkte

## Troubleshooting

### Häufige Probleme

#### Frontend startet nicht

- Prüfe Node.js Version: `node --version`
- Lösche `node_modules` und `package-lock.json`
- Installiere neu: `npm install`

#### Backend-Fehler

- Prüfe Datenbank-Verbindung
- Prüfe Umgebungsvariablen
- Prüfe Server-Logs

#### Build-Fehler

- Prüfe TypeScript-Fehler: `npm run type-check`
- Prüfe ESLint-Fehler: `npm run lint`
- Prüfe Import-Pfade

## Ressourcen

- [React Dokumentation](https://react.dev)
- [TypeScript Dokumentation](https://www.typescriptlang.org/docs/)
- [Vite Dokumentation](https://vitejs.dev)
- [Express Dokumentation](https://expressjs.com)
- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)

