import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Unternehmen nicht gefunden" }, { status: 404 });
    }

    const cvId = parseInt(params.id);
    if (isNaN(cvId)) {
      return NextResponse.json({ error: "Ungültige CV ID" }, { status: 400 });
    }

    const { status } = await request.json();

    // Status validieren
    const validStatuses = ["NEW", "IN_REVIEW", "SHORTLISTED", "INTERVIEWED", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
    }

    // CV Status aktualisieren
    const updatedCV = await prisma.cV.update({
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
