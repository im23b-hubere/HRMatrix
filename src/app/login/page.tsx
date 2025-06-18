"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fehler von NextAuth (z.B. falsche Credentials)
  const nextAuthError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      company,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Login fehlgeschlagen. Bitte prüfe deine Eingaben.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl border border-accent dark:border-gray-700 flex flex-col gap-8 animate-fade-in relative overflow-hidden">
        {/* Glasmorphism Effekt */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl z-0" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col gap-6"
          aria-label="Login Formular"
        >
          <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 text-center tracking-tight drop-shadow-sm">Login für Firmen</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4 text-base font-medium">Melde dich mit deinem Firmen-Account an, um fortzufahren.</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="company" className="font-semibold text-gray-800 dark:text-gray-200">Firmenname</label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              required
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="rounded-xl px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-lg shadow-inner"
              placeholder="z.B. Acme GmbH"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-gray-800 dark:text-gray-200">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-lg shadow-inner"
              placeholder="E-Mail-Adresse"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-gray-800 dark:text-gray-200">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-lg shadow-inner"
              placeholder="Passwort"
              disabled={loading}
            />
          </div>
          {(error || nextAuthError) && (
            <div className="text-red-600 text-sm text-center animate-shake font-semibold">{error || "Login fehlgeschlagen. Bitte prüfe deine Eingaben."}</div>
          )}
          <button
            type="submit"
            className="mt-2 py-3 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:bg-secondary hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                Einloggen...
              </span>
            ) : "Login"}
          </button>
          <div className="text-center text-sm mt-2 text-gray-700 dark:text-gray-300">
            Noch kein Account?{' '}
            <a href="/signup" className="text-primary underline hover:text-secondary transition-colors font-semibold">Registrieren</a>
          </div>
        </form>
      </div>
    </main>
  );
} 