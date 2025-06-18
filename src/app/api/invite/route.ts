import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, role, companyId, inviterName, inviterEmail } = await req.json();
    if (!email || !companyId || !inviterName || !inviterEmail) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }
    // Prüfen, ob User schon existiert
    const existingUser = await prisma.user.findFirst({ where: { email, companyId } });
    if (existingUser) {
      return NextResponse.json({ error: "User existiert bereits." }, { status: 400 });
    }
    // Prüfen, ob Einladung schon offen ist
    const openInvite = await prisma.invitation.findFirst({ where: { email, companyId, status: "PENDING" } });
    if (openInvite) {
      return NextResponse.json({ error: "Für diese E-Mail existiert bereits eine offene Einladung." }, { status: 400 });
    }
    // Token generieren
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h gültig
    // Einladung speichern
    await prisma.invitation.create({
      data: {
        email,
        token,
        companyId,
        role: role === "ADMIN" ? Role.ADMIN : Role.USER,
        expiresAt,
      },
    });
    // E-Mail versenden
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/signup/invite?token=${token}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Einladung zu HRMatrix von ${inviterName}`,
      html: `<h2>Du wurdest zu HRMatrix eingeladen!</h2>
        <p>${inviterName} (${inviterEmail}) hat dich eingeladen, dem Unternehmen beizutreten.</p>
        <p><a href="${inviteUrl}" style="background:#14386B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Jetzt Account anlegen</a></p>
        <p>Der Link ist 24 Stunden gültig.</p>`
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Versenden der Einladung." }, { status: 500 });
  }
} 