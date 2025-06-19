"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginPage() {
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
      router.push("/dashboard");
    } else {
      setError("Login fehlgeschlagen. Bitte prüfe deine Eingaben.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      {/* Back Arrow */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
          aria-label="Zurück zur Startseite"
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

      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100 flex flex-col gap-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Willkommen zurück</h1>
          <p className="text-gray-600 text-sm">Melde dich mit deinem Firmen-Account an</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login Formular">
          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Firmenname
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Ihre Firma"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="name@firma.de"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          {(error || nextAuthError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-red-600 text-sm text-center font-medium">
                {error || "Login fehlgeschlagen. Bitte prüfe deine Eingaben."}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
                Einloggen...
              </span>
            ) : "Anmelden"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Noch kein Account?{' '}
            <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Jetzt registrieren
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
} 