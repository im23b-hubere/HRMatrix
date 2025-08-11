import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.length < 2) {
      return NextResponse.json(
        { error: "Name muss mindestens 2 Zeichen lang sein" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
} 