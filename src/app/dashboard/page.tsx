import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import AdminInviteSection from "./AdminInviteSection";
import AccountMenu from "./AccountMenu";
import type { AuthOptions } from "next-auth";
import Image from "next/image";
import Link from "next/link";

// Typ für User
interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId?: number;
}

export default async function DashboardPage() {
  let session;
  let users: DashboardUser[] = [];
  let user: DashboardUser | null = null;
  
  try {
    session = await getServerSession(authOptions as AuthOptions);
    user = session?.user as DashboardUser | null;
    
    if (user?.companyId) {
      users = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true, name: true, email: true, role: true, companyId: true },
        orderBy: { name: "asc" },
      });
    }
  } catch (error) {
    console.error("Session error:", error);
    // Bei Session-Fehlern zur Login-Seite weiterleiten
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session-Fehler</h1>
          <p className="text-gray-600 mb-4">Bitte melden Sie sich erneut an.</p>
          <a 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Zurück zum Login
          </a>
        </div>
      </div>
    );
  }

  const companyId = user?.companyId ? Number(user.companyId) : undefined;
  const inviterName = user?.name ? String(user.name) : undefined;
  const inviterEmail = user?.email ? String(user.email) : undefined;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nicht angemeldet</h1>
          <p className="text-gray-600 mb-4">Bitte melden Sie sich an, um das Dashboard zu sehen.</p>
          <a 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/Logo.png"
                alt="HRMatrix Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </div>
            <AccountMenu user={user} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">Team-Übersicht</h1>
              <p className="text-sm text-gray-600">Verwalte die Mitglieder deines Teams</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/cv"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CV Manager
              </Link>
              {user?.role === "ADMIN" && companyId && inviterName && inviterEmail && (
                <AdminInviteSection companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-Mail</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      <p className="text-sm">Keine Mitarbeiter gefunden</p>
                      <p className="text-xs mt-1">Nutze die Einladungsfunktion, um neue Mitarbeiter hinzuzufügen</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/profil/${user.id}`} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/profil/${user.id}`} className="text-sm text-gray-600 block w-full h-full">
                          {user.email}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/profil/${user.id}`} className="block w-full h-full">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 