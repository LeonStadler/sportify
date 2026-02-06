# Interaktionen & Motion

## UI‑States

- Loading: Skeletons bevorzugt
- Empty: kurze Erklärung + CTA
- Error: klare Message + Handlung (Retry/Support)
- Success: kurze Bestätigung + ggf. CTA

Begründung: Nutzer sollen immer wissen, was passiert und was sie tun können.

## Focus & Keyboard

- Fokus‑Ring immer sichtbar
- Tastaturbedienung muss möglich bleiben

## Motion

Basiseinstellungen:

- Globale Transitions: 100ms (Farbe/Border/Text)
- Accordion‑Animationen: 200ms
- Landing Page: animierte Gradients/Scroll‑Indikatoren

Regeln:

- `prefers-reduced-motion` respektieren
- Motion dient Orientierung, nicht Dekoration
- Keine Animation ohne Funktion (d. h. keine rein dekorativen Loops)
