# HRMatrix - CV Management System

Ein modernes CV-Management-System für Unternehmen, entwickelt mit Next.js 15, Prisma und Tailwind CSS.

## 🚀 Features

- **CV Upload & Management** - Drag & Drop Upload für PDF/DOCX
- **Bewertungssystem** - 5-Sterne Bewertungen für Skills, Erfahrung und Passung
- **Status-Management** - CV Status verfolgen (Neu, In Bearbeitung, Shortlist, etc.)
- **Team-Management** - Benutzer und Rollen verwalten
- **Einladungssystem** - Neue Mitarbeiter per E-Mail einladen
- **Moderne UI** - Responsive Design mit Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM mit SQLite/PostgreSQL
- **Authentication**: NextAuth.js
- **File Upload**: Native File API
- **Deployment**: Vercel

## 📦 Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd HRMatrix_new
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Environment Variables setzen**
   ```bash
   # .env.local erstellen
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   RESEND_API_KEY="your-resend-api-key" # Optional für E-Mail
   ```

4. **Datenbank setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Development Server starten**
   ```bash
   npm run dev
   ```

## 🚀 Deployment auf Vercel

### 1. Vercel Account erstellen
- Gehe zu [vercel.com](https://vercel.com)
- Erstelle einen Account oder logge dich ein

### 2. Projekt importieren
- Klicke auf "New Project"
- Importiere dein GitHub Repository
- Wähle das HRMatrix Repository aus

### 3. Environment Variables setzen
In den Vercel Project Settings unter "Environment Variables":

```
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
RESEND_API_KEY=your-resend-api-key
```

### 4. Database Setup
Für Produktion empfehlen wir PostgreSQL:

1. **Vercel Postgres hinzufügen**
   - Gehe zu "Storage" in deinen Vercel Project Settings
   - Klicke "Create Database" → "Postgres"
   - Wähle einen Plan (Hobby ist kostenlos)

2. **DATABASE_URL setzen**
   - Kopiere die DATABASE_URL aus den Vercel Postgres Settings
   - Füge sie zu den Environment Variables hinzu

3. **Schema deployen**
   ```bash
   npx prisma db push
   ```

### 5. Deploy
- Klicke "Deploy" in Vercel
- Das Projekt wird automatisch gebaut und deployed

## 📁 Projektstruktur

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # NextAuth.js
│   │   ├── cv/                # CV Management APIs
│   │   └── invite/            # Einladungssystem
│   ├── dashboard/             # Haupt-Dashboard
│   │   ├── cv/                # CV Manager
│   │   └── profile/           # Benutzerprofile
│   ├── login/                 # Login-Seite
│   └── signup/                # Registrierung
├── lib/                       # Utilities
└── components/                # React Components
```

## 🔧 API Endpoints

### CV Management
- `GET /api/cv` - CV Liste abrufen
- `POST /api/cv/upload` - CV hochladen
- `GET /api/cv/[id]` - CV Details
- `PATCH /api/cv/[id]/status` - Status ändern
- `POST /api/cv/[id]/review` - Bewertung hinzufügen

### Authentication
- `POST /api/auth/signup` - Registrierung
- `GET /api/auth/providers` - Auth Provider

### Invitations
- `POST /api/invite` - Einladung senden
- `GET /api/invite/validate` - Token validieren

## 🎯 Nächste Schritte

- [ ] Stellenausschreibungen erstellen
- [ ] E-Mail-Benachrichtigungen
- [ ] Export-Funktionen
- [ ] Analytics Dashboard
- [ ] Mobile App

## 📄 License

MIT License - siehe LICENSE Datei für Details.

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

---

**Entwickelt mit ❤️ für moderne HR-Prozesse**
