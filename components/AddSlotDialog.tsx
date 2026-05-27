"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Dialog from "./Dialog";
import { formatDateParis } from "@/lib/dateUtils";
import { ToastType } from "./Toast";
import { formatError } from "@/lib/errors";

interface AddSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  preSelectedDates?: string[];
  campaigns: { _id: string; title: string }[];
  onSuccess: () => void;
  setToast: (toast: { message: string; type: ToastType } | null) => void;
}

export default function AddSlotDialog({
  isOpen,
  onClose,
  campaignId,
  preSelectedDates,
  campaigns,
  onSuccess,
  setToast,
}: AddSlotDialogProps) {
  const createSlotMutation = useMutation(api.appointments.createSlot);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:30");
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync campaign selection
  useEffect(() => {
    if (campaignId) {
      setSelectedCampaignId(campaignId);
    } else if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0]._id);
    }
  }, [campaignId, campaigns, selectedCampaignId]);

  // Sync pre-selected dates from props if available
  useEffect(() => {
    if (preSelectedDates) {
      setSelectedDates(new Set(preSelectedDates));
    } else {
      setSelectedDates(new Set());
    }
  }, [preSelectedDates, isOpen]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  const isPrevMonthDisabled =
    currentMonth.getFullYear() <= today.getFullYear() &&
    currentMonth.getMonth() <= today.getMonth();

  const handleToggleDate = (dateStr: string) => {
    const nextSelected = new Set(selectedDates);
    if (nextSelected.has(dateStr)) {
      nextSelected.delete(dateStr);
    } else {
      nextSelected.add(dateStr);
    }
    setSelectedDates(nextSelected);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      setToast({ message: "Veuillez sélectionner une annonce d'abord.", type: "error" });
      return;
    }

    const datesArray = Array.from(selectedDates);
    if (datesArray.length === 0) {
      setToast({ message: "Veuillez sélectionner au moins un jour de visite.", type: "error" });
      return;
    }

    // Validation checks
    for (const dStr of datesArray) {
      const start = new Date(`${dStr}T${newSlotStart}`);
      const end = new Date(`${dStr}T${newSlotEnd}`);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setToast({ message: "Veuillez entrer des heures valides.", type: "error" });
        return;
      }
      if (end.getTime() <= start.getTime()) {
        setToast({ message: "L'heure de fin doit être après l'heure de début.", type: "error" });
        return;
      }
      if (start.getTime() < Date.now()) {
        setToast({ message: "Impossible de créer un créneau dans le passé.", type: "error" });
        return;
      }
    }

    setIsSubmitting(false);
    try {
      setIsSubmitting(true);
      await Promise.all(
        datesArray.map(async (dStr) => {
          const start = new Date(`${dStr}T${newSlotStart}`);
          const end = new Date(`${dStr}T${newSlotEnd}`);
          await createSlotMutation({
            campaignId: selectedCampaignId as any,
            startTime: start.getTime(),
            endTime: end.getTime(),
            maxCapacity: newSlotCapacity,
          });
        })
      );

      setToast({
        message: datesArray.length > 1
          ? `Créneaux ajoutés avec succès pour ${datesArray.length} jours !`
          : "Créneau ajouté avec succès !",
        type: "success",
      });
      onSuccess();
    } catch (err: any) {
      setToast({ message: formatError(err), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar math
  const mYear = currentMonth.getFullYear();
  const mMonth = currentMonth.getMonth();
  const mFirstDay = new Date(mYear, mMonth, 1);
  const mStartDayOffset = (mFirstDay.getDay() + 6) % 7; // Monday start
  const mDaysInMonthCount = new Date(mYear, mMonth + 1, 0).getDate();
  const mDaysInMonth = Array.from({ length: mDaysInMonthCount }, (_, i) => i + 1);

  // Formatting date for banner when preSelectedDates are present
  const formatBannerLabel = () => {
    const datesArray = Array.from(selectedDates);
    if (datesArray.length === 0) return "";
    if (datesArray.length === 1) {
      const parts = datesArray[0].split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return `Jour de visite : ${formatDateParis(d.getTime())}`;
    }
    return `${datesArray.length} jours sélectionnés pour l'ajout de créneau`;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Ajouter un créneau de visite" size="md">
      <form onSubmit={handleAddSlot} className="space-y-4">
        {preSelectedDates && preSelectedDates.length > 0 ? (
          <div className="bg-[#F5F5FE] p-3 rounded-md border border-[#000091]/10 mb-4">
            <span className="text-xs font-bold text-[#000091]">{formatBannerLabel()}</span>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">
              Choisir les jours de visite
            </label>
            <div className="border border-[#E2E8F0] p-4 rounded-lg bg-[#F8FAFC]">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={isPrevMonthDisabled}
                  className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-[#E2E8F0] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-[#666666]" />
                </button>
                <span className="text-sm font-bold text-[#161616] capitalize">
                  {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-[#E2E8F0] transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-[#666666]" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#666666] mb-2 border-b border-[#E2E8F0] pb-1.5">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 select-none">
                {Array.from({ length: mStartDayOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="aspect-square bg-transparent"></div>
                ))}
                {mDaysInMonth.map((day) => {
                  const mm = String(mMonth + 1).padStart(2, "0");
                  const dd = String(day).padStart(2, "0");
                  const dateStr = `${mYear}-${mm}-${dd}`;
                  const isSelected = selectedDates.has(dateStr);

                  // Disable past dates
                  const dayDate = new Date(mYear, mMonth, day);
                  const todayDate = new Date();
                  todayDate.setHours(0, 0, 0, 0);
                  dayDate.setHours(0, 0, 0, 0);
                  const isPast = dayDate.getTime() < todayDate.getTime();

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleToggleDate(dateStr)}
                      className={`aspect-square text-xs font-semibold rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer border ${isPast
                        ? "text-[#CBD5E1] bg-[#F8FAFC] border-transparent cursor-not-allowed"
                        : isSelected
                          ? "bg-[#000091] text-white border-[#000091] hover:bg-[#0b0b7d]"
                          : "text-[#161616] bg-white border-[#E2E8F0] hover:border-[#94A3B8]"
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDates.size > 0 && (
              <div className="mt-2 text-xs text-[#666666]">
                {selectedDates.size} {selectedDates.size > 1 ? "jours sélectionnés" : "jour sélectionné"}
              </div>
            )}
          </div>
        )}

        {/* Campaign Selection Selector (only if not campaign-scoped) */}
        {!campaignId && (
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Bien concerné</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091] font-semibold"
            >
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure début</label>
            <input
              type="time"
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure fin</label>
            <input
              type="time"
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              required
            />
          </div>
        </div>

        {/* Capacity Input */}
        <div>
          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">
            Capacité maximale (nombre de visiteurs)
          </label>
          <input
            type="number"
            min="0"
            value={newSlotCapacity}
            onChange={(e) => setNewSlotCapacity(parseInt(e.target.value) || 1)}
            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
            required
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#000091] text-white hover:bg-[#0b0b7d] rounded font-bold flex items-center justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Créer le créneau"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
