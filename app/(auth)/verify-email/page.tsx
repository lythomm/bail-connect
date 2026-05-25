"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function VerifyEmailPage() {
  const user = useQuery(api.users.current);
  const verifyOTP = useMutation(api.users.verifyEmailOTP);
  const resendOTP = useMutation(api.users.resendVerificationCode);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Redirect if already verified or if not logged in (handled by query load)
  useEffect(() => {
    if (user === null) {
      router.replace("/signin");
    } else if (user && user.emailVerificationTime) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      setError("Le code doit comporter 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      await verifyOTP({ code: trimmedCode });
      setSuccess("E-mail vérifié avec succès ! Redirection...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setSuccess(null);
    setResendLoading(true);

    try {
      await resendOTP();
      setSuccess("Un nouveau code a été envoyé !");
      setCooldown(60);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de renvoyer le code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  if (user === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-[#000091] text-white font-bold text-xl mb-4 select-none">
            BC
          </div>
          <h1 className="text-2xl font-bold text-[#161616] tracking-tight">
            BailConnect
          </h1>
          <p className="mt-2 text-sm text-[#3A3A3A]">
            Espace bailleurs - Vérification de votre compte
          </p>
        </div>

        {/* Form Container */}
        <div className="gov-card">
          <div className="gov-card-header">
            Saisir le code de vérification
          </div>

          <div className="gov-card-body">
            <p className="text-sm text-[#3A3A3A] mb-6 leading-relaxed">
              Un code de validation à 6 chiffres a été envoyé à l'adresse suivante :<br />
              <strong className="text-[#161616]">{user.email}</strong>.<br /><br />
              Veuillez le saisir ci-dessous pour activer votre compte.
            </p>

            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            {success && (
              <div className="gov-callout mb-6 text-sm bg-[#E3F2FD] border-l-4 border-[#0D47A1] text-[#0D47A1] p-4 text-[#0D47A1]">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="form-label">
                  Code à 6 chiffres
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="form-input text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  disabled={loading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || code.trim().length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? "Vérification..." : "Valider mon compte"}
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#DDDDDD] pt-6">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
                className="btn-tertiary text-sm"
              >
                {cooldown > 0
                  ? `Renvoyer le code (${cooldown}s)`
                  : resendLoading
                  ? "Envoi en cours..."
                  : "Renvoyer le code"}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-[#666666] hover:text-[#161616] underline"
              >
                Se déconnecter et revenir à l'accueil
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-[#666666]">
          BailConnect s'inspire de la charte de l'État pour garantir la clarté et l'accessibilité de ses services.
        </p>
      </div>
    </div>
  );
}
