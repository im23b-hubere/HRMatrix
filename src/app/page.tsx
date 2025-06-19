export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <section className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-lg p-8 sm:p-10 flex flex-col items-center gap-6 backdrop-blur-sm border border-gray-100 mt-12 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold text-gray-900">HRMatrix</span>
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3.5 6.5l-.5.5v2a2 2 0 0 1-4 0v-2l-.5-.5C6.5 13.5 5 11.5 5 9a7 7 0 0 1 7-7Zm0 2a5 5 0 0 0-5 5c0 1.7 1.1 3.2 3.1 5.1l.9.9.9-.9C15.9 12.2 17 10.7 17 9a5 5 0 0 0-5-5Zm-1 15h2a4 4 0 0 1 4 4H7a4 4 0 0 1 4-4Z"/>
            </svg>
          </span>
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
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold text-center border border-blue-200 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          >
            Account erstellen
          </a>
        </div>
      </section>

      <footer className="mt-12 text-gray-500 text-sm text-center pb-6">
        &copy; {new Date().getFullYear()} HRMatrix. Alle Rechte vorbehalten.
      </footer>
    </main>
  );
}
