# Supabase Setup für HR Matrix

## 1. Supabase DATABASE_URL finden

1. Gehe zu deinem Supabase Dashboard: https://supabase.com/dashboard/project/kxahtphdfbxghbckanlf
2. Klicke auf **Settings** (Zahnrad-Icon) in der linken Seitenleiste
3. Wähle **Database** aus dem Menü
4. Scrolle runter zu **Connection string**
5. Wähle **URI** aus
6. Kopiere die **DATABASE_URL** (sie sieht so aus: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

## 2. Supabase Storage Bucket erstellen

1. Gehe zu deinem Supabase Dashboard
2. Klicke auf **Storage** in der linken Seitenleiste
3. Klicke auf **"New bucket"**
4. Gib als Namen **"cvs"** ein
5. Wähle **"Public"** aus (damit die CVs öffentlich zugänglich sind)
6. Klicke auf **"Create bucket"**

## 3. Storage Policies konfigurieren

Nach der Bucket-Erstellung musst du Policies erstellen:

1. Klicke auf den **"cvs"** Bucket
2. Gehe zu **"Policies"** Tab
3. Klicke auf **"New Policy"**
4. Wähle **"Create a policy from scratch"**
5. Erstelle diese Policies:

### Policy 1: Upload erlauben
```sql
-- Erlaube authentifizierten Usern CVs hochzuladen
CREATE POLICY "Allow authenticated users to upload CVs" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'cvs');
```

### Policy 2: Download erlauben
```sql
-- Erlaube allen CVs herunterzuladen (öffentlich)
CREATE POLICY "Allow public access to CVs" ON storage.objects
FOR SELECT USING (bucket_id = 'cvs');
```

## 4. Service Role Key finden

1. Gehe zu **Settings** > **API**
2. Kopiere den **"service_role"** Key (nicht der anon key!)
3. Dieser wird für Server-seitige Uploads benötigt

## 5. Lokale .env Datei erstellen

Erstelle eine `.env` Datei im Root-Verzeichnis deines Projekts:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[DEIN-PASSWORT]@db.[DEIN-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[DEIN-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[DEIN-SERVICE-ROLE-KEY]"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dein-secret-key-hier"

# Resend API Key (optional)
RESEND_API_KEY="dein-resend-api-key"
```

## 6. Datenbank-Migrationen ausführen

Nachdem du die `.env` Datei erstellt hast:

```bash
# Prisma Client generieren
npx prisma generate

# Migration erstellen und ausführen
npx prisma migrate dev --name init

# Oder falls Migrationen nicht funktionieren:
npx prisma db push
```

## 7. Vercel Environment Variables setzen

Gehe zu deinem Vercel Dashboard und setze diese Environment Variables:

1. **DATABASE_URL**: Die gleiche URL wie in deiner lokalen .env
2. **NEXT_PUBLIC_SUPABASE_URL**: Deine Supabase URL
3. **SUPABASE_SERVICE_ROLE_KEY**: Dein Service Role Key
4. **NEXTAUTH_URL**: `https://hr-matrix.online`
5. **NEXTAUTH_SECRET**: Ein sicherer Secret Key (kann ein zufälliger String sein)

## 8. Supabase RLS (Row Level Security) konfigurieren

Falls du Row Level Security aktiviert hast, musst du Policies erstellen. Gehe zu deinem Supabase Dashboard:

1. **Authentication** > **Policies**
2. Erstelle Policies für jede Tabelle (Company, User, etc.)

### Beispiel Policy für Company Tabelle:
```sql
-- Erlaube allen authentifizierten Usern Zugriff auf Companies
CREATE POLICY "Enable read access for authenticated users" ON "Company"
FOR ALL USING (auth.role() = 'authenticated');
```

## 9. Testen

Nach dem Setup:

1. **Lokal testen**: `npm run dev` und gehe zu `http://localhost:3000`
2. **Vercel testen**: Deploy und teste `https://hr-matrix.online/api/test-db`
3. **CV Upload testen**: Versuche eine CV hochzuladen

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

### Fehler: "CV Upload Fehler: ENOENT"
- Stelle sicher, dass der Supabase Storage Bucket "cvs" existiert
- Prüfe die Storage Policies
- Stelle sicher, dass SUPABASE_SERVICE_ROLE_KEY gesetzt ist

### Fehler: "Supabase Konfiguration fehlt"
- Prüfe NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in Vercel
- Stelle sicher, dass die Environment Variables korrekt gesetzt sind

## Nächste Schritte

1. Erstelle die `.env` Datei mit deiner Supabase DATABASE_URL
2. Erstelle den Supabase Storage Bucket "cvs"
3. Konfiguriere die Storage Policies
4. Setze alle Environment Variables in Vercel
5. Deploye erneut
6. Teste die CV-Upload-Funktion
