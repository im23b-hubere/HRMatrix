# Deployment Fix für HR Matrix

## Problem
Die Anwendung zeigt 500 Internal Server Errors beim Firmenregistrierung auf der deployed Vercel Domain.

## Ursache
Die Datenbank-Migrationen wurden nicht korrekt auf Vercel ausgeführt, wodurch die Tabellen nicht existieren.

## Lösung

### 1. Vercel Environment Variables prüfen
Stelle sicher, dass folgende Environment Variables in Vercel gesetzt sind:
- `DATABASE_URL` - PostgreSQL Verbindungsstring
- `NEXTAUTH_URL` - https://hr-matrix-new.vercel.app
- `NEXTAUTH_SECRET` - Ein sicherer Secret Key

### 2. Datenbank-Migrationen ausführen
Führe folgende Schritte aus:

1. **Lokale Migration erstellen:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Migration auf Vercel deployen:**
   - Gehe zu Vercel Dashboard
   - Wähle dein Projekt "hr-matrix-new"
   - Gehe zu "Deployments"
   - Klicke auf "Redeploy" oder erstelle ein neues Deployment

### 3. Datenbank-Verbindung testen
Nach dem Deployment kannst du die Datenbank-Verbindung testen:
```
https://hr-matrix-new.vercel.app/api/test-db
```

### 4. Alternative: Manuelle Datenbank-Synchronisation
Falls Migrationen nicht funktionieren, verwende:
```bash
npx prisma db push
```

## Änderungen in diesem Fix

1. **vercel.json**: Build-Command erweitert um `npx prisma migrate deploy`
2. **prisma.ts**: Verbesserte Fehlerbehandlung und Production-Konfiguration
3. **signup/route.ts**: Bessere Fehlerbehandlung und Datenbankverbindungstest
4. **test-db/route.ts**: Neuer Endpoint zum Testen der Datenbankverbindung

## Nächste Schritte
1. Committe diese Änderungen
2. Pushe zu GitHub
3. Vercel wird automatisch neu deployen
4. Teste die Firmenregistrierung erneut

## Troubleshooting
Falls das Problem weiterhin besteht:
1. Prüfe die Vercel Logs auf spezifische Fehlermeldungen
2. Teste die Datenbankverbindung mit `/api/test-db`
3. Stelle sicher, dass die PostgreSQL-Datenbank erreichbar ist
4. Prüfe, ob alle Environment Variables korrekt gesetzt sind
