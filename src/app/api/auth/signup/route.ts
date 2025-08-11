import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { company, name, email, password } = await req.json();
    if (!company || !name || !email || !password) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }
    
    console.log("Starting registration for:", { company, name, email });
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({ error: "Datenbankverbindung fehlgeschlagen." }, { status: 500 });
    }
    
    // Firma suchen oder anlegen
    let dbCompany = await prisma.company.findUnique({ where: { name: company } });
    if (!dbCompany) {
      console.log("Creating new company:", company);
      dbCompany = await prisma.company.create({ data: { name: company } });
    }
    
    // Prüfen, wie viele User es für diese Firma gibt
    const userCount = await prisma.user.count({ where: { companyId: dbCompany.id } });
    const role = userCount === 0 ? 'ADMIN' : 'USER';
    
    // Prüfen, ob User mit E-Mail und Firma schon existiert
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        companyId: dbCompany.id,
      },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User existiert bereits für diese Firma." }, { status: 400 });
    }
    
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // User anlegen
    console.log("Creating user with role:", role);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId: dbCompany.id,
        role,
      },
    });
    
    console.log("Registration successful");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Spezifischere Fehlermeldungen
    if (error instanceof Error) {
      if (error.message.includes("DATABASE_URL")) {
        return NextResponse.json({ error: "Datenbankverbindung nicht konfiguriert." }, { status: 500 });
      }
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json({ error: "E-Mail oder Firmenname bereits vorhanden." }, { status: 400 });
      }
      if (error.message.includes("Connection")) {
        return NextResponse.json({ error: "Datenbank nicht erreichbar." }, { status: 500 });
      }
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return NextResponse.json({ error: "Datenbanktabellen nicht erstellt. Bitte Migration ausführen." }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: "Etwas ist schiefgelaufen." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 