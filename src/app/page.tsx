import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <section className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-lg p-8 sm:p-10 flex flex-col items-center gap-6 backdrop-blur-sm border border-gray-100 mt-12 animate-fade-in">
        <div className="flex flex-col items-center mb-2">
          <Image
            src="/Logo.png"
            alt="HRMatrix Logo"
            width={400}
            height={400}
            className="mb-2"
            priority
          />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Die smarte HR-Plattform für Unternehmen
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Digitalisiere und vereinfache dein Personalmanagement. Sichere Multi-Tenant-Logins, moderne Benutzeroberfläche und effiziente Verwaltung – alles in einer Plattform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-6">
          <a 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold text-center shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          >
            Anmelden
          </a>
          <a 
            href="/signup/company" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold text-center border border-blue-200 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          >
            Firma registrieren
          </a>
        </div>
      </section>

      <footer className="mt-12 text-gray-500 text-sm text-center pb-6">
        &copy; {new Date().getFullYear()} HRMatrix. Alle Rechte vorbehalten.
      </footer>
    </main>
  );
}
