"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useConvex } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const router = useRouter();
  const convex = useConvex();

  // Step state
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);

  // Form values
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Validation functions
  const validateStep1 = () => {
    if (name.trim().length < 2) {
      setError("Le prénom doit comporter au moins 2 caractères.");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = async () => {
    setError(null);
    const cleaned = phone.replace(/[\s.-]/g, "");
    if (!cleaned) {
      setError("Le numéro de téléphone est requis.");
      return false;
    }
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(cleaned)) {
      setError("Format du numéro de téléphone invalide. Ex: 06 12 34 56 78");
      return false;
    }

    setValidatingPhone(true);
    try {
      const result = await convex.query(api.users.checkPhoneUnique, { phone: cleaned });
      if (!result.isUnique) {
        setError(result.error || "Ce numéro de téléphone est déjà utilisé.");
        setValidatingPhone(false);
        return false;
      }
      setError(null);
      setValidatingPhone(false);
      return true;
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la vérification du numéro.");
      setValidatingPhone(false);
      return false;
    }
  };

  const validateStep3 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez saisir une adresse e-mail valide.");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep4 = () => {
    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      const isValid = await validateStep2();
      if (!isValid) return;
    }
    if (step === 3 && !validateStep3()) return;

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== totalSteps) {
      handleNext();
      return;
    }

    if (!validateStep4()) return;

    setError(null);
    setLoading(true);

    try {
      await signIn("password", {
        email: email.trim(),
        password,
        flow: "signUp",
        name: name.trim(),
        phone: phone.trim(),
      });

      router.push("/verify-email");
    } catch (err: any) {
      console.error(err);
      let userFriendlyMessage = err.message || "Une erreur est survenue lors de l'inscription.";
      if (typeof err.message === "string") {
        if (err.message.includes("is already registered") || err.message.includes("already exists")) {
          userFriendlyMessage = "Cette adresse email est déjà enregistrée.";
        }
      }
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

  const getStepHeader = () => {
    switch (step) {
      case 1:
        return {
          title: "Qui êtes-vous ?",
          desc: "Saisissez votre prénom pour personnaliser votre espace."
        };
      case 2:
        return {
          title: "Votre numéro de téléphone",
          desc: "Nécessaire pour recevoir les alertes et les futurs codes de sécurité."
        };
      case 3:
        return {
          title: "Votre adresse e-mail",
          desc: "Utilisée pour vous connecter et recevoir les résumés quotidiens."
        };
      case 4:
        return {
          title: "Sécurisez votre compte",
          desc: "Choisissez un mot de passe robuste."
        };
      default:
        return { title: "", desc: "" };
    }
  };

  const stepHeader = getStepHeader();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-[#000091] text-white font-bold text-xl mb-4 select-none font-sans">
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
          {/* Stepper Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs text-[#666666] font-medium mb-3">
              <span className="text-[#000091]">Étape {step} sur {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complété</span>
            </div>

            {/* Stepper indicators */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i < step
                      ? "bg-[#000091]"
                      : i === step
                        ? "bg-[#000091]/70 animate-pulse"
                        : "bg-[#E3E3FD]"
                    }`}
                />
              ))}
            </div>

            <div className="gov-card-header !mb-2 !border-none !pb-0">
              {stepHeader.title}
            </div>
            <p className="text-xs text-[#666666]">
              {stepHeader.desc}
            </p>
          </div>

          <div className="gov-card-body !pt-2">
            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Name */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <label htmlFor="name" className="form-label">
                    Prénom
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    className="form-input"
                    placeholder="Jean"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 2: Phone */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="phone" className="form-label mb-0">
                      Numéro de téléphone
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPhoneInfo(!showPhoneInfo)}
                      className="text-xs text-[#000091] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Info className="w-3.5 h-3.5" />
                      En savoir plus
                    </button>
                  </div>

                  {showPhoneInfo && (
                    <div className="mb-4 p-3 bg-[#E3E3FD] text-[#000091] text-xs rounded-[0.25rem] border border-[#CBCBFC] animate-fade-in">
                      Votre numéro est nécessaire uniquement pour recevoir vos alertes de visites et de candidatures, ainsi que les futurs codes de sécurité. Il ne sera <strong>jamais partagé</strong> aux candidats locataires.
                    </div>
                  )}

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    className="form-input"
                    placeholder="06 12 34 56 78"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-[#666666]">
                    Format français accepté (ex: 0612345678 ou +33612345678)
                  </p>
                </div>
              )}

              {/* STEP 3: Email */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <label htmlFor="email" className="form-label">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="form-input"
                    placeholder="exemple@bailconnect.fr"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 4: Password */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label htmlFor="password" className="form-label">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="form-input pr-10"
                        placeholder="••••••••"
                        autoFocus
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
                    <label htmlFor="confirm-password" className="form-label">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
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
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading || validatingPhone}
                    className="btn-secondary flex-1 justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || validatingPhone}
                  className="btn-primary flex-1 justify-center gap-2"
                >
                  {loading ? (
                    "Inscription..."
                  ) : validatingPhone ? (
                    "Vérification..."
                  ) : step === totalSteps ? (
                    <>
                      S'inscrire
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center border-t border-[#DDDDDD] pt-6">
              <Link href="/signin" className="btn-tertiary text-sm">
                Vous avez déjà un compte ? Se connecter
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
