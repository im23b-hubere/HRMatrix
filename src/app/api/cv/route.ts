import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    // Query-Parameter extrahieren
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobPostingId = searchParams.get("jobPostingId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    // Filter erstellen
    const where: any = {
      companyId: user.companyId
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (jobPostingId) {
      where.jobPostingId = parseInt(jobPostingId);
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { uploadedBy: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    // CVs abrufen
    const [cvs, total] = await Promise.all([
      prisma.cv.findMany({
        where,
        include: {
          uploadedBy: {
            select: { name: true, email: true }
          },
          jobPosting: {
            select: { title: true }
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.cv.count({ where })
    ]);

    // Durchschnittsbewertung berechnen
    const cvsWithRating = cvs.map(cv => {
      const avgRating = cv.reviews.length > 0 
        ? cv.reviews.reduce((sum, review) => sum + review.rating, 0) / cv.reviews.length 
        : null;
      
      return {
        id: cv.id,
        fileName: cv.fileName,
        originalName: cv.originalName,
        fileSize: cv.fileSize,
        fileType: cv.fileType,
        filePath: cv.filePath,
        status: cv.status,
        uploadedBy: cv.uploadedBy.name,
        jobPosting: cv.jobPosting?.title,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: cv.reviews.length,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      cvs: cvsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("CV Liste Fehler:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen der CVs" }, { status: 500 });
  }
}
