import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Unternehmen nicht gefunden" }, { status: 404 });
    }

    const { id } = await params;
    const cvId = parseInt(id);
    if (isNaN(cvId)) {
      return NextResponse.json({ error: "Ungültige CV ID" }, { status: 400 });
    }

    const { rating, skills, experience, fit, comments } = await request.json();

    // Validierung
    if (!rating || !skills || !experience || !fit) {
      return NextResponse.json({ error: "Alle Bewertungsfelder sind erforderlich" }, { status: 400 });
    }

    if (rating < 1 || rating > 5 || skills < 1 || skills > 5 || experience < 1 || experience > 5 || fit < 1 || fit > 5) {
      return NextResponse.json({ error: "Bewertungen müssen zwischen 1 und 5 liegen" }, { status: 400 });
    }

    // Prüfen, ob bereits eine Bewertung von diesem User existiert
    const existingReview = await prisma.cVReview.findFirst({
      where: {
        cvId: cvId,
        reviewerId: user.id
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: "Du hast diese CV bereits bewertet" }, { status: 400 });
    }

    // Bewertung erstellen
    const review = await prisma.cVReview.create({
      data: {
        cvId: cvId,
        reviewerId: user.id,
        rating: rating,
        skills: skills,
        experience: experience,
        fit: fit,
        comments: comments || null,
        status: "COMPLETED"
      },
      include: {
        reviewer: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        skills: review.skills,
        experience: review.experience,
        fit: review.fit,
        comments: review.comments,
        reviewer: review.reviewer.name,
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error("CV Review Fehler:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen der Bewertung" }, { status: 500 });
  }
}
