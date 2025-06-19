import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import AdminInviteSection from "./AdminInviteSection";
import type { AuthOptions } from "next-auth";

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      <section className="w-full max-w-4xl bg-white/95 rounded-2xl shadow-lg p-8 flex flex-col gap-6 backdrop-blur-sm border border-gray-100 animate-fade-in">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Übersicht aller Mitarbeiter in deinem Unternehmen</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-Mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
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
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {user?.role === "ADMIN" && companyId && inviterName && inviterEmail && (
          <div className="mt-6">
            <AdminInviteSection companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
          </div>
        )}
      </section>
    </main>
  );
} 