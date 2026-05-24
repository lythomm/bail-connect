"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ApplyIndexPage() {
  const router = useRouter();
  const convex = useConvex();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerVerification = async (code: string) => {
    if (code.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const campaign = await convex.query(api.campaigns.getByCode, { code });
      if (campaign) {
        router.push(`/apply/${campaign.slug}`);
      } else {
        setError("Code de candidature incorrect, inexistant ou annonce expirée.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de la recherche de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVerification(otp.join(""));
  };

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if complete
    const completedCode = newOtp.join("");
    if (completedCode.length === 6) {
      triggerVerification(completedCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      triggerVerification(pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-center px-6 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none">
            BC
          </div>
          <span className="font-bold text-[#161616] text-base">BailConnect</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#000091] hover:text-[#0b0b7d] font-semibold mb-6 group transition-colors"
          >
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour à l'accueil</span>
          </Link>

          {/* Form Card */}
          <div className="gov-card bg-white shadow-md border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="gov-card-header border-b border-[#E2E8F0] p-6 bg-[#F8FAFC]">
              <h1 className="text-xl font-bold text-[#161616] tracking-tight">
                Déposer ma candidature locataire
              </h1>
              <p className="text-xs text-[#666666] mt-1">
                Saisissez le code de l'annonce fourni par votre propriétaire
              </p>
            </div>

            <div className="gov-card-body p-6 space-y-6">
              {error && (
                <div className="gov-callout gov-callout-warning text-sm">
                  <strong>Erreur :</strong>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="form-label font-bold text-[#161616] mb-4 block text-center">
                    Code de l'annonce
                  </span>

                  <div className="flex justify-between items-center gap-1.5 sm:gap-2 max-w-sm mx-auto my-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono border border-[#DDDDDD] bg-white rounded-lg focus:outline-none focus:border-[#000091] focus:ring-2 focus:ring-[#000091]/20 transition-all select-all text-gray-900"
                        required
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-[#666666] mt-4 block text-center leading-relaxed">
                    Saisissez les 6 chiffres indiqués dans la description de l'annonce ou transmis par le propriétaire.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  {loading ? "Recherche de l'annonce..." : "Accéder à l'annonce"}
                </button>
              </form>

              <div className="pt-4 border-t border-[#DDDDDD] flex items-center gap-3 text-xs text-[#666666]">
                <ShieldCheck className="w-5 h-5 text-[#22c55e] shrink-0" />
                <span>Sécurisé par DossierFacile : aucun justificatif n'est stocké sur nos serveurs.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
