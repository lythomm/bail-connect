"use client";

import { useMutation, useConvexAuth, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Lock, CheckCircle2, Loader2, HelpCircle, Plus, Sparkles } from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";
import Dialog from "@/components/Dialog";
import { getBookmarkletCode } from "./bookmarklet";

export default function NewCampaign() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const createCampaign = useMutation(api.campaigns.create);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const scrapeAnnonce = useAction(api.importAnnonce.scrape);
  const router = useRouter();
  const campaigns = useQuery(api.campaigns.list, isAuthenticated ? {} : "skip");

  // Form states
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [adType, setAdType] = useState<"free" | "pass">("free");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showAddressInfo, setShowAddressInfo] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const [creationMode, setCreationMode] = useState<"choice" | "manual" | "import">("choice");
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<"bookmarklet" | "url">("bookmarklet");

  const cleanErrorMessage = (errMessage: string): string => {
    if (!errMessage) return "Une erreur est survenue.";
    if (errMessage.includes("Uncaught Error: ")) {
      const parts = errMessage.split("Uncaught Error: ");
      const rest = parts[parts.length - 1];
      return rest.split(/\s+at\s+/)[0].trim();
    }
    const serverErrorMatch = errMessage.match(/Server Error\s*(.*)/i);
    if (serverErrorMatch && serverErrorMatch[1]) {
      const rest = serverErrorMatch[1];
      return rest.split(/\s+at\s+/)[0].trim();
    }
    return errMessage;
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) {
      setError("Veuillez saisir une URL.");
      return;
    }
    setError(null);
    setImportLoading(true);
    try {
      const data = await scrapeAnnonce({ url: importUrl.trim() });
      if (data) {
        setTitle(data.titre || "");

        let constructedAddress = "";
        if (data.ville && data.codePostal) {
          constructedAddress = `${data.ville} (${data.codePostal})`;
        } else if (data.ville) {
          constructedAddress = data.ville;
        } else if (data.codePostal) {
          constructedAddress = data.codePostal;
        }
        setAddress(constructedAddress);

        setRentAmount(data.prixLoyer ? data.prixLoyer.toString() : "");
        setDescription(data.description || "");

        setToast({
          message: "Annonce importée avec succès ! Veuillez vérifier les informations.",
          type: "success",
        });

        setCreationMode("manual");
        setCurrentStep(1);
      }
    } catch (err: any) {
      console.error(err);
      setError(cleanErrorMessage(err.message) || "Impossible d'importer l'annonce. Vérifiez l'URL et réessayez.");
    } finally {
      setImportLoading(false);
    }
  };

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

  // Protect import mode
  useEffect(() => {
    if (creationMode === "import" && user && user.tier !== "pro") {
      setCreationMode("choice");
    }
  }, [creationMode, user]);

  // Handle importData parameter from Bookmarklet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const importDataRaw = params.get("importData");
      if (importDataRaw && user) {
        // Clean URL parameter immediately to avoid processing again on reload
        window.history.replaceState({}, document.title, window.location.pathname);

        if (user.tier !== "pro") {
          setError("L'importation d'annonce par favori est réservée aux membres PRO.");
          setShowProModal(true);
          return;
        }

        try {
          const data = JSON.parse(decodeURIComponent(importDataRaw));
          if (data) {
            setTitle(data.titre || "");

            let constructedAddress = "";
            if (data.ville && data.codePostal) {
              constructedAddress = `${data.ville} (${data.codePostal})`;
            } else if (data.ville) {
              constructedAddress = data.ville;
            } else if (data.codePostal) {
              constructedAddress = data.codePostal;
            }
            setAddress(constructedAddress);

            setRentAmount(data.prixLoyer ? data.prixLoyer.toString() : "");
            setDescription(data.description || "");

            setToast({
              message: "Annonce importée depuis votre favori avec succès ! Veuillez vérifier les informations.",
              type: "success",
            });

            setCreationMode("manual");
            setCurrentStep(1);
          }
        } catch (err) {
          console.error("Failed to parse import data:", err);
          setError("Impossible de décoder les données de l'annonce.");
        }
      }
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

  const validateAddressStep = (): boolean => {
    setError(null);
    if (!address.trim()) {
      setError("L'adresse du logement est obligatoire.");
      return false;
    }
    return true;
  };

  const validateRentStep = (): boolean => {
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
      if (validateAddressStep()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateRentStep()) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      if (adType === "free" && user?.tier !== "pro" && hasFreeCampaign) {
        setToast({
          message: "Vous ne pouvez avoir qu'une seule annonce gratuite active à la fois.",
          type: "error",
        });
        return;
      }
      setCurrentStep(5);
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

    if (!validateStep1() || !validateAddressStep() || !validateRentStep()) {
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
      const campaignId = await createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        rentAmount: parsedRent,
        address: address.trim(),
        adType: adType,
      });
      router.push(`/dashboard/campaigns/new/success?campaign_id=${campaignId}`);
    } catch (err: any) {
      console.error(err);
      setError(cleanErrorMessage(err.message) || "Une erreur est survenue lors de la création.");
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
          address: address.trim(),
        },
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Impossible de générer le lien de paiement.");
      }
    } catch (err: any) {
      console.error(err);
      setError(cleanErrorMessage(err.message) || "Une erreur est survenue lors de la redirection vers Stripe.");
      setPaymentLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setError(null);
    setPaymentLoading(true);
    try {
      const { url } = await createCheckoutSession({
        type: "pro",
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Impossible de générer le lien de paiement pour l'abonnement PRO.");
      }
    } catch (err: any) {
      console.error(err);
      setError(cleanErrorMessage(err.message) || "Une erreur est survenue lors de la redirection vers Stripe.");
      setPaymentLoading(false);
    }
  };

  const renderProModal = () => {
    if (!showProModal) return null;
    return (
      <Dialog
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        title="Débloquer l'Import Automatique 🔒"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowProModal(false)}
              className="btn-secondary w-full sm:w-auto text-center justify-center cursor-pointer"
              disabled={paymentLoading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleUpgradeToPro}
              className="btn-primary w-full sm:flex-1 text-center justify-center flex items-center gap-2 cursor-pointer bg-[#B35C00] hover:bg-[#8f4a00] border-[#B35C00]"
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mettre à niveau</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-sm leading-relaxed text-[#3A3A3A]">
            L'importation automatique d'annonces est une fonctionnalité exclusive réservée aux membres <strong>PRO</strong>.
          </p>
          <div className="bg-[#FFF8F0] border border-[#FFE0B2] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#B35C00] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Avantages de l'abonnement PRO
            </h4>
            <ul className="text-xs text-[#5D4037] space-y-1.5 list-disc pl-4">
              <li><strong>Import automatique</strong> depuis Leboncoin, SeLoger, PAP, Bien'ici, etc.</li>
              <li>Création de logements avec le PASS et traitement de candidatures <strong>illimités</strong>.</li>
              <li>Activation automatique du statut <strong>Premium</strong> pour toutes vos annonces.</li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-[#666666]">
            En cliquant ci-dessous, vous serez redirigé vers Stripe pour souscrire à l'abonnement PRO. Vous pourrez annuler à tout moment en un clic depuis votre profil.
          </p>
        </div>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  if (creationMode === "choice") {
    return (
      <div className="flex-1 flex flex-col bg-[#F6F6F6]">
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
          <button
            onClick={() => router.replace("/annonces")}
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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#161616]">Comment souhaitez-vous ajouter votre logement ?</h1>
            <p className="text-sm text-[#666666] mt-1">
              Gagnez du temps en important votre annonce existante ou configurez-la manuellement.
            </p>
          </div>

          {error && (
            <div className="gov-callout gov-callout-warning mb-6 text-sm">
              <strong>Erreur :</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() => {
                setError(null);
                setCreationMode("manual");
                setCurrentStep(1);
              }}
              className="border border-[#DDDDDD] bg-white rounded-xl p-6 cursor-pointer hover:border-[#000091] hover:shadow-md transition-all flex flex-col items-center text-center justify-between min-h-[220px] select-none"
            >
              <div className="flex flex-col items-center mt-4">
                <div className="w-12 h-12 rounded-full bg-[#EEEEEE] flex items-center justify-center mb-4 text-[#161616]">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#161616] mb-2">Saisie manuelle</h3>
                <p className="text-xs text-[#666666] max-w-[200px]">
                  Configurez votre annonce étape par étape à partir de zéro.
                </p>
              </div>
              <div className="text-xs font-semibold text-[#000091] mt-4">Commencer →</div>
            </div>

            <div
              onClick={() => {
                setError(null);
                if (user?.tier !== "pro") {
                  setShowProModal(true);
                } else {
                  setCreationMode("import");
                }
              }}
              className={`border rounded-xl p-6 cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center justify-between min-h-[220px] select-none relative overflow-hidden ${user?.tier === "pro"
                ? "border-[#DDDDDD] bg-white hover:border-[#000091]"
                : "border-[#E2E8F0] bg-[#FAF9F6]/80 hover:border-[#B35C00]"
                }`}
            >
              {user?.tier === "pro" ? (
                <div className="absolute top-2 right-2 bg-[#E3E3FD] text-[#000091] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Rapide ✨
                </div>
              ) : (
                <div className="absolute top-2 right-2 bg-[#FFF3E0] text-[#B35C00] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </div>
              )}
              <div className="flex flex-col items-center mt-4">
                {user?.tier === "pro" ? (
                  <div className="w-12 h-12 rounded-full bg-[#E3E3FD] flex items-center justify-center mb-4 text-[#000091]">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-4 text-[#B35C00] relative">
                    <Sparkles className="w-5 h-5 opacity-60" />
                    <Lock className="w-3.5 h-3.5 absolute bottom-0 right-0 bg-[#FFF3E0] rounded-full p-0.5 border border-[#FFF3E0] text-[#B35C00]" />
                  </div>
                )}
                <h3 className="font-bold text-base text-[#161616] mb-2 flex items-center gap-1.5 justify-center">
                  Import automatique
                  {user?.tier !== "pro" && <Lock className="w-3.5 h-3.5 text-[#B35C00]/80" />}
                </h3>
                <p className="text-xs text-[#666666] max-w-[200px]">
                  Importez en 1 clic depuis Leboncoin, SeLoger ou PAP grâce à notre bouton-favori.
                </p>
              </div>
              <div className={`text-xs font-semibold mt-4 ${user?.tier === "pro" ? "text-[#000091]" : "text-[#B35C00]"}`}>
                {user?.tier === "pro" ? "Importer avec le favori →" : "Débloquer avec PRO 🔒"}
              </div>
            </div>
          </div>
        </main>
        {renderProModal()}
      </div>
    );
  }

  if (creationMode === "import") {
    const appOrigin = typeof window !== "undefined" ? window.location.origin : "https://bail-connect.fr";
    const bookmarkletCode = getBookmarkletCode(appOrigin);

    return (
      <div className="flex-1 flex flex-col bg-[#F6F6F6]">
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
          <button
            onClick={() => {
              setError(null);
              setCreationMode("choice");
            }}
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
            <span>Retour aux choix</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#161616]">Importer votre annonce</h1>
            <p className="text-sm text-[#666666] mt-1">
              Importez instantanément vos logements existants depuis Leboncoin, SeLoger ou PaP.
            </p>
          </div>

          <div className="gov-card">
            <div className="gov-card-header flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B35C00]" />
              <span>Importation par Bouton-Favori</span>
            </div>
            <div className="gov-card-body space-y-6">
              {error && (
                <div className="gov-callout gov-callout-warning text-sm">
                  <strong>Erreur :</strong> {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#161616]">Étape 1 : Ajoutez le bouton d&apos;import à votre barre de favoris</h3>
                <p className="text-xs text-[#666666]">
                  Glissez et déposez le bouton orange ci-dessous directement dans la <strong>barre de favoris</strong> de votre navigateur.
                </p>

                <div className="py-4 flex flex-col items-center justify-center border-2 border-dashed border-[#DDDDDD] rounded-xl bg-[#FAF9F6]">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<a href="${bookmarkletCode}" onclick="event.preventDefault(); alert('Pour installer ce bouton, glissez-le et déposez-le dans la barre des favoris de votre navigateur (raccourcis en haut).');" class="inline-flex items-center gap-2 px-6 py-3 bg-[#B35C00] hover:bg-[#8f4a00] text-white font-bold rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-[#B35C00] select-none transition-all duration-150 transform hover:-translate-y-0.5"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>Importer dans Bail Connect</a>`
                    }}
                  />
                  <span className="text-[10px] text-[#888888] mt-3 flex items-center gap-1 select-none">
                    ← Glissez-déposez ce bouton vers le haut ↑
                  </span>
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] pt-6 space-y-4">
                <h3 className="text-sm font-bold text-[#161616]">Étape 2 : Importez en 1 clic</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="border border-[#EEEEEE] rounded-lg p-3 bg-white">
                    <div className="w-6 h-6 rounded-full bg-[#E3E3FD] text-[#000091] flex items-center justify-center font-bold text-xs mx-auto mb-2">1</div>
                    <h4 className="text-xs font-bold text-[#161616] mb-1">Ouvrez l&apos;annonce</h4>
                    <p className="text-[10px] text-[#666666]">Allez sur Leboncoin ou SeLoger sur votre annonce.</p>
                  </div>
                  <div className="border border-[#EEEEEE] rounded-lg p-3 bg-white">
                    <div className="w-6 h-6 rounded-full bg-[#E3E3FD] text-[#000091] flex items-center justify-center font-bold text-xs mx-auto mb-2">2</div>
                    <h4 className="text-xs font-bold text-[#161616] mb-1">Cliquez sur le favori</h4>
                    <p className="text-[10px] text-[#666666]">Cliquez sur le favori &quot;Importer dans Bail Connect&quot;.</p>
                  </div>
                  <div className="border border-[#EEEEEE] rounded-lg p-3 bg-white">
                    <div className="w-6 h-6 rounded-full bg-[#E3E3FD] text-[#000091] flex items-center justify-center font-bold text-xs mx-auto mb-2">3</div>
                    <h4 className="text-xs font-bold text-[#161616] mb-1">C&apos;est prêt !</h4>
                    <p className="text-[10px] text-[#666666]">Vous serez redirigé ici avec les données préremplies.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#DDDDDD]">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCreationMode("choice");
                  }}
                  className="btn-secondary w-full"
                >
                  Retour aux choix
                </button>
              </div>
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
        {renderProModal()}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      {/* Main Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Retour button */}
        <button
          onClick={() => {
            setError(null);
            setCreationMode("choice");
          }}
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
                <span>Étape {currentStep} sur 5</span>
                <span className="text-[#000091]">
                  {currentStep === 1 && "Informations de base"}
                  {currentStep === 2 && "Adresse du logement"}
                  {currentStep === 3 && "Loyer & Description"}
                  {currentStep === 4 && "Choix de la formule"}
                  {currentStep === 5 && "Récapitulatif"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div className={`h-2 transition-all duration-300 ${currentStep >= 1 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 2 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 3 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 4 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 5 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
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
                  handleNext();
                } else if (currentStep === 5) {
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
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="address" className="form-label m-0">
                        Adresse du logement *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddressInfo(true)}
                        className="text-xs text-[#000091] hover:underline font-medium cursor-pointer focus:outline-none flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        ? savoir plus
                      </button>
                    </div>
                    <input
                      id="address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="form-input"
                      placeholder="ex: 12 Rue de Rivoli, 75004 Paris"
                    />
                    <span className="text-xs text-[#666666] mt-1 block">
                      Indiquez l&apos;adresse complète du logement pour les visites.
                    </span>
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

              {currentStep === 4 && (
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
                          className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-full select-none ${adType === "free"
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
                          className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-full select-none ${adType === "pass"
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

              {currentStep === 5 && (
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
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-[#666666] font-semibold">Adresse :</dt>
                        <dd className="font-medium text-[#161616]">{address}</dd>
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
      {showAddressInfo && (
        <Dialog
          isOpen={showAddressInfo}
          onClose={() => setShowAddressInfo(false)}
          title="Confidentialité de l'adresse"
          footer={
            <button
              type="button"
              onClick={() => setShowAddressInfo(false)}
              className="btn-primary w-full sm:w-auto cursor-pointer"
            >
              Compris
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[#3A3A3A]">
              Par souci de confidentialité et de sécurité, l'adresse exacte de votre logement n'est pas affichée publiquement sur la page de candidature.
            </p>
            <p className="text-sm leading-relaxed text-[#3A3A3A]">
              Elle sera uniquement partagée avec les candidats dont vous aurez <strong>retenu</strong> le dossier, lorsqu'ils accèderont à la page de réservation de créneau pour planifier leur visite.
            </p>
          </div>
        </Dialog>
      )}
      {renderProModal()}
    </div>
  );
}
