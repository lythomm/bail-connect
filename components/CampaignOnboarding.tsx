"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Dialog from "./Dialog";
import { Home, Users, CalendarDays, Share2, CheckCircle2 } from "lucide-react";

interface CampaignOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignOnboarding({ isOpen, onClose }: CampaignOnboardingProps) {
  const completeCampaignOnboarding = useMutation(api.users.completeCampaignOnboarding);

  const handleFinish = async () => {
    try {
      await completeCampaignOnboarding();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation de l'onboarding du logement:", error);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleFinish}
      title="Gérer votre logement"
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="flex flex-col items-center space-y-6 py-2">
        <div className="mx-auto w-16 h-16 bg-[#F5F5FE] text-[#000091] rounded-full flex items-center justify-center shadow-inner">
          <Home className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-extrabold text-[#161616]">
            Votre annonce est en ligne ! 🎉
          </h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
            Voici comment gérer efficacement ce logement et traiter les dossiers des candidats.
          </p>
        </div>

        <div className="space-y-4 w-full text-left">
          {/* Feature 1 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Gestion des candidats</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Visualisez la liste des dossiers reçus, triez-les et changez leur statut (Accepter / Refuser). <strong>Les e-mails de notification aux candidats sont entièrement automatisés !</strong>
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Visites & Créneaux</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Rendez-vous dans l'onglet <strong>"Visites & Créneaux"</strong> pour définir des créneaux horaires de visite dédiés uniquement à ce logement.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Partage direct</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Utilisez le bouton de partage en haut à droite pour copier le lien public de votre annonce et le diffuser auprès des candidats.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#E8F6EE] text-[#18753C] rounded-md shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#18753C]">Mise en location (Logement "Loué")</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Une fois votre locataire trouvé, marquez l'annonce comme <strong>"Loué"</strong> pour cesser instantanément de recevoir des candidatures et des e-mails.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0F0F0] w-full flex justify-end">
          <button
            onClick={handleFinish}
            className="btn-primary text-xs px-6 py-2 cursor-pointer font-bold bg-[#000091] hover:bg-[#00007A]"
          >
            C'est compris !
          </button>
        </div>
      </div>
    </Dialog>
  );
}
