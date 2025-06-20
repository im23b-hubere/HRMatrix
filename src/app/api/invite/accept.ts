import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, name, password } = await req.json();
    if (!token || !name || !password) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }
    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite || invite.status !== "PENDING" || new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Einladung ist abgelaufen oder bereits angenommen." }, { status: 410 });
    }
    // Prüfen, ob User schon existiert
    const existingUser = await prisma.user.findFirst({ where: { email: invite.email, companyId: invite.companyId } });
    if (existingUser) {
      return NextResponse.json({ error: "User existiert bereits." }, { status: 409 });
    }
    // User erstellen und Einladung updaten
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: invite.email,
          name,
          password: hashedPassword,
          companyId: invite.companyId,
          role: invite.role,
        },
      });
      await tx.invitation.update({ where: { token }, data: { status: "ACCEPTED" } });
    });
    // Optional: User automatisch einloggen (hier: Session erstellen oder JWT zurückgeben)
    // TODO: Implementiere Login/Session Handling nach Bedarf
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fehler beim Anlegen des Accounts." }, { status: 500 });
  }
} 