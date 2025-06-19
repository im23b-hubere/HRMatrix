import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import type { AuthOptions } from "next-auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
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

    const prisma = new PrismaClient();
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