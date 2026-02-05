---
title: "Admin API"
---

# Admin API

Admin‑Endpunkte. Alle Endpunkte erfordern Auth und Admin‑Rolle.

## GET /api/admin/users

Listet Benutzer (Admin‑Übersicht).

## GET /api/admin/invitations

Listet Einladungen.

## GET /api/admin/monitoring

Monitoring‑Status (Jobs, Queue, Alerts).

## POST /api/admin/monitoring/cleanup-jobs

Bereinigt Job‑Runs.

## POST /api/admin/monitoring/test-alert

Testet Alert‑Versand.
