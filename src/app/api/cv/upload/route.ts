/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // User und Company ID abrufen
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Unternehmen nicht gefunden" }, { status: 404 });
    }

    // FormData parsen
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    // Datei-Validierung
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Nur PDF und Word-Dateien sind erlaubt" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Datei ist zu groß (max. 10MB)" }, { status: 400 });
    }

    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Lokale Dateispeicherung (temporäre Lösung)
    // TODO: Supabase Storage Bucket konfigurieren für Produktion
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Erstelle Upload-Verzeichnis falls es nicht existiert
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs', user.companyId.toString());
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Speichere Datei lokal
    const localFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(localFilePath, buffer);
    
    // Verwende lokalen Pfad für Dateispeicherung
    const filePath = `/uploads/cvs/${user.companyId}/${fileName}`;

    // CV in Datenbank speichern
    const cv = await prisma.cv.create({
      data: {
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath, // Lokaler Dateipfad
        companyId: user.companyId,
        uploadedById: user.id,
        jobPostingId: null, // No job posting ID for now, as it's not in the form data
        status: "NEW"
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        },
        jobPosting: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      cv: {
        id: cv.id,
        fileName: cv.fileName,
        originalName: cv.originalName,
        fileSize: cv.fileSize,
        status: cv.status,
        uploadedBy: cv.uploadedBy.name,
        jobPosting: cv.jobPosting?.title,
        createdAt: cv.createdAt
      }
    });

  } catch (error) {
    console.error("CV Upload Fehler:", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}
