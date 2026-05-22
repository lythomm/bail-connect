"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Home, 
  AlertCircle, 
  Check, 
  ChevronRight,
  MapPin,
  Euro
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

function BookingContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");

  const data = useQuery(
    api.appointments.getBookingPageData,
    candidateId ? { candidateId: candidateId as any } : "skip"
  );

  const bookMutation = useMutation(api.appointments.bookAppointment);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAppt, setSuccessAppt] = useState<{ date: string; time: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  if (!candidateId) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#161616] mb-2">Lien invalide</h1>
        <p className="text-sm text-[#666666]">
          Aucun identifiant de candidat n&apos;a été fourni. Veuillez vérifier le lien reçu par e-mail.
        </p>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="text-center py-12">
        <span className="text-sm text-[#666666]">Chargement de votre invitation...</span>
      </div>
    );
  }

  if (data === null || data.error) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#161616] mb-2">Invitation invalide</h1>
        <p className="text-sm text-[#666666]">
          Cette invitation n&apos;existe pas, est expirée ou votre candidature n&apos;a pas encore été acceptée par le propriétaire.
        </p>
      </div>
    );
  }

  const { candidate, campaign, slots, currentAppointment } = data;

  const handleBook = async () => {
    if (!selectedSlotId) return;
    setIsSubmitting(true);

    try {
      await bookMutation({
        slotId: selectedSlotId as any,
        candidateId: candidateId as any,
      });

      const selectedSlot = slots.find(s => s._id === selectedSlotId);
      if (selectedSlot) {
        const dateStr = new Date(selectedSlot.startTime).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        });
        const timeStr = `${new Date(selectedSlot.startTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        })} - ${new Date(selectedSlot.endTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        })}`;
        setSuccessAppt({ date: dateStr, time: timeStr });
      }

      setToast({ message: "Votre rendez-vous a été enregistré !", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la réservation.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find currently booked slot
  const bookedSlot = currentAppointment 
    ? slots.find(s => s._id === currentAppointment.slotId)
    : null;

  const bookedSlotDetails = bookedSlot ? {
    date: new Date(bookedSlot.startTime).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    time: `${new Date(bookedSlot.startTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    })} - ${new Date(bookedSlot.endTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`
  } : null;

  if (successAppt) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-md animate-in fade-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#161616] mb-3">Visite confirmée !</h1>
        <p className="text-sm text-[#666666] mb-6">
          Félicitations <strong>{candidate.firstName}</strong>, votre rendez-vous de visite a bien été planifié et validé avec le propriétaire.
        </p>

        <div className="bg-[#F5F5FE] border border-[#000091]/10 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-start gap-2.5">
            <Home className="w-4 h-4 text-[#000091] mt-0.5" />
            <div>
              <span className="block text-xs text-[#666666] font-semibold">Logement</span>
              <span className="text-sm font-bold text-[#161616]">{campaign?.title}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CalendarIcon className="w-4 h-4 text-[#000091] mt-0.5" />
            <div>
              <span className="block text-xs text-[#666666] font-semibold">Date de visite</span>
              <span className="text-sm font-bold text-[#161616] capitalize">{successAppt.date}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#000091] mt-0.5" />
            <div>
              <span className="block text-xs text-[#666666] font-semibold">Plage horaire</span>
              <span className="text-sm font-bold text-[#161616]">{successAppt.time}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#666666]">
          Un e-mail de confirmation vous a été envoyé. Si vous devez modifier votre créneau, vous pouvez réutiliser le même lien reçu.
        </p>
      </div>
    );
  }

  // Filter available slots
  const availableSlots = slots.filter(s => s.bookedCount < s.maxCapacity || s._id === currentAppointment?.slotId);

  // Group slots by day
  const groupedSlots: Record<string, any[]> = {};
  availableSlots.forEach(s => {
    const dayLabel = new Date(s.startTime).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    if (!groupedSlots[dayLabel]) {
      groupedSlots[dayLabel] = [];
    }
    groupedSlots[dayLabel].push(s);
  });

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6">
      {/* Campaign header card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="gov-badge mb-1">Candidature Retenue</span>
          <h1 className="text-xl font-bold text-[#161616]">{campaign?.title}</h1>
          {campaign?.rentAmount && (
            <div className="flex items-center gap-1 text-xs text-[#666666]">
              <Euro className="w-3.5 h-3.5" />
              <span>{campaign.rentAmount.toLocaleString("fr-FR")} € / mois CC</span>
            </div>
          )}
        </div>
        <div className="text-sm text-[#3A3A3A] bg-[#F5F5FE] px-4 py-2 border border-[#000091]/10 rounded-lg">
          Candidat : <strong className="text-[#000091]">{candidate.firstName} {candidate.lastName}</strong>
        </div>
      </div>

      {/* Reschedule alert banner */}
      {bookedSlotDetails && (
        <div className="bg-[#E8F6EE] border border-[#18753C]/20 rounded-2xl p-4 flex gap-3 items-start text-sm text-[#18753C]">
          <Check className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Vous avez déjà réservé un créneau :</p>
            <p className="mt-1 capitalize">
              {bookedSlotDetails.date} de {bookedSlotDetails.time}.
            </p>
            <p className="text-xs text-[#18753C]/80 mt-1">
              Vous pouvez sélectionner un nouveau créneau ci-dessous pour déplacer votre rendez-vous.
            </p>
          </div>
        </div>
      )}

      {/* Slots selection */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#161616]">Choisissez votre créneau de visite</h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Sélectionnez une des disponibilités proposées par le propriétaire pour planifier votre rencontre.
          </p>
        </div>

        {availableSlots.length === 0 ? (
          <div className="text-center py-12 text-[#666666]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#666666]/50" />
            <p className="text-sm font-semibold">Aucun créneau de visite n&apos;est disponible actuellement.</p>
            <p className="text-xs mt-1">Veuillez contacter le propriétaire pour qu&apos;il ajoute de nouvelles dates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedSlots).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(dayLabel => (
              <div key={dayLabel} className="space-y-3">
                <h3 className="text-sm font-bold text-[#161616] capitalize border-l-4 border-[#000091] pl-2">
                  {dayLabel}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {groupedSlots[dayLabel].map(slot => {
                    const isSelected = selectedSlotId === slot._id;
                    const isCurrentlyBooked = currentAppointment?.slotId === slot._id;
                    const timeString = `${new Date(slot.startTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })} - ${new Date(slot.endTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}`;

                    return (
                      <button
                        key={slot._id}
                        onClick={() => setSelectedSlotId(slot._id)}
                        className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "bg-[#000091] border-[#000091] text-white shadow-sm scale-[1.02]"
                            : isCurrentlyBooked
                              ? "bg-[#E8F6EE] border-[#18753C]/30 text-[#18753C]"
                              : "bg-white border-[#E2E8F0] hover:border-[#000091] text-[#161616]"
                        }`}
                      >
                        <span className="text-sm font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {timeString}
                        </span>
                        <span className={`text-[10px] mt-1.5 block font-semibold ${
                          isSelected 
                            ? "text-white/80" 
                            : isCurrentlyBooked 
                              ? "text-[#18753C]/80" 
                              : "text-[#666666]"
                        }`}>
                          {isCurrentlyBooked ? "Votre créneau" : `${slot.bookedCount}/${slot.maxCapacity} réservé(s)`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#DDDDDD] flex justify-end">
          <button
            onClick={handleBook}
            disabled={!selectedSlotId || isSubmitting}
            className={`btn-primary px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer ${
              (!selectedSlotId || isSubmitting) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer le rendez-vous"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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

export default function BookPage() {
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
            <span className="text-sm text-[#666666]">Chargement de la page de réservation...</span>
          </div>
        }>
          <BookingContent />
        </Suspense>
      </main>
    </div>
  );
}
