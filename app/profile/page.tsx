"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CreditCard, 
  Check, 
  Sparkles, 
  CheckCircle,
  Building,
  ArrowRight
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Queries & Mutations
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.update);

  // States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Sync user values
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || user === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre compte...</span>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setToast({
        message: "Profil mis à jour avec succès !",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: "Erreur lors de la mise à jour du profil.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradePlan = (planName: string) => {
    setToast({
      message: `Félicitations ! Vous avez sélectionné la formule ${planName}. Redirection vers notre module de paiement sécurisé...`,
      type: "success"
    });
  };

  const currentTier = user?.tier || "free";

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="gov-badge mb-2">Mon compte</span>
          <h1 className="text-2xl font-bold text-[#161616]">Mon Profil</h1>
          <p className="text-sm text-[#666666] mt-1">
            Gérez vos informations personnelles, vos paramètres de notifications et votre abonnement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-6">
              <h2 className="text-lg font-bold text-[#161616] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#000091]" /> Informations personnelles
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#666666]" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full text-sm border border-[#DDDDDD] bg-[#F5F5FE] text-[#666666] rounded-md pl-10 pr-3 py-2 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#666666] mt-1">L&apos;adresse email ne peut pas être modifiée.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Nom complet</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#666666]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Thomas Durand"
                      className="w-full text-sm border border-[#CCCCCC] rounded-md pl-10 pr-3 py-2 bg-white focus:outline-none focus:border-[#000091] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Numéro de téléphone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-[#666666]" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 06 12 34 56 78"
                      className="w-full text-sm border border-[#CCCCCC] rounded-md pl-10 pr-3 py-2 bg-white focus:outline-none focus:border-[#000091] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full sm:w-auto text-center justify-center"
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </div>

            {/* Notification settings */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-6">
              <h2 className="text-lg font-bold text-[#161616] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#000091]" /> Préférences et Sécurité
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#F0F0F0]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#161616]">Alertes SMS pour nouveaux dossiers</h3>
                    <p className="text-xs text-[#666666]">Recevoir un SMS lorsqu&apos;un candidat soumet un dossier certifié.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#000091]" />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F0F0F0]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#161616]">Rappels automatiques de visites</h3>
                    <p className="text-xs text-[#666666]">Envoyer un SMS de rappel aux candidats 24 heures avant la visite.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#000091]" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#161616]">Double authentification (MFA)</h3>
                    <p className="text-xs text-[#666666]">Sécuriser les connexions à mon espace personnel.</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#666666] bg-[#EEEEEE] px-2 py-0.5 rounded-sm">Bientôt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Subscription details */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#161616] mb-1 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#000091]" /> Mon Offre
                </h2>
                <p className="text-xs text-[#666666]">Votre formule actuelle et factures.</p>
              </div>

              {/* Display current plan info */}
              <div className="bg-[#F5F5FE] border border-[#E3E3FD] rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-[#000091] uppercase tracking-wider block mb-1">Formule Actuelle</span>
                <span className="text-2xl font-extrabold text-[#000091] block">
                  {currentTier === "free" ? "Découverte" : "Abonnement Pro"}
                </span>
                <span className="text-xs text-[#666666] block mt-1">
                  {currentTier === "free" ? "Gratuit (limité à 10 dossiers)" : "39 € par mois"}
                </span>
              </div>

              {/* Available Upgrades */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-[#3A3A3A] uppercase tracking-wider">Faire évoluer mon offre</h3>

                {currentTier !== "pro" && (
                  <div 
                    onClick={() => handleUpgradePlan("Abonnement Pro")}
                    className="border border-[#DDDDDD] hover:border-[#000091] rounded-xl p-4 cursor-pointer transition-all group hover:bg-[#F5F5FE]/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-[#161616] flex items-center gap-1">
                        Abonnement Pro <Sparkles className="w-3.5 h-3.5 text-[#B35C00]" />
                      </span>
                      <span className="font-bold text-sm text-[#000091]">39 €<span className="text-[10px] text-[#666666]">/m</span></span>
                    </div>
                    <p className="text-[11px] text-[#666666] leading-relaxed mb-3">
                      Gestion multi-biens illimitée, exportations de dossiers et options d&apos;automatisation avancées.
                    </p>
                    <div className="text-xs font-bold text-[#000091] group-hover:underline flex items-center gap-1">
                      Choisir cette offre <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
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
    </div>
  );
}
