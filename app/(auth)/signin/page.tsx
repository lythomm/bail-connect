"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn("password", {
        email: email.trim(),
        password,
        flow: "signIn",
      });

      posthog.identify(email.trim(), { email: email.trim() });
      posthog.capture("user_signed_in", { email: email.trim() });

      // Successfully authenticated, middleware/router redirects to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      let userFriendlyMessage = err.message || "Une erreur est survenue lors de l'authentification.";
      if (typeof err.message === "string") {
        if (err.message.includes("InvalidSecret")) {
          userFriendlyMessage = "Email ou mot de passe incorrect.";
        } else if (err.message.includes("InvalidAccountId")) {
          userFriendlyMessage = "Cette adresse email n'est pas enregistrée.";
        }
      }
      posthog.capture("sign_in_failed", { error: err.message });
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
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
            Espace bailleurs - Recrutement de locataires simplifié
          </p>
        </div>

        {/* Form Container */}
        <div className="gov-card">
          <div className="gov-card-header">
            Connexion bailleur
          </div>

          <div className="gov-card-body">
            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="exemple@bailconnect.fr"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="form-label mb-0">
                    Mot de passe
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#000091] hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="••••••••"
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
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Chargement..." : "Se connecter"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center border-t border-[#DDDDDD] pt-6">
              <Link href="/register" className="btn-tertiary text-sm">
                Pas encore de compte ? S'inscrire
              </Link>
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
