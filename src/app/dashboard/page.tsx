import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import React, { useState } from "react";
import type { AuthOptions } from "next-auth";
import InviteForm from "./InviteForm";
import AdminInviteSection from "./AdminInviteSection";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as AuthOptions);
  const prisma = new PrismaClient();
  let users = [];
  const user = session?.user as any;
  if (user?.companyId) {
    users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
  }

  // Props explizit extrahieren
  const companyId = user?.companyId ? Number(user.companyId) : undefined;
  const inviterName = user?.name ? String(user.name) : undefined;
  const inviterEmail = user?.email ? String(user.email) : undefined;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 px-4">
      <section className="w-full max-w-2xl bg-white/70 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 backdrop-blur-xl border border-accent dark:border-gray-700 mt-12 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl z-0" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-white mt-2 mb-2">Willkommen im Dashboard!</h1>
          <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-xl mb-4">
            Du bist jetzt eingeloggt. Hier siehst du alle User deiner Firma:
          </p>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm rounded-xl overflow-hidden shadow-md bg-white/90 dark:bg-gray-900/80">
              <thead>
                <tr className="bg-accent dark:bg-gray-800">
                  <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-200">Name</th>
                  <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-200">E-Mail</th>
                  <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-200">Rolle</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Keine User gefunden.</td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="border-b border-accent/40 dark:border-gray-700 hover:bg-accent/30 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{user.email}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200 uppercase tracking-wide">{user.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <pre className="bg-gray-900 text-yellow-300 p-2 rounded mb-2 text-xs max-w-full overflow-x-auto">{JSON.stringify(user, null, 2)}</pre>
          {user?.role === "ADMIN" && companyId && inviterName && inviterEmail && (
            <AdminInviteSection companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
          )}
        </div>
      </section>
    </main>
  );
} 