"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Dialog from "./Dialog";
import { Home, ClipboardCheck, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeOnboarding({ isOpen, onClose }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(1);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const router = useRouter();

  const handleFinish = async () => {
    try {
      await completeOnboarding();
      onClose();
      router.push("/dashboard/campaigns/new");
    } catch (error) {
      console.error("Erreur lors de la validation de l'onboarding:", error);
      onClose();
    }
  };

  const handleClose = async () => {
    try {
      await completeOnboarding();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation de l'onboarding:", error);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "Bienvenue !" : step === 2 ? "Fonctionnement" : "C'est parti !"}
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="flex flex-col items-center text-center space-y-6 py-2">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-[#F5F5FE] text-[#000091] rounded-full flex items-center justify-center shadow-inner">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#161616]">
              Bienvenue sur Bailconnect ! 👋
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed max-w-sm mx-auto">
              La plateforme simplifiée pour gérer vos candidatures locatives en toute sérénité.
            </p>
          </div>
        )}

        {/* Step 2: How it works */}
        {step === 2 && (
          <div className="space-y-4 w-full text-left animate-fade-in">
            <h3 className="text-base font-extrabold text-[#161616] text-center mb-2">
              Comment fonctionne Bail-Connect ?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F5F5FE] text-[#000091] rounded-lg shrink-0 mt-0.5">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#161616]">1. Ajoutez votre logement</h4>
                  <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                    Créez votre annonce en quelques clics et obtenez un lien de candidature unique à partager.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FFEFE0] text-[#B35C00] rounded-lg shrink-0 mt-0.5">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#161616]">2. Recevez des dossiers certifiés</h4>
                  <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                    Les candidats soumettent leur dossier garanti par l'État via le service sécurisé <strong>DossierFacile</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#E8F6EE] text-[#18753C] rounded-lg shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#161616]">3. Planifiez les visites sans effort</h4>
                  <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                    Définissez vos disponibilités et laissez les candidats réserver leurs créneaux en direct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Get Started Action */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-[#E8F6EE] text-[#18753C] rounded-full flex items-center justify-center shadow-inner">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#161616]">
              Prêt à commencer ? 🚀
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed max-w-sm mx-auto">
              Créez votre première annonce dès maintenant et facilitez la gestion de vos futurs locataires.
            </p>
          </div>
        )}

        {/* Navigation Indicator / Dots */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-[#000091]" : "w-2 bg-[#DDDDDD]"
                }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-[#F0F0F0] gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary text-xs flex items-center gap-1.5 px-4 py-2 cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Précédent
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-xs font-bold text-[#666666] hover:text-[#161616] hover:underline transition-colors px-2 py-2 cursor-pointer"
            >
              Passer l'introduction
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 cursor-pointer font-bold"
            >
              Suivant <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary text-xs flex items-center gap-1.5 px-5 py-2 cursor-pointer font-bold bg-[#18753C] hover:bg-[#135E30]"
            >
              Créer mon annonce <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
