---
title: "Events API"
---

# Events API

Job‑Endpoints für wöchentliche/monatliche Auswertungen und E‑Mail‑Dispatch.

**Auth:** über `EVENTS_CRON_SECRET` (Bearer Token).

## GET /api/events/emails/unsubscribe

Unsubscribe‑Link für Summary‑E-Mails.

**Query:** `token`

## POST /api/events/weekly

Trigger für wöchentliche Auswertung.

## POST /api/events/monthly

Trigger für monatliche Auswertung.

## POST /api/events/emails/dispatch

Dispatch queued E‑Mails.

## POST /api/events/cleanup

Cleanup für alte Daten/Jobs.
