"use client";

import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  ArrowRight,
  Loader2,
  Bell,
  BellOff,
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Queries & Mutations
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.update);
  const updateNotificationPrefs = useMutation(api.users.updateNotificationPrefs);
  
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const verifySession = useAction(api.stripe.verifySession);
  const cancelSubscription = useAction(api.stripe.cancelSubscription);

  // States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Notification prefs state
  const [notifPref, setNotifPref] = useState<"daily" | "none">("daily");
  const [digestHour, setDigestHour] = useState(18);
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  // Cancellation States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationFeedback, setCancellationFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const sessionId = searchParams.get("session_id");
  const isVerifyingRef = useRef(false);

  const handleCancelSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationReason) {
      setToast({
        message: "Veuillez sélectionner un motif de résiliation.",
        type: "error",
      });
      return;
    }
    setIsCancelling(true);
    try {
      const result = await cancelSubscription({
        reason: cancellationReason,
        feedback: cancellationFeedback.trim() || undefined,
      });
      if (result.success) {
        setToast({
          message: "Votre abonnement a été résilié avec succès.",
          type: "success",
        });
        setCancelModalOpen(false);
        setCancellationReason("");
        setCancellationFeedback("");
      } else {
        setToast({
          message: result.error || "Une erreur est survenue lors de la résiliation.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Erreur lors de la résiliation de l'abonnement.",
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (sessionId && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      const verify = async () => {
        try {
          const result = await verifySession({ sessionId });
          if (result.success) {
            setToast({
              message: "Félicitations ! Votre abonnement PRO est désormais actif.",
              type: "success"
            });
            router.replace("/profile");
          } else {
            setToast({
              message: result.error || "Le paiement n'a pas pu être vérifié.",
              type: "error"
            });
          }
        } catch (err: any) {
          console.error(err);
          setToast({
            message: err.message || "Erreur de validation de l'abonnement.",
            type: "error"
          });
        }
      };
      verify();
    }
  }, [sessionId, verifySession, router]);

  // Sync user values
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setNotifPref((user.notificationPreference as "daily" | "none") ?? "daily");
      setDigestHour(user.digestHour ?? 18);
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

  const handleUpgradePlan = async (planName: string) => {
    setToast({
      message: `Redirection vers la page de paiement sécurisée de Stripe pour l'${planName}...`,
      type: "success"
    });
    
    try {
      const { url } = await createCheckoutSession({
        type: "pro"
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Impossible de générer le lien de paiement.");
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Une erreur est survenue lors de la redirection vers Stripe.",
        type: "error"
      });
    }
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
          <div className="md:col-span-2 space-y-6 order-2 md:order-1">
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
                <Bell className="w-5 h-5 text-[#000091]" /> Notifications par email
              </h2>
              <p className="text-xs text-[#666666] mb-5 leading-relaxed">
                Recevez un récap quotidien de vos nouvelles candidatures et réservations de créneaux.
              </p>

              <div className="space-y-3 mb-5">
                {/* Daily option */}
                <label
                  htmlFor="notif-daily"
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    notifPref === "daily"
                      ? "border-[#000091] bg-[#F5F5FE]"
                      : "border-[#DDDDDD] hover:border-[#AAAAAA]"
                  }`}
                >
                  <input
                    id="notif-daily"
                    type="radio"
                    name="notifPref"
                    value="daily"
                    checked={notifPref === "daily"}
                    onChange={() => setNotifPref("daily")}
                    className="mt-0.5 accent-[#000091] cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#161616] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#000091]" /> Digest quotidien
                    </p>
                    <p className="text-xs text-[#666666] mt-0.5">Un seul email par jour regroupant toute l&apos;activité.</p>
                    {notifPref === "daily" && (
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs font-bold text-[#3A3A3A] shrink-0">Heure d&apos;envoi :</label>
                        <select
                          value={digestHour}
                          onChange={(e) => setDigestHour(Number(e.target.value))}
                          className="text-sm border border-[#CCCCCC] rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-[#000091] transition-all cursor-pointer"
                        >
                          {Array.from({ length: 24 }, (_, h) => (
                            <option key={h} value={h}>
                              {String(h).padStart(2, "0")}:00
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                {/* None option */}
                <label
                  htmlFor="notif-none"
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    notifPref === "none"
                      ? "border-[#CE0500] bg-[#FEF5F5]"
                      : "border-[#DDDDDD] hover:border-[#AAAAAA]"
                  }`}
                >
                  <input
                    id="notif-none"
                    type="radio"
                    name="notifPref"
                    value="none"
                    checked={notifPref === "none"}
                    onChange={() => setNotifPref("none")}
                    className="mt-0.5 accent-[#CE0500] cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#161616] flex items-center gap-1.5">
                      <BellOff className="w-3.5 h-3.5 text-[#CE0500]" /> Désactivé
                    </p>
                    <p className="text-xs text-[#666666] mt-0.5">Aucun email de notification. Consultez le tableau de bord manuellement.</p>
                  </div>
                </label>
              </div>

              <button
                type="button"
                disabled={isSavingNotif}
                onClick={async () => {
                  setIsSavingNotif(true);
                  try {
                    await updateNotificationPrefs({
                      notificationPreference: notifPref,
                      digestHour,
                    });
                    setToast({ message: "Préférences de notifications mises à jour !", type: "success" });
                  } catch (err: any) {
                    setToast({ message: err.message || "Erreur lors de la sauvegarde.", type: "error" });
                  } finally {
                    setIsSavingNotif(false);
                  }
                }}
                className="btn-primary w-full sm:w-auto text-center justify-center"
              >
                {isSavingNotif ? "Enregistrement..." : "Enregistrer les préférences"}
              </button>
            </div>
          </div>

          {/* Right Column: Subscription details */}
          <div className="md:col-span-1 order-1 md:order-2">
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
                  {currentTier === "free" ? "Gratuit (limité à 10 dossiers)" : "49 € par mois"}
                </span>
              </div>

              {/* Available Upgrades & Options */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-[#3A3A3A] uppercase tracking-wider">
                  {currentTier === "pro" ? "Gérer mon abonnement" : "Faire évoluer mon offre"}
                </h3>

                {currentTier !== "pro" ? (
                  <div 
                    onClick={() => handleUpgradePlan("Abonnement Pro")}
                    className="border border-[#DDDDDD] hover:border-[#000091] rounded-xl p-4 cursor-pointer transition-all group hover:bg-[#F5F5FE]/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-[#161616] flex items-center gap-1">
                        Abonnement Pro <Sparkles className="w-3.5 h-3.5 text-[#B35C00]" />
                      </span>
                      <span className="font-bold text-sm text-[#000091]">49 €<span className="text-[10px] text-[#666666]">/m</span></span>
                    </div>
                    <p className="text-[11px] text-[#666666] leading-relaxed mb-3">
                      Gestion multi-biens illimitée, exportations de dossiers et options d&apos;automatisation avancées.
                    </p>
                    <div className="text-xs font-bold text-[#000091] group-hover:underline flex items-center gap-1">
                      Choisir cette offre <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-[#666666] leading-relaxed">
                      Vous disposez de toutes les fonctionnalités PRO. Si vous ne souhaitez plus utiliser ces avantages, vous pouvez résilier votre abonnement.
                    </p>
                    <button 
                      onClick={() => setCancelModalOpen(true)}
                      className="w-full text-center py-2.5 px-4 border border-[#CE0500] text-[#CE0500] hover:bg-[#FCE8E6] text-xs font-bold rounded-xl transition-all cursor-pointer animate-scale-in"
                    >
                      Résilier mon abonnement
                    </button>
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

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-[#161616]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-[#161616] text-sm">Résilier mon abonnement PRO</h3>
              <button
                onClick={() => {
                  if (!isCancelling) {
                    setCancelModalOpen(false);
                  }
                }}
                disabled={isCancelling}
                className="text-[#666666] hover:text-[#161616] text-lg font-semibold w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#EEEEEE] transition-colors disabled:opacity-50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCancelSubscription}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-[#666666] leading-relaxed">
                  Nous sommes désolés de vous voir partir. Aidez-nous à nous améliorer en indiquant la raison de votre résiliation :
                </p>

                <div className="space-y-2">
                  {[
                    "C'est trop cher",
                    "Je n'ai plus d'annonce de location active",
                    "L'outil est trop complexe ou difficile à utiliser",
                    "J'ai trouvé une autre solution",
                    "Autre raison (préciser ci-dessous)"
                  ].map((reasonOption) => (
                    <label
                      key={reasonOption}
                      className="flex items-start gap-2.5 p-2 rounded-lg border border-[#EEEEEE] hover:bg-[#F6F6F6] cursor-pointer text-xs text-[#3A3A3A] transition-colors"
                    >
                      <input
                        type="radio"
                        name="cancellationReason"
                        required
                        value={reasonOption}
                        checked={cancellationReason === reasonOption}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="mt-0.5 accent-[#000091] cursor-pointer"
                      />
                      <span>{reasonOption}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="feedback" className="block text-xs font-bold text-[#3A3A3A]">
                    Commentaire ou suggestion (Optionnel)
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={cancellationFeedback}
                    onChange={(e) => setCancellationFeedback(e.target.value)}
                    placeholder="Dites-nous en plus pour nous aider à nous améliorer..."
                    className="w-full text-xs border border-[#CCCCCC] rounded-md p-2 bg-white focus:outline-none focus:border-[#000091] transition-all resize-none"
                    disabled={isCancelling}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="btn-secondary flex-1 py-2 rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCancelling || !cancellationReason}
                  className="btn-primary flex-1 py-2 rounded-xl text-xs bg-[#CE0500] hover:bg-[#a60400] text-white font-bold flex items-center justify-center gap-1.5 border-[#CE0500]"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Résiliation...</span>
                    </>
                  ) : (
                    <span>Confirmer la résiliation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
