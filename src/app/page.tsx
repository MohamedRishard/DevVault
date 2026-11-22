import Link from "next/link";
import { Shield, ArrowRight, Lock, Terminal, Bookmark } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E00000] text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-charcoal">
            Dev<span className="text-[#E00000]">Vault</span>
          </span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2 rounded-xl bg-white border-2 border-[#FFA97B] text-charcoal hover:bg-[#FFECCB] font-bold text-sm transition shadow-sm"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="my-16 text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-black text-charcoal tracking-tight leading-tight">
          Your Personal Tech & <br />
          <span className="text-[#E00000]">
            Repository Vault
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-charcoal/80 font-medium leading-relaxed">
          The high-contrast, frictionless bookmarking haven built for developers, cybersecurity researchers, and makers. Organize free tools, security labs, and GitHub repositories with instant search.
        </p>

        <div className="pt-4 flex items-center justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#E00000] hover:bg-[#C00000] text-white font-extrabold text-base shadow-vault transition transform active:scale-95"
          >
            <span>Access Your Vault</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-12">
        <div className="bg-white rounded-2xl border-2 border-[#FFA97B] p-6 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFECCB] border border-[#FFA97B] flex items-center justify-center text-[#E00000]">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal">Passwordless OTP</h3>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Instant, cryptographic email verification with Resend and secure HttpOnly JWT session tokens.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#FFA97B] p-6 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFECCB] border border-[#FFA97B] flex items-center justify-center text-[#E00000]">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal">Deep Search & Chips</h3>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Multi-attribute search matching titles, domains, descriptions, and interactive feature chips.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#FFA97B] p-6 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFECCB] border border-[#FFA97B] flex items-center justify-center text-[#E00000]">
            <Bookmark className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal">GitHub Auto-Detect</h3>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Automatically surfaces GitHub repositories with dedicated badges, one-click copy, and pinned priorities.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-charcoal-muted border-t border-[#FFA97B]/50">
        DevVault &copy; {new Date().getFullYear()} — Built with Next.js, Tailwind CSS, Neon PostgreSQL & Resend.
      </footer>
    </main>
  );
}
