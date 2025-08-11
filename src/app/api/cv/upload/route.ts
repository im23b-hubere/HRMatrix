import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      return NextResponse.json({ error: "Benutzer oder Unternehmen nicht gefunden" }, { status: 404 });
    }

    // FormData verarbeiten
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const jobPostingId = formData.get("jobPostingId") as string;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    // Dateityp validieren
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Nur PDF und DOCX Dateien sind erlaubt" }, { status: 400 });
    }

    // Dateigröße validieren (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Datei ist zu groß (max 10MB)" }, { status: 400 });
    }

    // Upload-Verzeichnis erstellen
    const uploadDir = join(process.cwd(), "public", "uploads", "cvs", user.companyId.toString());
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Datei speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // CV in Datenbank speichern
    const cv = await prisma.cV.create({
      data: {
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: `/uploads/cvs/${user.companyId}/${fileName}`,
        companyId: user.companyId,
        uploadedById: user.id,
        jobPostingId: jobPostingId ? parseInt(jobPostingId) : null,
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
