"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Dialog from "./Dialog";
import { CalendarRange, Filter, Info, Plus, MousePointerClick } from "lucide-react";

interface CalendarOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarOnboarding({ isOpen, onClose }: CalendarOnboardingProps) {
  const completeCalendarOnboarding = useMutation(api.users.completeCalendarOnboarding);

  const handleFinish = async () => {
    try {
      await completeCalendarOnboarding();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation de l'onboarding calendrier:", error);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleFinish}
      title="Découvrir l'Agenda"
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="flex flex-col items-center space-y-6 py-2">
        <div className="mx-auto w-16 h-16 bg-[#F5F5FE] text-[#000091] rounded-full flex items-center justify-center shadow-inner">
          <CalendarRange className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-extrabold text-[#161616]">
            Bienvenue sur votre Agenda ! 📅
          </h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
            Voici comment organiser vos visites immobilières et gérer les rendez-vous de vos candidats.
          </p>
        </div>

        <div className="space-y-4 w-full text-left">
          {/* Feature 1 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Vue centralisée de vos biens</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Cet agenda regroupe l'ensemble des visites et créneaux pour <strong>tous vos logements actifs</strong> en une seule vue.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Filtre par annonce</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Utilisez le menu déroulant en haut du panneau pour isoler un logement spécifique et n'afficher que ses visites.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Détail quotidien au clic</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Cliquez sur n'importe quel jour du calendrier pour voir immédiatement ses créneaux, les logements associés et les candidatures des visiteurs.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F5F5FE] text-[#000091] rounded-md shrink-0 mt-0.5">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#161616]">Création directe de créneaux</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Ajoutez de nouvelles disponibilités pour les visites en cliquant sur le bouton <strong>"Ajouter un créneau"</strong> dans le volet latéral.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#E8F6EE] text-[#18753C] rounded-md shrink-0 mt-0.5">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#18753C]">Multi-sélection sur PC</h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                <strong>Gagnez du temps :</strong> cliquez et glissez sur plusieurs jours pour y appliquer simultanément les mêmes créneaux horaires d'un coup.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0F0F0] w-full flex justify-end">
          <button
            onClick={handleFinish}
            className="btn-primary text-xs px-6 py-2 cursor-pointer font-bold bg-[#000091] hover:bg-[#00007A]"
          >
            Compris, c'est noté !
          </button>
        </div>
      </div>
    </Dialog>
  );
}
