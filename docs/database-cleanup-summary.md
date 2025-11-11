# Datenbank-Bereinigung - Zusammenfassung

## Durchgeführte Bereinigung

### 1. password_reset_tokens bereinigt

- **Problem**: 44 Einträge hatten `used=true` aber `used_at IS NULL`
- **Lösung**: `used_at` wurde auf `created_at` (oder `NOW()`) gesetzt für alle betroffenen Einträge
- **Status**: ✅ Abgeschlossen

### 2. Ungenutzte Tabellen entfernt

Folgende Tabellen wurden entfernt (alle waren leer):

#### Freundschaftssystem

- ❌ **friends** - Wird nicht verwendet, nur `friendships` wird verwendet

#### Scoreboard/Leaderboard

- ❌ **leaderboards** - Wird nicht verwendet, Scoreboard wird dynamisch berechnet

#### Benachrichtigungen

- ❌ **notifications** - Wird nicht verwendet, Route existiert aber ist TODO

#### 2FA

- ❌ **two_factor_codes** - Wird nicht verwendet, 2FA wird in `users.totp_secret` gespeichert

#### Punkte-System

- ❌ **point_settings** - Wird nicht verwendet, Punkte werden in `exercises.points_per_unit` gespeichert

#### Sessions

- ❌ **user_sessions** - Wird nicht verwendet, JWT wird verwendet

#### Token-Verwaltung

- ❌ **verification_tokens** - Wird nicht verwendet, `email_verification_tokens` wird verwendet

#### Achievements

- ❌ **achievements** - Wird nicht verwendet
- ❌ **user_achievements** - Wird nicht verwendet

#### Konfiguration

- ❌ **activity_configs** - Wird nicht verwendet
- ❌ **app_settings** - Wird nicht verwendet

#### Organisationen

- ❌ **org.memberships** - Wird nicht verwendet
- ❌ **org.organizations** - Wird nicht verwendet
- ❌ **org Schema** - Wurde komplett entfernt

## Verbleibende Tabellen (alle werden verwendet)

✅ **users** - Benutzer-Daten
✅ **workouts** - Workout-Einträge
✅ **workout_activities** - Aktivitäten innerhalb von Workouts
✅ **exercises** - Übungstypen
✅ **training_journal_entries** - Trainingstagebuch-Einträge
✅ **friendships** - Freundschaften (wird verwendet)
✅ **friend_requests** - Freundschaftsanfragen
✅ **invitations** - Einladungen
✅ **email_verification_tokens** - E-Mail-Verifizierungstokens
✅ **password_reset_tokens** - Passwort-Reset-Tokens (bereinigt)
✅ **user_backup_codes** - 2FA Backup-Codes
✅ **outbound_emails** - E-Mail-Queue

## Migration

Die Bereinigung wurde als Migration `006_cleanup_unused_tables.sql` gespeichert und kann bei Bedarf erneut ausgeführt werden.

## Ergebnis

- **Entfernte Tabellen**: 13 Tabellen + 1 Schema
- **Bereinigte Daten**: 44 Einträge in `password_reset_tokens`
- **Gesparte Datenbankgröße**: ~200+ KB (Indizes und Tabellenstrukturen)

Die Datenbank ist jetzt aufgeräumt und enthält nur noch Tabellen die tatsächlich verwendet werden.
