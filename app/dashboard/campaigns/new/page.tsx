"use client";

import { useMutation, useConvexAuth, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function NewCampaign() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const createCampaign = useMutation(api.campaigns.create);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const router = useRouter();
  const campaigns = useQuery(api.campaigns.list, isAuthenticated ? {} : "skip");
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [adType, setAdType] = useState<"free" | "pass">("free");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const hasFreeCampaign = campaigns?.some(c => c.adType === "free" || !c.adType) ?? false;
  
  // Stepper states
  const [currentStep, setCurrentStep] = useState(1);
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Sync adType if user is Pro
  useEffect(() => {
    if (user?.tier === "pro") {
      setAdType("pass");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const validateStep1 = (): boolean => {
    setError(null);
    if (!title.trim()) {
      setError("Le titre de l'annonce est obligatoire.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError(null);
    const parsedRent = rentAmount ? parseFloat(rentAmount) : undefined;
    if (parsedRent === undefined || isNaN(parsedRent) || parsedRent <= 0) {
      setError("Le montant du loyer doit être un nombre supérieur à 0.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    if (adType === "free" && user?.tier !== "pro" && hasFreeCampaign) {
      setToast({
        message: "Vous ne pouvez avoir qu'une seule annonce gratuite active à la fois.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const parsedRent = rentAmount ? parseFloat(rentAmount) : undefined;
    try {
      await createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        rentAmount: parsedRent,
        adType: adType,
      });
      router.push("/annonces");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaymentLoading(true);

    try {
      const parsedRent = rentAmount ? parseFloat(rentAmount) : undefined;
      const { url } = await createCheckoutSession({
        type: "pass",
        campaignData: {
          title: title.trim(),
          description: description.trim() || undefined,
          rentAmount: parsedRent,
        },
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Impossible de générer le lien de paiement.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la redirection vers Stripe.");
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      {/* Main Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Retour button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[#000091] hover:text-[#0b0b7d] font-medium mb-5 group transition-colors focus:outline-none cursor-pointer"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#161616]">Ajouter un logement</h1>
          <p className="text-sm text-[#666666] mt-1">
            Configurez un nouveau logement pour générer un lien de candidature unique.
          </p>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">Détails de l&apos;annonce</div>
          <div className="gov-card-body">
            {/* Stepper progress indicator */}
            <div className="mb-8 select-none">
              <div className="flex justify-between items-center text-xs font-semibold text-[#666666] mb-3">
                <span>Étape {currentStep} sur 4</span>
                <span className="text-[#000091]">
                  {currentStep === 1 && "Informations de base"}
                  {currentStep === 2 && "Loyer & Description"}
                  {currentStep === 3 && "Choix de la formule"}
                  {currentStep === 4 && "Récapitulatif"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className={`h-2 transition-all duration-300 ${currentStep >= 1 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 2 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 3 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 4 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
              </div>
            </div>

            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === 1) {
                  handleNext();
                } else if (currentStep === 2) {
                  handleNext();
                } else if (currentStep === 3) {
                  handleNext();
                } else if (currentStep === 4) {
                  if (adType === "pass" && user?.tier !== "pro") {
                    handlePaymentSubmit(e);
                  } else {
                    handleSubmit(e);
                  }
                }
              }}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="form-label">
                      Titre de l&apos;annonce *
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-input"
                      placeholder="ex: Studio 20m² Paris 11 - Métro Charonne"
                    />
                    <span className="text-xs text-[#666666] mt-1 block">
                      Saisissez un titre clair pour aider les candidats à identifier votre logement.
                    </span>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#DDDDDD]">
                    <Link
                      href="/dashboard"
                      className="btn-secondary flex-1 text-center justify-center"
                    >
                      Annuler
                    </Link>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary flex-1"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="rentAmount" className="form-label">
                      Loyer mensuel charges comprises *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="rentAmount"
                        type="number"
                        required
                        min="1"
                        value={rentAmount}
                        onChange={(e) => setRentAmount(e.target.value)}
                        className="form-input pr-10"
                        placeholder="ex: 850"
                      />
                      <span className="absolute right-4 text-sm text-[#929292] font-semibold pointer-events-none select-none">
                        €
                      </span>
                    </div>
                    <span className="text-xs text-[#666666] mt-1 block">
                      Indiquez le loyer mensuel charges comprises pour calculer le ratio de revenus des candidats (ex: 3x le loyer).
                    </span>
                  </div>

                  <div>
                    <label htmlFor="description" className="form-label">
                      Description / Critères (Optionnel)
                    </label>
                    <textarea
                      id="description"
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-input h-auto min-h-[150px]"
                      placeholder="ex: Disponible le 1er juin. Profils sérieux uniquement. Garant obligatoire."
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#DDDDDD]">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="btn-secondary flex-1"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary flex-1"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  {user?.tier === "pro" ? (
                    <div>
                      <div className="bg-[#F5F5FE] border border-[#CBCBFC] p-4 rounded-xl mb-4 text-center">
                        <span className="text-xs font-bold text-[#000091] uppercase tracking-wider block mb-1">
                          Abonnement Actif
                        </span>
                        <p className="text-sm text-[#161616] font-semibold">
                          Félicitations ! Vous disposez de l&apos;<b>Abonnement Pro</b>.
                        </p>
                        <p className="text-xs text-[#666666] mt-1">
                          Cette annonce est automatiquement créée au format Premium sans frais supplémentaires.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="form-label mb-3">Choisissez le type d&apos;annonce *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Free Tier card */}
                        <div
                          onClick={() => setAdType("free")}
                          className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-full select-none ${
                            adType === "free"
                              ? "border-[#000091] bg-[#F5F5FE]/40 ring-1 ring-[#000091]"
                              : "border-[#DDDDDD] hover:border-[#000091]"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-sm text-[#161616]">Annonce Gratuite</span>
                              <span className="font-bold text-sm text-[#666666]">Gratuit</span>
                            </div>
                            <p className="text-[11px] text-[#666666] leading-relaxed">
                              Idéal pour débuter. Limité à un <b>maximum de 10 candidatures</b> pour cette annonce.
                            </p>
                          </div>
                          {adType === "free" && (
                            <div className="text-xs font-bold text-[#000091] mt-4 flex items-center gap-1">
                              ✓ Formule sélectionnée
                            </div>
                          )}
                        </div>

                        {/* Premium Tier card */}
                        <div
                          onClick={() => setAdType("pass")}
                          className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-full select-none ${
                            adType === "pass"
                              ? "border-[#000091] bg-[#F5F5FE]/40 ring-1 ring-[#000091]"
                              : "border-[#DDDDDD] hover:border-[#000091]"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-sm text-[#161616]">Pass Annonce</span>
                              <span className="font-bold text-sm text-[#000091]">19 €</span>
                            </div>
                            <p className="text-[11px] text-[#666666] leading-relaxed">
                              <b>Candidats illimités</b> pour l&apos;annonce, <b>rappels automatiques</b> et <b>planification des visites</b>.
                            </p>
                          </div>
                          {adType === "pass" && (
                            <div className="text-xs font-bold text-[#000091] mt-4 flex items-center gap-1">
                              ✓ Formule sélectionnée
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#DDDDDD] flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="btn-secondary flex-1"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary flex-1"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border border-[#E3E3FD] bg-[#F5F5FE] p-5 rounded-lg">
                    <h3 className="text-sm font-bold text-[#000091] mb-3 uppercase tracking-wider border-b border-[#E3E3FD] pb-2">
                      Récapitulatif du logement
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#3A3A3A]">
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Titre :</dt>
                        <dd className="font-medium text-[#161616]">{title}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Loyer mensuel :</dt>
                        <dd className="font-medium text-[#161616]">{rentAmount} €</dd>
                      </div>
                      {description.trim() && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-[#666666] font-semibold">Description :</dt>
                          <dd className="font-medium text-[#161616] whitespace-pre-wrap">{description}</dd>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-[#666666] font-semibold">Formule choisie :</dt>
                        <dd className="font-medium text-[#161616]">
                          {user?.tier === "pro"
                            ? "Pass Annonce (Inclus avec l'Abonnement Pro)"
                            : adType === "free"
                            ? "Annonce Gratuite"
                            : "Pass Annonce (19 €)"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {adType === "pass" && user?.tier !== "pro" && (
                    <div className="space-y-6 border-t border-[#DDDDDD] pt-6 mt-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#DDDDDD]">
                        <Lock className="w-4 h-4 text-[#18753C]" />
                        <h3 className="text-sm font-bold text-[#161616] uppercase tracking-wider">
                          Redirection vers Stripe sécurisé
                        </h3>
                      </div>
                      <div className="bg-[#F5F5FE] border border-[#CBCBFC] p-5 rounded-xl flex items-start gap-4">
                        <div className="bg-white p-2.5 rounded-lg border border-[#CBCBFC] shadow-sm flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-[#000091]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#161616]">
                            Paiement unique de 19 €
                          </h4>
                          <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                            Vous allez être redirigé vers le portail de paiement Stripe pour finaliser la transaction de manière 100% sécurisée.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#DDDDDD] flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={loading || paymentLoading}
                      className="btn-secondary flex-1"
                    >
                      Retour
                    </button>
                    {adType === "pass" && user?.tier !== "pro" ? (
                      <button
                        type="submit"
                        disabled={paymentLoading}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Redirection...</span>
                          </>
                        ) : (
                          <span>Payer</span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? "Création..." : "Créer"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
