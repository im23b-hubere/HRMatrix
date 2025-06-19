"use client";
import InviteForm from "./InviteForm";
import { useState } from "react";

export default function AdminInviteSection({ companyId, inviterName, inviterEmail }: { companyId: number, inviterName: string, inviterEmail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full flex flex-col items-end">
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
      >
        + Mitarbeiter einladen
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl relative animate-fade-in">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Schließen"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mitarbeiter einladen</h2>
              <p className="text-gray-600 text-sm">Lade neue Mitarbeiter zu deinem Unternehmen ein</p>
            </div>
            <InviteForm companyId={companyId} inviterName={inviterName} inviterEmail={inviterEmail} />
          </div>
        </div>
      )}
    </div>
  );
} 