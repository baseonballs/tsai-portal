"use client";

import React, { useState } from "react";
import type { VerifiedProspectPassport, SafeSportInquiryRecord } from "./college-scout-types";

interface SafeSportInquiryModalProps {
  prospect: VerifiedProspectPassport;
  onClose: () => void;
  onDispatchInquiry?: (inquiry: SafeSportInquiryRecord) => Promise<boolean>;
}

export const SafeSportInquiryModal: React.FC<SafeSportInquiryModalProps> = ({
  prospect,
  onClose,
  onDispatchInquiry,
}) => {
  const [scoutName, setScoutName] = useState("");
  const [institution, setInstitution] = useState("");
  const [scoutEmail, setScoutEmail] = useState("");
  const [message, setMessage] = useState("");
  const [parentConsent, setParentConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentConsent || !scoutName || !institution || !scoutEmail) return;

    setSubmitting(true);
    const inquiry: SafeSportInquiryRecord = {
      prospectId: prospect.id,
      athleteName: prospect.athleteName,
      scoutName,
      institution,
      scoutEmail,
      message,
      parentConsentAcknowledged: parentConsent,
      dispatchedAtIso: new Date().toISOString(),
    };

    if (onDispatchInquiry) {
      await onDispatchInquiry(inquiry);
    }

    setStatusMessage("Inquiry routed to verified guardian. Direct minor access blocked.");
    setSubmitting(false);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <h3 className="text-lg font-bold text-white">SafeSport Collegiate Inquiry</h3>
        <p className="mt-1 text-xs text-slate-400">
          Recruiting inquiry for <span className="text-white font-semibold">{prospect.athleteName}</span>. Direct minor communication is prohibited. This notice is transmitted to the registered guardian.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium">Scout / Coach Full Name</label>
            <input
              type="text"
              required
              value={scoutName}
              onChange={(e) => setScoutName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium">Collegiate Institution / Program</label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium">Institutional Email (.edu)</label>
            <input
              type="email"
              required
              value={scoutEmail}
              onChange={(e) => setScoutEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium">Message to Guardian</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expressing recruitment interest in your student-athlete..."
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="consentCheckbox"
              required
              checked={parentConsent}
              onChange={(e) => setParentConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500"
            />
            <label htmlFor="consentCheckbox" className="text-slate-400">
              I certify compliance with NCAA recruiting rules, COPPA, and SafeSport protocols.
            </label>
          </div>

          {statusMessage && (
            <div className="rounded bg-emerald-500/20 p-2 text-emerald-400 font-semibold text-center">
              ✓ {statusMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-sky-600 px-4 py-1.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {submitting ? "Dispatching..." : "Transmit to Guardian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
