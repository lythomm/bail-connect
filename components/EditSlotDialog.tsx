"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import Dialog from "./Dialog";
import { toParisDateStr, formatTimeParis } from "@/lib/dateUtils";
import { ToastType } from "./Toast";
import { formatError } from "@/lib/errors";

interface EditSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    _id: string;
    startTime: number;
    endTime: number;
    maxCapacity: number;
    bookedCount: number;
  } | null;
  onSuccess: () => void;
  setToast: (toast: { message: string; type: ToastType } | null) => void;
}

export default function EditSlotDialog({
  isOpen,
  onClose,
  slot,
  onSuccess,
  setToast,
}: EditSlotDialogProps) {
  const updateSlotMutation = useMutation(api.appointments.updateSlot);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [capacity, setCapacity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with selected slot
  useEffect(() => {
    if (slot && isOpen) {
      setDate(toParisDateStr(slot.startTime));
      setStartTime(formatTimeParis(slot.startTime));
      setEndTime(formatTimeParis(slot.endTime));
      setCapacity(slot.maxCapacity);
    }
  }, [slot, isOpen]);

  const handleEditSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setToast({ message: "Veuillez entrer des heures valides.", type: "error" });
      return;
    }

    if (start.getTime() < Date.now()) {
      setToast({ message: "Impossible de définir un créneau dans le passé.", type: "error" });
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setToast({ message: "L'heure de fin doit être après l'heure de début.", type: "error" });
      return;
    }

    if (capacity < slot.bookedCount) {
      setToast({
        message: "La nouvelle capacité est inférieure au nombre de réservations existantes.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSlotMutation({
        slotId: slot._id as any,
        startTime: start.getTime(),
        endTime: end.getTime(),
        maxCapacity: capacity,
      });

      setToast({
        message: "Créneau modifié avec succès !",
        type: "success",
      });
      onSuccess();
    } catch (err: any) {
      setToast({ message: formatError(err), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = toParisDateStr(Date.now());

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Modifier le créneau de visite" size="md">
      <form onSubmit={handleEditSlot} className="space-y-4">
        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">
            Date de visite
          </label>
          <input
            type="date"
            min={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091] font-semibold"
            required
          />
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure début</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
            required
          />
          {slot && slot.bookedCount > 0 && (
            <p className="text-[10px] text-[#666666] mt-1">
              Nombre de candidats inscrits actuellement : <strong>{slot.bookedCount}</strong>.
            </p>
          )}
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
              "Enregistrer les modifications"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
