import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { getBaseUrl } from "@/lib/utils";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, role, companyId, inviterName, inviterEmail } = await req.json();
    
    // Validierung
    if (!email || !companyId || !inviterName || !inviterEmail) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }

    // Prüfen, ob User schon existiert
    const existingUser = await prisma.user.findFirst({ 
      where: { email, companyId } 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "User existiert bereits." }, { status: 400 });
    }

    // Company-Name für E-Mail abrufen
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    // Token generieren
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h gültig
    
    // Einladung speichern
    const invitation = await prisma.invitation.create({
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
    
    const emailResult = await sendInvitationEmail({
      email,
      inviterName,
      inviterEmail,
      inviteUrl,
      companyName: company?.name
    });

    if (!emailResult.success) {
      console.warn('⚠️ E-Mail konnte nicht versendet werden:', emailResult.error);
      // Einladung trotz E-Mail-Fehler erfolgreich erstellen
      return NextResponse.json({ 
        success: true, 
        warning: "Einladung erstellt, aber E-Mail konnte nicht versendet werden. Bitte manuell versenden.",
        inviteUrl 
      });
    }

    console.log('✅ Einladung erfolgreich erstellt und E-Mail versendet:', {
      email,
      invitationId: invitation.id,
      emailResult: emailResult.data
    });

    return NextResponse.json({ 
      success: true, 
      message: "Einladung erfolgreich versendet" 
    });

  } catch (error) {
    console.error("❌ Einladungsfehler:", error);
    return NextResponse.json({ error: "Etwas ist schiefgelaufen." }, { status: 500 });
  }
} 