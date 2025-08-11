import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    // Test connection
    await prisma.$connect();
    console.log("Database connection successful");
    
    // Test if tables exist by trying to count companies
    const companyCount = await prisma.company.count();
    console.log("Company count:", companyCount);
    
    // Test if we can create a test company
    const testCompany = await prisma.company.create({
      data: { name: `test-${Date.now()}` }
    });
    console.log("Test company created:", testCompany.id);
    
    // Clean up test company
    await prisma.company.delete({
      where: { id: testCompany.id }
    });
    console.log("Test company cleaned up");
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection and operations working correctly",
      companyCount 
    });
  } catch (error) {
    console.error("Database test failed:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
