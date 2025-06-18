export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 px-4">
      <section className="w-full max-w-2xl bg-white/70 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 backdrop-blur-xl border border-accent dark:border-gray-700 mt-12 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl z-0" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-white mt-2 mb-2">Willkommen im Dashboard!</h1>
          <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-xl mb-4">
            Du bist jetzt eingeloggt. Hier kannst du deine HR-Daten verwalten und alle Funktionen der Plattform nutzen.
          </p>
        </div>
      </section>
    </main>
  );
} 