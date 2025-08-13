/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';

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
    const filePath = `${user.companyId}/${fileName}`;

    // Supabase Client initialisieren
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase Konfiguration fehlt" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Datei zu Supabase Storage hochladen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Upload Fehler:", uploadError);
      return NextResponse.json({ error: "Datei-Upload fehlgeschlagen" }, { status: 500 });
    }

    // Öffentliche URL generieren
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath);

    // CV in Datenbank speichern
    const cv = await prisma.cv.create({
      data: {
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: publicUrl, // Supabase URL
        companyId: user.companyId,
        uploadedById: user.id,
        jobPostingId: null,
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
