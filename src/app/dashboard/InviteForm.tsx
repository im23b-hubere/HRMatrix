"use client";
import { useState } from "react";

export default function InviteForm({ companyId, inviterName, inviterEmail }: { companyId: number, inviterName: string, inviterEmail: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, companyId, inviterName, inviterEmail }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Einladung erfolgreich versendet!");
      setEmail("");
      setRole("USER");
    } else {
      setError(data.error || "Fehler beim Versenden der Einladung.");
    }
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@firma.de"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rolle
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer text-gray-900"
              disabled={loading}
            >
              <option value="USER" className="py-2">Mitarbeiter</option>
              <option value="ADMIN" className="py-2">Administrator</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-red-600 text-sm text-center font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-100">
          <p className="text-green-600 text-sm text-center font-medium">{success}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
              Einladung senden...
            </span>
          ) : "Einladung senden"}
        </button>
      </div>
    </form>
  );
} 