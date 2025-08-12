/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id } = await params;
    const cvId = parseInt(id);

    if (isNaN(cvId)) {
      return NextResponse.json({ error: "Ungültige CV ID" }, { status: 400 });
    }

    // Request Body parsen
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status ist erforderlich" }, { status: 400 });
    }

    // User und Company ID abrufen
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Unternehmen nicht gefunden" }, { status: 404 });
    }

    // CV Status aktualisieren
    const updatedCV = await prisma.cv.update({
      where: {
        id: cvId,
        companyId: user.companyId
      },
      data: {
        status: status
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      cv: {
        id: updatedCV.id,
        status: updatedCV.status,
        originalName: updatedCV.originalName
      }
    });

  } catch (error) {
    console.error("CV Status Update Fehler:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Status" }, { status: 500 });
  }
}
