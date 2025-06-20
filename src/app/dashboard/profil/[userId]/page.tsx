import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AccountMenu from "../../AccountMenu";
import type { FC } from "react";

type UserProfilePageProps = {
  params: { userId: string };
};

// Hilfsfunktion zum Abrufen von Benutzerdaten
async function getUserData(userId: number, companyId: number) {
  const userProfile = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId: companyId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return userProfile;
}

const UserProfilePage: FC<UserProfilePageProps> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  
  // Session- und Benutzer-ID-Validierung
  const sessionUser = session?.user as { id: string, companyId?: number, name?: string, email?: string, role?: string } | undefined;
  if (!sessionUser?.companyId) {
    redirect("/login");
  }
  
  const userId = parseInt(params.userId, 10);
  if (isNaN(userId)) {
    notFound();
  }

  // Benutzerdaten abrufen
  const userProfile = await getUserData(userId, sessionUser.companyId);

  // Wenn Benutzer nicht gefunden wurde, 404-Seite anzeigen
  if (!userProfile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="HRMatrix Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </Link>
            {sessionUser?.name && sessionUser.email && sessionUser.role && <AccountMenu user={{name: sessionUser.name, email: sessionUser.email, role: sessionUser.role}} />}
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100 animate-fade-in">
          {/* Zurück-Button */}
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-6 inline-block">
            &larr; Zurück zur Übersicht
          </Link>
          
          {/* Profil-Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
              {userProfile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
              <p className="text-gray-500">{userProfile.email}</p>
            </div>
          </div>
          
          {/* Profildetails */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mitarbeiterinformationen</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500">Voller Name</dt>
                <dd className="mt-1 text-base text-gray-900">{userProfile.name}</dd>
              </div>
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500">E-Mail Adresse</dt>
                <dd className="mt-1 text-base text-gray-900">{userProfile.email}</dd>
              </div>
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rolle</dt>
                <dd className="mt-1 text-base text-gray-900">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userProfile.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {userProfile.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
                  </span>
                </dd>
              </div>
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-500">Beigetreten am</dt>
                <dd className="mt-1 text-base text-gray-900">{new Date(userProfile.createdAt).toLocaleDateString('de-DE')}</dd>
              </div>
            </dl>
          </div>

          {/* Platzhalter für zukünftige CV-Funktion */}
          <div className="border-t border-gray-200 mt-8 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Lebenslauf & Dokumente</h2>
            <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl p-8">
              <p>Hier können bald Lebensläufe hochgeladen und analysiert werden.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default UserProfilePage; 