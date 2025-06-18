export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 px-4">
      <section className="w-full max-w-2xl bg-white/70 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 backdrop-blur-xl border border-accent dark:border-gray-700 mt-12 animate-fade-in relative overflow-hidden">
        {/* Glasmorphism Effekt */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl z-0" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-primary dark:text-white tracking-tight drop-shadow-sm">HRMatrix</span>
            {/* Optional: Logo oder Icon */}
            <span className="inline-block bg-primary/10 text-primary rounded-full p-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3.5 6.5l-.5.5v2a2 2 0 0 1-4 0v-2l-.5-.5C6.5 13.5 5 11.5 5 9a7 7 0 0 1 7-7Zm0 2a5 5 0 0 0-5 5c0 1.7 1.1 3.2 3.1 5.1l.9.9.9-.9C15.9 12.2 17 10.7 17 9a5 5 0 0 0-5-5Zm-1 15h2a4 4 0 0 1 4 4H7a4 4 0 0 1 4-4Z"/></svg>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mt-2 mb-2">Die smarte HR-Plattform für Unternehmen</h1>
          <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-xl mb-4">
            Digitalisiere und vereinfache dein Personalmanagement. Sichere Multi-Tenant-Logins, moderne Benutzeroberfläche und effiziente Verwaltung – alles in einer Plattform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <a href="/login" className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:bg-secondary hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center">Login</a>
            <a href="/signup" className="px-8 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-primary text-primary font-bold text-lg shadow-lg hover:bg-secondary/10 hover:text-secondary hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-center">Registrieren</a>
          </div>
        </div>
      </section>
      <footer className="mt-12 text-gray-500 dark:text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} HRMatrix. All rights reserved.
      </footer>
    </main>
  );
}
