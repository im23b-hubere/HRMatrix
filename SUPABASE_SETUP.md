# Supabase Setup für HR Matrix

## 1. Supabase DATABASE_URL finden

1. Gehe zu deinem Supabase Dashboard: https://supabase.com/dashboard/project/kxahtphdfbxghbckanlf
2. Klicke auf **Settings** (Zahnrad-Icon) in der linken Seitenleiste
3. Wähle **Database** aus dem Menü
4. Scrolle runter zu **Connection string**
5. Wähle **URI** aus
6. Kopiere die **DATABASE_URL** (sie sieht so aus: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

## 2. Lokale .env Datei erstellen

Erstelle eine `.env` Datei im Root-Verzeichnis deines Projekts:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[DEIN-PASSWORT]@db.[DEIN-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dein-secret-key-hier"

# Resend API Key (optional)
RESEND_API_KEY="dein-resend-api-key"
```

## 3. Datenbank-Migrationen ausführen

Nachdem du die `.env` Datei erstellt hast:

```bash
# Prisma Client generieren
npx prisma generate

# Migration erstellen und ausführen
npx prisma migrate dev --name init

# Oder falls Migrationen nicht funktionieren:
npx prisma db push
```

## 4. Vercel Environment Variables setzen

Gehe zu deinem Vercel Dashboard und setze diese Environment Variables:

1. **DATABASE_URL**: Die gleiche URL wie in deiner lokalen .env
2. **NEXTAUTH_URL**: `https://hr-matrix-new.vercel.app`
3. **NEXTAUTH_SECRET**: Ein sicherer Secret Key (kann ein zufälliger String sein)

## 5. Supabase RLS (Row Level Security) konfigurieren

Falls du Row Level Security aktiviert hast, musst du Policies erstellen. Gehe zu deinem Supabase Dashboard:

1. **Authentication** > **Policies**
2. Erstelle Policies für jede Tabelle (Company, User, etc.)

### Beispiel Policy für Company Tabelle:
```sql
-- Erlaube allen authentifizierten Usern Zugriff auf Companies
CREATE POLICY "Enable read access for authenticated users" ON "Company"
FOR ALL USING (auth.role() = 'authenticated');
```

## 6. Testen

Nach dem Setup:

1. **Lokal testen**: `npm run dev` und gehe zu `http://localhost:3000`
2. **Vercel testen**: Deploy und teste `https://hr-matrix-new.vercel.app/api/test-db`

## Troubleshooting

### Fehler: "relation does not exist"
- Führe `npx prisma db push` aus
- Oder erstelle Migrationen mit `npx prisma migrate dev`

### Fehler: "connection refused"
- Prüfe die DATABASE_URL
- Stelle sicher, dass Supabase aktiv ist
- Prüfe Firewall-Einstellungen

### Fehler: "authentication failed"
- Prüfe das Passwort in der DATABASE_URL
- Stelle sicher, dass die Verbindung über SSL läuft

## Nächste Schritte

1. Erstelle die `.env` Datei mit deiner Supabase DATABASE_URL
2. Führe `npx prisma db push` aus
3. Setze die Environment Variables in Vercel
4. Deploye erneut
5. Teste die Firmenregistrierung
