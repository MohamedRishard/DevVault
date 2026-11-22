"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Mail, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep("otp");
      setCountdown(600);
      showToast(`Verification code sent to ${cleanEmail}`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending code";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: cleanOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      showToast("Signed in successfully! Welcome to DevVault.", "success");
      const redirectPath = searchParams.get("from") || "/dashboard";
      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid verification code";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading) return;
    setOtp("");
    setErrorMessage(null);
    try {
      setLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }
      setCountdown(600);
      showToast("A fresh verification code was sent to your email", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#FFA97B] shadow-2xl p-8 sm:p-10 relative overflow-hidden">
      {/* Top decorative stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E00000] via-[#FFA97B] to-[#9FED72]" />

      {/* Back to Landing Page Icon Button */}
      <Link
        href="/"
        title="Return to Landing Page"
        className="absolute top-4 left-4 p-2 rounded-xl border border-[#FFA97B] bg-white hover:bg-[#FFECCB] text-charcoal transition flex items-center gap-1.5 text-xs font-bold shadow-sm z-10"
      >
        <ArrowLeft className="w-4 h-4 text-[#E00000]" />
        <span className="hidden sm:inline">Landing</span>
      </Link>

      {/* Brand Header */}
      <div className="text-center mb-8 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-[#E00000] text-white flex items-center justify-center mx-auto shadow-vault mb-3.5">
          <Shield className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
          Dev<span className="text-[#E00000]">Vault</span>
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted font-medium mt-1">
          {step === "email"
            ? "Passwordless authentication via Email OTP"
            : "Enter your 6-digit security code"}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-[#FFE5E5] border border-[#E00000] text-[#E00000] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Email Input */}
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#FFA97B] text-charcoal text-sm font-medium focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition"
              />
              <Mail className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1.5">
              We&apos;ll send a one-time 6-digit verification code to your inbox.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E00000] hover:bg-[#C00000] text-white font-bold text-sm shadow-vault transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: OTP Verification */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="otp"
                className="block text-xs font-bold uppercase tracking-wider text-charcoal"
              >
                6-Digit OTP Code
              </label>
              <span className="text-xs font-mono font-bold text-[#E00000]">
                Expires in {formatTime(countdown)}
              </span>
            </div>

            <div className="relative">
              <input
                id="otp"
                type="text"
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] text-2xl font-black py-3 rounded-xl border-2 border-[#FFA97B] text-charcoal focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition font-mono bg-[#FFECCB]/30"
              />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1.5 text-center">
              Sent to <strong className="text-charcoal">{email}</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 rounded-xl bg-[#E00000] hover:bg-[#C00000] text-white font-bold text-sm shadow-vault transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify OTP & Enter Vault</span>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setErrorMessage(null);
              }}
              className="text-charcoal-muted hover:text-charcoal font-semibold underline"
            >
              Change Email
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#E00000] hover:underline font-bold disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}

      {/* Security Footer Notice */}
      <div className="mt-8 pt-5 border-t border-[#FFA97B]/40 text-center text-[11px] text-charcoal-muted flex items-center justify-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-[#FFA97B]" />
        <span>Encrypted with SHA-256 OTP hashing &amp; 7-day JWT cookies.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FFECCB]">
      <Suspense
        fallback={
          <div className="p-8 bg-white rounded-3xl border-2 border-[#FFA97B] text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#E00000] mx-auto mb-2" />
            <p className="text-sm font-bold text-charcoal">Loading authentication...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
