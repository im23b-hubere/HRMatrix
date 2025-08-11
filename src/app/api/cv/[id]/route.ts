/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function GET(
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

    // User und Company ID abrufen
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Unternehmen nicht gefunden" }, { status: 404 });
    }

    // CV mit Details abrufen
    const cv = await (prisma as any).cV.findFirst({
      where: {
        id: cvId,
        companyId: user.companyId
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        },
        jobPosting: {
          select: { id: true, title: true, description: true }
        },
        reviews: {
          include: {
            reviewer: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!cv) {
      return NextResponse.json({ error: "CV nicht gefunden" }, { status: 404 });
    }

    // Durchschnittsbewertungen berechnen
    const avgRating = cv.reviews.length > 0 
      ? cv.reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / cv.reviews.length 
      : null;

    const avgSkills = cv.reviews.length > 0 
      ? cv.reviews.reduce((sum: any, review: any) => sum + review.skills, 0) / cv.reviews.length 
      : null;

    const avgExperience = cv.reviews.length > 0 
      ? cv.reviews.reduce((sum: any, review: any) => sum + review.experience, 0) / cv.reviews.length 
      : null;

    const avgFit = cv.reviews.length > 0 
      ? cv.reviews.reduce((sum: any, review: any) => sum + review.fit, 0) / cv.reviews.length 
      : null;

    return NextResponse.json({
      success: true,
      cv: {
        id: cv.id,
        fileName: cv.fileName,
        originalName: cv.originalName,
        fileSize: cv.fileSize,
        fileType: cv.fileType,
        filePath: cv.filePath,
        status: cv.status,
        uploadedBy: cv.uploadedBy.name,
        jobPosting: cv.jobPosting,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        reviews: cv.reviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          skills: review.skills,
          experience: review.experience,
          fit: review.fit,
          comments: review.comments,
          status: review.status,
          reviewer: review.reviewer.name,
          createdAt: review.createdAt
        })),
        averages: {
          rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          skills: avgSkills ? Math.round(avgSkills * 10) / 10 : null,
          experience: avgExperience ? Math.round(avgExperience * 10) / 10 : null,
          fit: avgFit ? Math.round(avgFit * 10) / 10 : null
        },
        reviewCount: cv.reviews.length
      }
    });

  } catch (error) {
    console.error("CV Detail Fehler:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen der CV Details" }, { status: 500 });
  }
}
