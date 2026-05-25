"use client";

import Dialog from "./Dialog";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";

interface DeleteSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function DeleteSlotDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteSlotDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer ce créneau ?"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#475569] leading-relaxed">
          Voulez-vous vraiment supprimer ce créneau de visite et annuler tous les rendez-vous associés ?
        </p>
        <div className="bg-[#FFF3CD] border border-[#FFEBAA] p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#856404] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#856404] uppercase tracking-wider">
              Attention : Action Irréversible
            </h4>
            <p className="text-xs text-[#664d03] mt-1 leading-relaxed">
              Les candidats inscrits sur ce créneau recevront une notification d'annulation et devront planifier un nouveau rendez-vous.
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#CE0500] text-white hover:bg-[#a60400] rounded font-bold flex items-center gap-1.5 border border-[#F8C0BC]"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Confirmer la suppression</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
