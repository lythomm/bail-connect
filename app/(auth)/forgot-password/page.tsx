"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatError } from "@/lib/errors";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ForgotPasswordContent() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("token");

  // State for Request Reset flow
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // State for Reset Password flow
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Retrieve email for the code if code is present
  const email = useQuery(
    api.users.getEmailFromResetCode,
    code ? { code } : "skip"
  );

  const [resolvedEmail, setResolvedEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (email !== undefined && resolvedEmail === undefined) {
      setResolvedEmail(email);
    }
  }, [email, resolvedEmail]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestLoading(true);

    try {
      await signIn("password", {
        email: requestEmail.trim(),
        flow: "reset",
      });
      setRequestSuccess(true);
    } catch (err: any) {
      console.error(err);
      setRequestError(formatError(err));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 8) {
      setResetError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!resolvedEmail) {
      setResetError("Session de réinitialisation expirée ou invalide. Veuillez refaire une demande.");
      return;
    }

    setResetLoading(true);

    try {
      await signIn("password", {
        email: resolvedEmail,
        code: code!,
        newPassword,
        flow: "reset-verification",
      });
      setResetSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setResetError(formatError(err));
    } finally {
      setResetLoading(false);
    }
  };

  // 1. Rendering for Reset Verification Flow (if code is in URL)
  if (code) {
    // If the token is invalid or expired
    if (resolvedEmail === null) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 bg-[#000091] text-white font-bold text-xl mb-4 select-none">
                BC
              </div>
              <h1 className="text-2xl font-bold text-[#161616] tracking-tight">
                BailConnect
              </h1>
            </div>

            <div className="gov-card">
              <div className="gov-card-header text-red-600">
                Lien invalide ou expiré
              </div>
              <div className="gov-card-body text-center">
                <p className="text-sm text-[#3A3A3A] mb-6">
                  Ce lien de réinitialisation de mot de passe est invalide, a déjà été utilisé ou a expiré après 15 minutes.
                </p>
                <Link href="/forgot-password" className="btn-primary inline-block w-full">
                  Faire une nouvelle demande
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // While loading verification details
    if (resolvedEmail === undefined) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
          <span className="text-sm text-[#666666]">Vérification du lien de réinitialisation...</span>
        </div>
      );
    }

    // Form to enter new password
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
              Réinitialisation du mot de passe
            </p>
          </div>

          {/* Form Container */}
          <div className="gov-card">
            <div className="gov-card-header">
              Nouveau mot de passe
            </div>

            <div className="gov-card-body">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4 text-[#000091]">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-bold text-[#161616] mb-2">Mot de passe réinitialisé</h3>
                  <p className="text-sm text-[#666666]">
                    Votre mot de passe a bien été modifié. Redirection vers la page de connexion...
                  </p>
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="gov-callout gov-callout-warning mb-6 text-sm">
                      <strong>Erreur :</strong> {resetError}
                    </div>
                  )}

                  <form onSubmit={handleResetSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="newPassword" className="form-label">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-input pr-10"
                          placeholder="Au moins 8 caractères"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#666666] hover:text-[#161616]"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="btn-primary w-full"
                      >
                        {resetLoading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Rendering for Initial Reset Request Flow (no code in URL)
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
            Mot de passe oublié ?
          </p>
        </div>

        {/* Form Container */}
        <div className="gov-card">
          <div className="gov-card-header">
            Récupération de compte
          </div>

          <div className="gov-card-body">
            {requestSuccess ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4 text-[#000091]">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-bold text-[#161616] mb-2">E-mail envoyé</h3>
                <p className="text-sm text-[#666666] mb-6">
                  Si cette adresse correspond à un compte, un e-mail contenant un lien de réinitialisation vous a été envoyé. Il expirera dans 15 minutes.
                </p>
                <Link href="/signin" className="btn-secondary inline-block w-full">
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                {requestError && (
                  <div className="gov-callout gov-callout-warning mb-6 text-sm">
                    <strong>Erreur :</strong> {requestError}
                  </div>
                )}

                <p className="text-sm text-[#3A3A3A] mb-6">
                  Saisissez l'adresse email associée à votre compte propriétaire. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="requestEmail" className="form-label">
                      Adresse email
                    </label>
                    <input
                      id="requestEmail"
                      name="requestEmail"
                      type="email"
                      required
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      className="form-input"
                      placeholder="exemple@bailconnect.fr"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={requestLoading}
                      className="btn-primary w-full"
                    >
                      {requestLoading ? "Envoi du lien..." : "Envoyer le lien de réinitialisation"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center border-t border-[#DDDDDD] pt-6">
                  <Link href="/signin" className="btn-tertiary text-sm">
                    Retour à la connexion
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <span className="text-sm text-[#666666]">Chargement de la page...</span>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
