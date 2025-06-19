import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import AdminInviteSection from "./AdminInviteSection";
import AccountMenu from "./AccountMenu";
import type { AuthOptions } from "next-auth";
import Image from "next/image";

// Typ für User
interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId?: number;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as AuthOptions);
  const prisma = new PrismaClient();
  let users: DashboardUser[] = [];
  const user = session?.user as DashboardUser | null;
  if (user?.companyId) {
    users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true, email: true, role: true, companyId: true },
      orderBy: { name: "asc" },
    });
  }

  const companyId = user?.companyId ? Number(user.companyId) : undefined;
  const inviterName = user?.name ? String(user.name) : undefined;
  const inviterEmail = user?.email ? String(user.email) : undefined;

  if (!user) {
    return null; // oder Redirect zur Login-Seite
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
            {user?.role === "ADMIN" && companyId && inviterName && inviterEmail && (
              <AdminInviteSection companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
            )}
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
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
                        </span>
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