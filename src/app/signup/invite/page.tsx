"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type InviteInfo = {
  email: string;
  company: { name: string };
};

function InviteSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [form, setForm] = useState({ name: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Einladung validieren
  useEffect(() => {
    if (!token) {
      setError("Kein Einladungstoken gefunden.");
      setLoading(false);
      return;
    }
    fetch(`/api/invite/validate?token=${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setInvite(data.invite as InviteInfo);
        setLoading(false);
      })
      .catch(() => {
        setError("Die Einladung ist ungültig oder abgelaufen.");
        setLoading(false);
      });
  }, [token]);

  // Formular-Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Fehler beim Anlegen des Accounts.");
      } else {
        setError("Fehler beim Anlegen des Accounts.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
        {loading ? (
          <div className="animate-pulse text-center py-12 text-gray-400">Lade Einladung...</div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-12">{error}</div>
        ) : success ? (
          <div className="text-center text-green-600 font-semibold py-12">
            Account erfolgreich erstellt!<br />Du wirst weitergeleitet...
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Einladung annehmen</h1>
            <p className="text-gray-600 text-center mb-6">
              Du wurdest eingeladen zu <span className="font-semibold">{invite?.company?.name}</span>.<br />Bitte vervollständige deinen Account.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none bg-white/70 shadow-sm"
                  placeholder="Dein Name"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Passwort</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none bg-white/70 shadow-sm"
                  placeholder="Passwort wählen"
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all duration-150 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Account wird erstellt..." : "Account anlegen & einloggen"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function InviteSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <div className="animate-pulse text-center py-12 text-gray-400">Lade Einladung...</div>
        </div>
      </div>
    }>
      <InviteSignup />
    </Suspense>
  )
} 