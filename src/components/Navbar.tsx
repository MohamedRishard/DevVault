"use client";

import React, { useState } from "react";
import { Shield, LogOut, Plus, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  email?: string;
  onOpenAddModal: () => void;
}

export default function Navbar({ email, onOpenAddModal }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFECCB]/90 backdrop-blur-md border-b-2 border-[#FFA97B] px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E00000] text-white flex items-center justify-center shadow-md transform hover:scale-105 transition">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-charcoal flex items-center gap-1.5">
              Dev<span className="text-[#E00000]">Vault</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted ml-2 px-2 py-0.5 rounded-full bg-[#FFA97B]/40 border border-[#FFA97B]">
              Personal Repo Vault
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-[#E00000] hover:bg-[#C00000] text-white font-bold px-4 py-2 rounded-xl shadow-vault transition transform active:scale-95 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Resource</span>
          </button>

          {email && (
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-[#FFA97B] text-xs font-semibold text-charcoal shadow-sm">
              <UserIcon className="w-4 h-4 text-[#FFA97B]" />
              <span className="max-w-[180px] truncate" title={email}>
                {email}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
            className="flex items-center gap-1.5 bg-white hover:bg-[#FFECCB] text-charcoal font-semibold px-3 py-2 rounded-xl border-2 border-[#FFA97B] hover:border-[#E00000] transition text-sm disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-[#E00000]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
