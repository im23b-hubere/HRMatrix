"use client";
import InviteForm from "./InviteForm";
import { useState } from "react";

export default function AdminInviteSection({ companyId, inviterName, inviterEmail }: { companyId: number, inviterName: string, inviterEmail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full flex flex-col items-end">
      <button
        onClick={() => setOpen(true)}
        className="mb-4 px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-secondary hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        Mitarbeiter einladen
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 w-full max-w-xl relative animate-fade-in flex flex-col gap-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary text-3xl font-bold focus:outline-none"
              aria-label="Schließen"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-4 text-center">Mitarbeiter einladen</h2>
            <InviteForm companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
          </div>
        </div>
      )}
    </div>
  );
} 