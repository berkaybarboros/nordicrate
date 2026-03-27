"use client";

import { useState, useEffect } from "react";
import { X, Bell, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultProduct?: string;
  defaultRate?: number;
}

const PRODUCTS = [
  { value: "personal-loan", label: "Personal Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "car-loan", label: "Car Loan" },
  { value: "motor-insurance", label: "Motor Insurance" },
  { value: "casco", label: "CASCO Insurance" },
  { value: "deposit", label: "Term Deposit" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function RateAlertModal({ open, onClose, defaultProduct, defaultRate }: Props) {
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(defaultProduct || "personal-loan");
  const [targetRate, setTargetRate] = useState(defaultRate?.toString() || "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setError("");
    }
  }, [open]);

  // Prevent background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product, targetRate: targetRate ? Number(targetRate) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save alert. Try again.");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a3c6e]/10 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-[#1a3c6e]" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900">Rate Drop Alert</h2>
                <p className="text-xs text-gray-500">Get notified when rates improve</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {status === "success" ? (
            /* Success state */
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">You&apos;re all set!</h3>
              <p className="text-gray-500 text-sm mb-1">
                We&apos;ll email <span className="font-semibold text-gray-700">{email}</span> when{" "}
                {PRODUCTS.find((p) => p.value === product)?.label} rates drop
                {targetRate ? ` below ${targetRate}%` : ""}.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                No spam — unsubscribe anytime from the email.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-[#1a3c6e] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#152e55] transition"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 focus:border-[#1a3c6e] transition"
                />
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Product type
                </label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 focus:border-[#1a3c6e] transition bg-white"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target rate (optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notify me when rate drops below{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder="e.g. 9.5"
                    min={0}
                    max={50}
                    step={0.1}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 focus:border-[#1a3c6e] transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Leave blank to get notified on any rate change.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              {/* Privacy note */}
              <p className="text-xs text-gray-400 leading-relaxed">
                By subscribing you agree to receive email alerts from BalticRate. We never share
                your email with third parties.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3c6e] hover:bg-[#152e55] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Setting up alert…
                  </>
                ) : (
                  <>
                    <Bell size={16} />
                    Set Rate Alert
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
