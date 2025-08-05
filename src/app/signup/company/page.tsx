"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanySignupPage() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validierung
    if (form.password !== form.confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registrierung fehlgeschlagen.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?message=registration-success");
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Firma registrieren</h1>
          <p className="text-gray-600 text-sm">Erstelle dein Unternehmen und werde Administrator</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Registrierung erfolgreich!</h2>
            <p className="text-gray-600">Du wirst zur Anmeldeseite weitergeleitet...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Registrierungsformular">
            <div className="space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Firmenname *
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 text-base"
                  placeholder="Ihre Firma GmbH"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ihr Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 text-base"
                  placeholder="Max Mustermann"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 text-base"
                  placeholder="max@firma.de"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 text-base"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort bestätigen *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 text-base"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
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
                  Registriere...
                </span>
              ) : "Firma registrieren"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Bereits registriert?{' '}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Jetzt anmelden
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
} 