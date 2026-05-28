"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import {
  AlertCircle,
  CheckCircle,
  Home,
  MapPin,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";
import Dialog from "@/components/Dialog";
import { formatError } from "@/lib/errors";

function WithdrawContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");
  const bookingToken = searchParams.get("bookingToken");

  const data = useQuery(
    api.appointments.getBookingPageData,
    candidateId && bookingToken
      ? { candidateId: candidateId as any, bookingToken: bookingToken }
      : "skip"
  );

  const withdrawMutation = useMutation(api.candidates.withdraw);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleWithdraw = async () => {
    if (!candidateId || !bookingToken) return;
    setIsSubmitting(true);
    setIsConfirmOpen(false);

    try {
      await withdrawMutation({
        candidateId: candidateId as any,
        bookingToken: bookingToken,
      });
      setSuccess(true);
      setToast({ message: "Votre candidature a été retirée.", type: "success" });
    } catch (err: any) {
      setToast({ message: formatError(err), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidateId || !bookingToken) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-xs animate-in fade-in duration-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#161616] mb-2">Lien invalide</h1>
        <p className="text-sm text-[#666666]">
          Identifiant de candidat ou jeton de réservation manquant. Veuillez vérifier le lien reçu par e-mail.
        </p>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="text-center py-12">
        <span className="text-sm text-[#666666]">Chargement de vos informations...</span>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-xs animate-in fade-in duration-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#161616] mb-2">Lien expiré ou invalide</h1>
        <p className="text-sm text-[#666666]">
          Cette candidature n&apos;existe plus ou le lien de sécurité est incorrect.
        </p>
      </div>
    );
  }

  const { candidate, campaign } = data;

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-md animate-in fade-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#161616] mb-3">Candidature retirée</h1>
        <p className="text-sm text-[#666666] mb-6">
          Votre dossier pour le logement <strong>{campaign?.title}</strong> a été retiré de la plateforme avec succès.
        </p>
        <p className="text-xs text-[#666666]">
          Nous vous souhaitons une excellente continuation dans vos recherches de logement.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-md space-y-6 animate-in fade-in duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#FCE8E6] text-[#CE0500] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#161616] mb-2">Retirer ma candidature</h1>
          <p className="text-sm text-[#666666]">
            Bonjour <strong>{candidate.firstName}</strong>, vous vous apprêtez à retirer votre dossier de candidature.
          </p>
        </div>

        <div className="bg-[#F5F5FE] border border-[#000091]/10 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Home className="w-4 h-4 text-[#000091] mt-0.5" />
            <div>
              <span className="block text-xs text-[#666666] font-semibold">Logement concerné</span>
              <span className="text-sm font-bold text-[#161616]">{campaign?.title}</span>
            </div>
          </div>
          {campaign?.address && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#000091] mt-0.5" />
              <div>
                <span className="block text-xs text-[#666666] font-semibold">Adresse</span>
                <span className="text-sm font-bold text-[#161616]">{campaign.address}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#FFF3CD] border border-[#FFEBAA] p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#856404] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#856404] uppercase tracking-wider">
              Attention : Action Irréversible
            </h4>
            <p className="text-xs text-[#664d03] mt-1 leading-relaxed">
              Le retrait de votre dossier est définitif. Le propriétaire sera notifié, votre dossier sera supprimé, et vos éventuelles visites planifiées pour ce logement seront annulées.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isSubmitting}
          className="btn-primary w-full bg-[#CE0500] hover:bg-[#a60400] text-white rounded-xl py-3 text-sm font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>Retirer ma candidature définitivement</span>
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmer le retrait de candidature ?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569] leading-relaxed">
            Êtes-vous sûr de vouloir retirer votre candidature pour le logement <strong>{campaign?.title}</strong> ?
          </p>
          <div className="bg-[#FCE8E6] border border-[#F8C0BC] p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#CE0500] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#CE0500] uppercase tracking-wider">
                Cette action ne peut pas être annulée
              </h4>
              <p className="text-xs text-[#a60400] mt-1 leading-relaxed">
                Vous perdrez votre place et devrez resoumettre un nouveau dossier complet si vous changez d&apos;avis.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              disabled={isSubmitting}
            >
              Conserver mon dossier
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#CE0500] text-white hover:bg-[#a60400] rounded font-bold flex items-center gap-1.5 border border-[#F8C0BC]"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Confirmer le retrait</span>
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default function WithdrawPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none">
            BC
          </div>
          <span className="font-bold text-[#161616] text-base">BailConnect</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center py-12 px-6">
        <Suspense fallback={
          <div className="text-center py-12">
            <span className="text-sm text-[#666666]">Chargement de la page de retrait...</span>
          </div>
        }>
          <WithdrawContent />
        </Suspense>
      </main>
    </div>
  );
}
