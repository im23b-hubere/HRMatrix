import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  
  console.log("🔍 Validating invitation token:", token);
  
  if (!token) {
    console.log("❌ No token provided");
    return NextResponse.json({ error: "Kein Token angegeben." }, { status: 400 });
  }
  
  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { company: true },
  });
  
  console.log("📧 Found invitation:", invite ? {
    id: invite.id,
    email: invite.email,
    status: invite.status,
    expiresAt: invite.expiresAt,
    isExpired: new Date(invite.expiresAt) < new Date()
  } : "NOT FOUND");
  
  if (!invite) {
    console.log("❌ Invitation not found in database");
    return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 });
  }
  
  if (invite.status !== "PENDING" || new Date(invite.expiresAt) < new Date()) {
    console.log("❌ Invitation invalid:", {
      status: invite.status,
      expiresAt: invite.expiresAt,
      isExpired: new Date(invite.expiresAt) < new Date()
    });
    return NextResponse.json({ error: "Einladung ist abgelaufen oder bereits angenommen." }, { status: 410 });
  }
  
  console.log("✅ Invitation is valid");
  return NextResponse.json({ invite: { email: invite.email, company: { name: invite.company.name } } });
}
