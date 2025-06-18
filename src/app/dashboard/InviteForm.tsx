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
    <form onSubmit={handleInvite} className="w-full flex flex-col sm:flex-row gap-2 items-center mt-6 mb-2">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="E-Mail-Adresse einladen"
        className="flex-1 rounded-xl px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-inner"
        disabled={loading}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="rounded-xl px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-inner"
        disabled={loading}
      >
        <option value="USER">Mitarbeiter</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="submit"
        className="px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-secondary hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Senden..." : "Einladen"}
      </button>
      {success && <span className="ml-4 text-green-600 font-semibold">{success}</span>}
      {error && <span className="ml-4 text-red-600 font-semibold">{error}</span>}
    </form>
  );
} 