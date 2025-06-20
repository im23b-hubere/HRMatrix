import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { getBaseUrl } from "@/lib/utils";

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
    // Token generieren
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h gültig
    // Einladung speichern
    await prisma.invitation.create({
      data: {
        email,
        token,
        companyId,
        role: role === "ADMIN" ? "ADMIN" : "USER",
        expiresAt,
        status: "PENDING",
      },
    });
    // E-Mail versenden
    const baseUrl = getBaseUrl();
    const inviteUrl = `${baseUrl}/signup/invite?token=${token}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Einladung zu HRMatrix von ${inviterName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Du wurdest zu HRMatrix eingeladen!</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">${inviterName} (${inviterEmail}) hat dich eingeladen, dem Unternehmen beizutreten.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Jetzt Account anlegen
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">Der Link ist 24 Stunden gültig.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #718096; font-size: 12px;">
            Falls du diese Einladung nicht erwartet hast, kannst du sie ignorieren.
          </p>
        </div>
      `
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Einladungsfehler:", error);
    return NextResponse.json({ error: "Etwas ist schiefgelaufen." }, { status: 500 });
  }
} 