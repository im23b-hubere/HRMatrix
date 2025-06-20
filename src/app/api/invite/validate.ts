import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Kein Token angegeben." }, { status: 400 });
  }
  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { company: true },
  });
  if (!invite) {
    return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 });
  }
  if (invite.status !== "PENDING" || new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Einladung ist abgelaufen oder bereits angenommen." }, { status: 410 });
  }
  return NextResponse.json({ invite: { email: invite.email, company: { name: invite.company.name } } });
} 