import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, name, password } = await req.json();
    if (!token || !name || !password) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }
    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite || invite.status !== "PENDING" || new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Einladung ungültig oder abgelaufen." }, { status: 410 });
    }
    // Prüfen, ob User schon existiert
    const existingUser = await prisma.user.findFirst({ where: { email: invite.email, companyId: invite.companyId } });
    if (existingUser) {
      return NextResponse.json({ error: "User existiert bereits." }, { status: 409 });
    }
    // User anlegen
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name,
        password: hashed,
        companyId: invite.companyId,
        role: invite.role,
      },
    });
    // Einladung auf ACCEPTED setzen
    await prisma.invitation.update({ where: { token }, data: { status: "ACCEPTED" } });
    // Optional: User automatisch einloggen (hier: Session erstellen oder JWT zurückgeben)
    // TODO: Implementiere Login/Session Handling nach Bedarf
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Anlegen des Accounts." }, { status: 500 });
  }
} 