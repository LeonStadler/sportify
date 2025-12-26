# Regel: Changelog & Versionierung

## Wann anwenden
- Immer wenn eine neue Version veröffentlicht oder ein user-facing Feature landet.

## Schritte
1) Version setzen  
   - `package.json` → `version` auf neue Version anheben.  
   - `src/version.ts` → `APP_VERSION` auf gleiche Version setzen (muss matchen).
2) Changelog pflegen  
   - `src/pages/Changelog.tsx`: neuen Eintrag oben hinzufügen (neueste zuerst).  
   - Inhalte: Titel, Datum, Version, Highlights (Stichpunkte, keine TODOs/Platzhalter), ggf. Breaking/Notes.  
   - Keine Demo-/Mock-Daten.  
3) Übersetzungen  
   - `src/lib/i18n.ts`: passende Keys für den neuen Eintrag in DE/EN ergänzen, Titel/Beschreibung/Highlights.  
   - Prüfe, dass Scoreboard/Rangliste, Weekly/Monthly Texte korrekt übersetzt bleiben.
4) Versions-Hinweis im UI  
   - Der Versionstoast nutzt `APP_VERSION` (LocalStorage-Key `sportify_app_version_seen`). Nach Bump einmal testen: LocalStorage-Wert löschen, App neu laden → Toast mit Button zum `/changelog` muss erscheinen.
5) Tests/Checks  
   - `npm run lint` (oder `lint:check`) bei größeren Änderungen.  
   - Kurz Smoke: Changelog-Seite lädt, Toast-Link öffnet `/changelog`.

## Was nicht vergessen
- Responsives Layout und Dark/Light beachten, keine TODOs/Platzhalter.  
- Keine neuen Libs ohne Notwendigkeit.  
- i18n-Fallbacks mitliefern, wenn Keys neu sind.  
- Bei Problemen mit Versionstoast: prüfen, dass `Toaster` in `src/main.tsx` eingebunden bleibt und `APP_VERSION` importiert ist.

