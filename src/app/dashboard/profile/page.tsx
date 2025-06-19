import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import type { AuthOptions } from "next-auth";
import ProfileForm from "./ProfileForm";
import Link from "next/link";

interface ProfileUser {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number;
  company: {
    name: string;
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions as AuthOptions);
  const prisma = new PrismaClient();
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: {
          name: true
        }
      }
    }
  }) as ProfileUser | null;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Arrow */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            aria-label="Zurück zum Dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Zurück</span>
          </Link>
        </div>
        {/* Header Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 bg-opacity-10 flex items-center justify-center text-blue-600 text-3xl font-semibold border border-blue-100 shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Profil</h1>
            <p className="text-gray-500">Verwalte deine persönlichen Informationen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <ProfileForm user={user} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Firmeninformationen
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Firma</dt>
                  <dd className="text-sm font-medium text-gray-900">{user.company.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Rolle</dt>
                  <dd>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Sicherheit
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Passwort ändern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 