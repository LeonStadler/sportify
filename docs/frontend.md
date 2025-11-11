# Frontend

Diese Dokumentation beschreibt die Frontend-Struktur, Komponenten und Patterns von Sportify.

## Struktur

```
src/
├── components/          # Wiederverwendbare Komponenten
│   ├── ui/             # shadcn/ui Basis-Komponenten
│   ├── auth/           # Auth-spezifische Komponenten
│   └── ...             # Feature-Komponenten
├── pages/              # Seiten-Komponenten
│   ├── auth/           # Auth-Seiten
│   └── ...             # Haupt-Seiten
├── hooks/              # Custom React Hooks
├── contexts/           # React Contexts
├── lib/                # Utility-Funktionen
├── types/              # TypeScript-Typen
└── utils/              # Frontend-Utilities
```

## Komponenten

### UI-Komponenten (shadcn/ui)

Basis-Komponenten in `src/components/ui/`:

- Button, Input, Select, Dialog, etc.
- Alle basierend auf Radix UI
- Tailwind CSS für Styling
- Dark Mode Support

### Feature-Komponenten

- **WorkoutForm**: Workout-Erstellung
- **ActivityFeed**: Activity Feed Anzeige
- **ScoreboardTable**: Ranglisten-Tabelle
- **Notifications**: Benachrichtigungen
- **AppSidebar**: Hauptnavigation
- **MobileBottomNav**: Mobile Navigation

## Seiten

### Public Pages

- **Landing**: Startseite
- **Login**: Login-Seite
- **Register**: Registrierungs-Seite
- **ResetPassword**: Passwort-Reset
- **EmailVerification**: E-Mail-Verifizierung

### Protected Pages

- **Dashboard**: Haupt-Dashboard
- **Training**: Workout-Verwaltung
- **Stats**: Statistiken
- **Scoreboard**: Ranglisten
- **Profile**: Profil-Verwaltung
- **Friends**: Freundschaftssystem
- **Admin**: Admin-Panel (nur Admins)

## Hooks

### useAuth

Authentifizierungs-Hook:

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### useExercises

Übungen laden:

```typescript
const { exercises, isLoading } = useExercises();
```

### useOfflineSync

Offline-Synchronisation:

```typescript
useOfflineSync(); // Automatische Sync wenn online
```

### Weitere Hooks

- `useOnlineStatus`: Online/Offline-Status
- `useDebounce`: Debounce für Inputs
- `useMobile`: Mobile-Erkennung
- `useSidebar`: Sidebar-State

## Contexts

### AuthContext

Globaler Auth-State:

```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

Bietet:
- User-Daten
- Login/Logout-Funktionen
- 2FA-Funktionen
- Profil-Updates

## State Management

### React Query (TanStack Query)

Für Server-State:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['workouts'],
  queryFn: () => fetchWorkouts()
});
```

Features:
- Automatisches Caching
- Background Refetching
- Optimistic Updates
- Error Handling

### Local State

- `useState`: Für Komponenten-State
- `useReducer`: Für komplexen State

## Routing

### React Router

```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/training" element={<Training />} />
  {/* ... */}
</Routes>
```

### Route Protection

- Public Routes: Keine Auth erforderlich
- Protected Routes: Auth erforderlich
- Admin Routes: Admin-Rolle erforderlich

## Styling

### Tailwind CSS

Utility-First CSS:

```tsx
<div className="flex items-center justify-between p-4">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Dark Mode

Automatische Dark Mode Unterstützung:

```tsx
<div className="bg-background text-foreground">
  {/* Automatisch Light/Dark */}
</div>
```

### Responsive Design

Mobile-First Approach:

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive Padding */}
</div>
```

## Internationalization

### i18next

Mehrsprachigkeit:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
```

Unterstützte Sprachen:
- Deutsch (de)
- Englisch (en)

## Form Handling

### React Hook Form + Zod

Form-Validierung:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const form = useForm({
  resolver: zodResolver(schema)
});
```

## API-Integration

### API Client

```typescript
import { api } from '@/utils/apiClient';

const response = await api.post('/workouts', data);
```

Features:
- Automatische Offline-Queue
- Error Handling
- TypeScript-Support

## Performance

### Code Splitting

Lazy Loading für Routes:

```typescript
const Dashboard = lazy(() => import('@/pages/Dashboard'));
```

### Memoization

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## PWA-Features

Siehe [PWA-Dokumentation](pwa.md) für Details:

- Service Worker
- Offline-Support
- Install Prompt
- Badge API

## Testing

### Vitest

```typescript
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    // Test
  });
});
```

### Testing Library

```typescript
import { render, screen } from '@testing-library/react';

render(<Component />);
expect(screen.getByText('Hello')).toBeInTheDocument();
```

## Best Practices

### Komponenten

- Kleine, wiederverwendbare Komponenten
- Props-Typisierung mit TypeScript
- Default Props wo sinnvoll

### Performance

- Lazy Loading für große Komponenten
- Memoization für teure Berechnungen
- Vermeide unnötige Re-Renders

### Accessibility

- ARIA Labels
- Keyboard Navigation
- Screen Reader Support
- Focus Management

## Troubleshooting

### Build-Fehler

- Prüfe TypeScript-Fehler: `npm run type-check`
- Prüfe Import-Pfade
- Prüfe Dependencies

### Runtime-Fehler

- Prüfe Browser-Konsole
- Prüfe React DevTools
- Prüfe Network-Tab

### Performance-Probleme

- Prüfe React DevTools Profiler
- Prüfe Bundle-Größe
- Prüfe Lazy Loading

