# Requirements Document

## Introduction

Das Exercise Database System erweitert die bestehende Sportify-Anwendung um eine flexible, nutzergesteuerte Übungsdatenbank und Workout-Vorlagen-System. Anstelle der aktuell hartcodierten Übungen ermöglicht das System Nutzern, eigene Übungen anzulegen, zu verwalten und in strukturierten Workout-Vorlagen zu organisieren. Das System unterstützt verschiedene Trainingsarten (Kraftsport, Calisthenics, Ausdauer, Bouldern/Klettern) mit spezifischen Einheiten und Bewertungssystemen.

## Glossary

- **Exercise_Database**: Zentrale Datenbank aller verfügbaren Übungen
- **Exercise**: Eine einzelne Trainingsübung mit definierten Eigenschaften und Einheiten
- **Workout_Template**: Gespeicherte Trainingsvorlage mit mehreren Übungen, Sets und Parametern
- **Exercise_Type**: Kategorisierung von Übungen (Kraftsport, Ausdauer, Calisthenics, Bouldern)
- **Unit_System**: Einheitensystem für Messungen (Metric/Imperial)
- **Exercise_Difficulty**: Schwierigkeitsgrad einer Übung für Punkteberechnung
- **Admin_System**: Verwaltungssystem für Übungskuration und -moderation
- **Deduplication_System**: System zur Vermeidung doppelter Übungen
- **Search_Filter**: Such- und Filterfunktionalität für Übungen und Workouts
- **Scoring_System**: Punkteberechnungssystem für Trainingsleistungen

## Requirements

### Requirement 1: Exercise Database Management

**User Story:** Als Nutzer möchte ich Übungen zur Datenbank hinzufügen können, damit ich meine spezifischen Trainingsübungen dokumentieren kann.

#### Acceptance Criteria

1. WHEN ein Nutzer eine neue Übung anlegt, THE Exercise_Database SHALL die Übung mit allen erforderlichen Eigenschaften speichern
2. WHEN ein Nutzer eine Übung anlegt, THE Deduplication_System SHALL ähnliche existierende Übungen anzeigen
3. WHEN eine neue Übung angelegt wird, THE System SHALL einen normalisierten Slug für Deduplizierung generieren
4. THE Exercise_Database SHALL verschiedene Übungstypen unterstützen (Kraftsport, Ausdauer, Calisthenics, Bouldern)
5. WHEN ein Nutzer eine Übung sucht, THE Search_Filter SHALL relevante Ergebnisse basierend auf Name und Eigenschaften zurückgeben

### Requirement 2: Exercise Types and Units

**User Story:** Als Nutzer möchte ich verschiedene Übungstypen mit spezifischen Einheiten erfassen können, damit alle meine Trainingsarten korrekt dokumentiert werden.

#### Acceptance Criteria

1. THE System SHALL Kraftübungen mit Wiederholungen und optionalem Zusatzgewicht unterstützen
2. THE System SHALL Ausdauerübungen mit Distanz und Zeit unterstützen
3. THE System SHALL Halteübungen mit Zeitdauer unterstützen
4. THE System SHALL Boulder-/Kletterübungen mit Routen, Schwierigkeitsgraden und Versuchen unterstützen
5. WHEN eine Übung Gewicht erfordert, THE System SHALL Gewichtseingabe als verpflichtend markieren
6. THE System SHALL Nutzer-Einheitenpräferenzen (Metric/Imperial) für alle Messungen berücksichtigen

### Requirement 3: Exercise Administration and Curation

**User Story:** Als Administrator möchte ich Übungen kuratieren und verwalten können, damit die Datenbank qualitativ hochwertig und duplikatfrei bleibt.

#### Acceptance Criteria

1. WHEN ein Administrator Übungen überprüft, THE Admin_System SHALL alle vorgeschlagenen Übungen anzeigen
2. THE Admin_System SHALL Übungen löschen, zusammenführen oder bearbeiten können
3. WHEN Übungen zusammengeführt werden, THE System SHALL alle Referenzen auf die alte Übung aktualisieren
4. THE System SHALL ein Reporting-System für problematische Übungen bereitstellen
5. THE Admin_System SHALL Übungsaliase für alternative Namen verwalten können

### Requirement 4: Workout Template System

**User Story:** Als Nutzer möchte ich Workout-Vorlagen erstellen und teilen können, damit ich strukturierte Trainingspläne wiederverwenden kann.

#### Acceptance Criteria

1. WHEN ein Nutzer ein Workout-Template erstellt, THE System SHALL alle Übungen, Sets, Wiederholungen und Parameter speichern
2. THE System SHALL Workout-Templates mit drei Sichtbarkeitsstufen unterstützen (privat, Freunde, öffentlich)
3. WHEN ein Nutzer ein öffentliches Template nutzt, THE System SHALL eine Kopie für persönliche Anpassungen erstellen
4. THE System SHALL eine Übersicht eigener und verfügbarer Templates bereitstellen
5. WHEN ein Template genutzt wird, THE System SHALL es als Basis für ein neues Training laden

### Requirement 5: Training Documentation Integration

**User Story:** Als Nutzer möchte ich beim Dokumentieren von Training aus der Übungsdatenbank wählen können, damit ich konsistente und vollständige Trainingsdaten erfasse.

#### Acceptance Criteria

1. WHEN ein Nutzer ein Training dokumentiert, THE System SHALL eine durchsuchbare Übungsauswahl bereitstellen
2. THE Search_Filter SHALL Übungen nach Typ, Muskelgruppe und anderen Eigenschaften filtern können
3. WHEN eine Übung ausgewählt wird, THE System SHALL die entsprechenden Eingabefelder basierend auf dem Übungstyp anzeigen
4. THE System SHALL Autocomplete-Funktionalität für Übungsnamen bereitstellen
5. WHEN ein Training gespeichert wird, THE System SHALL alle Übungsreferenzen korrekt verknüpfen

### Requirement 6: Scoring System Foundation

**User Story:** Als Nutzer möchte ich für jede Übung faire Punkte erhalten, damit meine Trainingsleistung korrekt bewertet wird.

#### Acceptance Criteria

1. THE Scoring_System SHALL jeder Übung einen Basis-Schwierigkeitsfaktor zuweisen
2. WHEN Punkte berechnet werden, THE System SHALL Wiederholungen, Gewicht und Übungsfaktor berücksichtigen
3. THE System SHALL verschiedene Berechnungsformeln für verschiedene Übungstypen unterstützen
4. WHEN eine Übung bewertet wird, THE System SHALL transparente Punkteberechnung anzeigen
5. THE Admin_System SHALL Schwierigkeitsfaktoren anpassen können

### Requirement 7: Data Migration and Compatibility

**User Story:** Als bestehender Nutzer möchte ich meine bisherigen Trainingsdaten behalten, damit keine Informationen verloren gehen.

#### Acceptance Criteria

1. WHEN das System migriert wird, THE Migration_System SHALL alle hartcodierten Übungen in die Datenbank übertragen
2. THE Migration_System SHALL bestehende Trainingsdaten mit neuen Übungsreferenzen verknüpfen
3. WHEN Daten migriert werden, THE System SHALL die Integrität aller Punkteberechnungen bewahren
4. THE System SHALL Rückwärtskompatibilität für bestehende API-Endpunkte gewährleisten
5. WHEN Migration abgeschlossen ist, THE System SHALL keine hartcodierten Übungsreferenzen mehr enthalten

### Requirement 8: Search and Filter Functionality

**User Story:** Als Nutzer möchte ich Übungen und Workouts effizient finden können, damit ich schnell das Richtige für mein Training auswählen kann.

#### Acceptance Criteria

1. THE Search_Filter SHALL Volltextsuche in Übungsnamen und Beschreibungen unterstützen
2. WHEN nach Übungen gesucht wird, THE System SHALL Filter nach Übungstyp, Muskelgruppe und Ausrüstung bereitstellen
3. THE System SHALL erweiterte Filter für Schwierigkeitsgrad und Punktewerte unterstützen
4. WHEN Workout-Templates gesucht werden, THE System SHALL Filter nach Dauer, Typ und Sichtbarkeit bereitstellen
5. THE Search_Filter SHALL Suchergebnisse nach Relevanz und Popularität sortieren können

### Requirement 9: Boulder and Climbing Support

**User Story:** Als Kletterer/Boulderer möchte ich meine Routen und Trainings spezifisch dokumentieren können, damit alle Aspekte meines Klettertrainings erfasst werden.

#### Acceptance Criteria

1. THE System SHALL Boulder-Routen mit Schwierigkeitsgraden (V-Scale, Font-Scale) unterstützen
2. WHEN Boulder-Training dokumentiert wird, THE System SHALL Anzahl Versuche bis zum Top erfassen
3. THE System SHALL Hangboard-Training mit Hold-Typen und -Größen unterstützen
4. THE System SHALL verschiedene Kletterarten (Bouldern, Sportklettern, Trad) unterscheiden
5. WHEN Kletter-Punkte berechnet werden, THE System SHALL Schwierigkeitsgrad und Erfolgsrate berücksichtigen

### Requirement 10: User Interface Integration

**User Story:** Als Nutzer möchte ich eine intuitive Benutzeroberfläche für alle neuen Funktionen haben, damit ich das System effizient nutzen kann.

#### Acceptance Criteria

1. THE System SHALL eine dedizierte Übungsverwaltungsseite bereitstellen
2. WHEN Workout-Templates verwaltet werden, THE System SHALL eine übersichtliche Template-Bibliothek anzeigen
3. THE System SHALL das bestehende Training-Formular um Übungssuche erweitern
4. WHEN neue Übungen angelegt werden, THE System SHALL einen geführten Erstellungsprozess bereitstellen
5. THE System SHALL alle neuen Funktionen in die bestehende Navigation integrieren