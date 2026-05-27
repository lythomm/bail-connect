"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation, useConvexAuth, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  X,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  CalendarRange,
  Check,
  Filter,
  MapPin,
  Share2,
  AlertCircle
} from "lucide-react";
import Dialog from "@/components/Dialog";
import DeleteSlotDialog from "@/components/DeleteSlotDialog";
import CampaignOnboarding from "@/components/CampaignOnboarding";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  Row,
} from "@tanstack/react-table";
import Toast, { ToastType } from "@/components/Toast";

function TrigramCell({
  trigram,
  onCopy,
}: {
  trigram: string;
  onCopy: (message: string, type: ToastType) => void;
}) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(trigram);
      onCopy(`Trigramme "${trigram}" copié.`, "success");
    } catch (err) {
      console.error("Failed to copy", err);
      onCopy("Une erreur est survenue lors de la copie.", "error");
    }
  };

  return (
    <div className="justify-center flex">
      <button
        onClick={handleCopy}
        title="Copier le trigramme"
        className="font-mono font-bold text-[#000091] hover:text-[#0b0b7d] hover:bg-[#F5F5FE] px-2.5 py-1 rounded-md border border-[#E3E3FD] bg-[#F5F5FE]/40 cursor-pointer focus:outline-none flex items-center gap-1.5 group transition-all duration-150"
      >
        <span>{trigram}</span>
        <svg className="w-3.5 h-3.5 text-[#000091] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="1.5" ry="1.5" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </div>
  );
}

const JOB_STATUS_OPTIONS = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Student", label: "Étudiant" },
  { value: "Freelance", label: "Freelance" },
  { value: "Functionary", label: "Fonctionnaire" },
  { value: "Other", label: "Autre" },
];

const JOB_STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  CDI: { bg: "bg-[#E6F3EA]", text: "text-[#18753C]", border: "border-[#B9DFC5]", label: "CDI" },
  CDD: { bg: "bg-[#FFF6E3]", text: "text-[#B35900]", border: "border-[#FFE9B3]", label: "CDD" },
  Student: { bg: "bg-[#E3E3FD]", text: "text-[#000091]", border: "border-[#D0CFFF]", label: "Étudiant" },
  Freelance: { bg: "bg-[#FFF4FA]", text: "text-[#851657]", border: "border-[#FFE6F2]", label: "Freelance" },
  Functionary: { bg: "bg-[#E6FAFA]", text: "text-[#006363]", border: "border-[#B3F0F0]", label: "Fonctionnaire" },
  Other: { bg: "bg-[#F6F6F6]", text: "text-[#3A3A3A]", border: "border-[#DDDDDD]", label: "Autre" },
};

const GUARANTOR_OPTIONS = [
  { value: "yes", label: "Avec garant" },
  { value: "no", label: "Sans garant" },
];



export default function CampaignDetail() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as Id<"campaigns"> | undefined;

  const campaign = useQuery(api.campaigns.get, isAuthenticated && campaignId ? { id: campaignId } : "skip");
  const candidates = useQuery(api.candidates.getByCampaign, isAuthenticated && campaignId ? { campaignId } : "skip");
  const updateStatus = useMutation(api.candidates.updateStatus);
  const updateStatuses = useMutation(api.candidates.updateStatuses);
  const user = useQuery(api.users.current);
  const archiveCampaign = useMutation(api.campaigns.archive);

  const [isCampaignOnboardingOpen, setIsCampaignOnboardingOpen] = useState(false);

  useEffect(() => {
    if (user && user.isCampaignOnboarded !== true) {
      setIsCampaignOnboardingOpen(true);
    }
  }, [user]);

  const allSlots = useQuery(api.appointments.getAllCampaignSlots) || [];
  const createSlotMutation = useMutation(api.appointments.createSlot);
  const deleteSlotMutation = useMutation(api.appointments.deleteSlot);

  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const verifySession = useAction(api.stripe.verifySession);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:30");
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isNoSlotsWarningOpen, setIsNoSlotsWarningOpen] = useState(false);
  const [shareTab, setShareTab] = useState<"desc" | "msg">("desc");
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [deleteSlotLoading, setDeleteSlotLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isPremium = campaign?.adType === "pass" || user?.tier === "pro";

  const campaignSlots = useMemo(() => {
    if (!campaignId) return [];
    return allSlots.filter((slot) => slot.campaignId === campaignId);
  }, [allSlots, campaignId]);

  const sessionId = searchParams.get("session_id");
  const isVerifyingRef = useRef(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (sessionId && campaignId && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      const verify = async () => {
        try {
          const result = await verifySession({ sessionId });
          if (result.success) {
            setToast({
              message: "Félicitations, PASS Annonce correctement appliqué!",
              type: "success",
            });
            router.replace(`/dashboard/campaigns/${campaignId}`);
          } else {
            setToast({
              message: result.error || "Le paiement n'a pas pu être vérifié.",
              type: "error",
            });
          }
        } catch (err: any) {
          console.error(err);
          setToast({
            message: err.message || "Erreur de mise à niveau de l'annonce.",
            type: "error",
          });
        }
      };
      verify();
    }
  }, [sessionId, verifySession, campaignId, router]);

  const unlockedCandidateIds = useMemo(() => {
    if (!candidates) return new Set<string>();
    const sorted = [...candidates].sort((a, b) => a.createdAt - b.createdAt);
    return new Set(sorted.slice(0, 10).map((c) => c._id));
  }, [candidates]);

  const handleModalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;
    setModalLoading(true);

    try {
      const { url } = await createCheckoutSession({
        type: "upgrade_campaign",
        campaignId: campaignId,
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
        type: "error",
      });
      setModalLoading(false);
    }
  };

  const handleArchiveCampaign = async () => {
    if (!campaignId) return;
    setArchiveLoading(true);
    try {
      await archiveCampaign({ id: campaignId });
      setToast({
        message: "L'annonce a été archivée avec succès.",
        type: "success"
      });
      setIsArchiveConfirmOpen(false);
      router.push("/annonces");
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Une erreur est survenue lors de l'archivage de l'annonce.",
        type: "error"
      });
      setArchiveLoading(false);
    }
  };

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>([]);
  const [selectedGuarantors, setSelectedGuarantors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected" | "visits">("pending");
  const [activeDropdown, setActiveDropdown] = useState<"jobStatus" | "guarantor" | "filters" | null>(null);
  const activeFiltersCount = selectedJobStatuses.length + selectedGuarantors.length;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    if (!candidates) return { all: 0, pending: 0, accepted: 0, rejected: 0 };
    return candidates.reduce(
      (acc, c) => {
        acc.all++;
        if (c.status === "pending") acc.pending++;
        else if (c.status === "accepted") acc.accepted++;
        else if (c.status === "rejected") acc.rejected++;
        return acc;
      },
      { all: 0, pending: 0, accepted: 0, rejected: 0 }
    );
  }, [candidates]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const toggleJobStatus = useCallback((status: string) => {
    setSelectedJobStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  const toggleGuarantor = useCallback((val: string) => {
    setSelectedGuarantors((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }, []);

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter((c) => {
      if (selectedJobStatuses.length > 0 && !selectedJobStatuses.includes(c.jobStatus)) {
        return false;
      }
      if (selectedGuarantors.length > 0) {
        const hasGuarantorStr = c.hasGuarantor ? "yes" : "no";
        if (!selectedGuarantors.includes(hasGuarantorStr)) {
          return false;
        }
      }
      if (activeTab !== "all" && c.status !== activeTab) {
        return false;
      }
      return true;
    });
  }, [candidates, selectedJobStatuses, selectedGuarantors, activeTab]);

  const handleStatusChange = useCallback(async (candidateId: Id<"candidates">, newStatus: "accepted" | "rejected" | "pending") => {
    setActionLoadingId(candidateId);
    try {
      await updateStatus({ id: candidateId, status: newStatus });
      setToast({
        message: `Statut mis à jour avec succès : ${newStatus === "accepted" ? "Accepté" : newStatus === "rejected" ? "Refusé" : "En attente"
          }`,
        type: "success"
      });
    } catch (err) {
      console.error("Failed to update status", err);
      setToast({
        message: "Une erreur est survenue lors de la mise à jour du statut.",
        type: "error"
      });
    } finally {
      setActionLoadingId(null);
    }
  }, [updateStatus]);

  const handleBulkStatusChange = useCallback(async (newStatus: "accepted" | "rejected" | "pending") => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    const idsArray = Array.from(selectedIds) as Id<"candidates">[];
    try {
      await updateStatuses({ ids: idsArray, status: newStatus });
      setToast({
        message: `${selectedIds.size} candidat(s) mis à jour avec succès : ${newStatus === "accepted" ? "Accepté" : newStatus === "rejected" ? "Refusé" : "En attente"
          }`,
        type: "success"
      });
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to update statuses", err);
      setToast({
        message: "Une erreur est survenue lors de la mise à jour des statuts.",
        type: "error"
      });
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedIds, updateStatuses]);

  const handleCopyApplyUrl = useCallback(async () => {
    if (typeof window === "undefined" || !campaign?.slug) return;
    const url = `${window.location.origin}/apply/${campaign.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({
        message: "Lien de candidature copié !",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to copy URL", err);
      setToast({
        message: "Une erreur est survenue lors de la copie du lien.",
        type: "error",
      });
    }
  }, [campaign?.slug]);

  const handleConfirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    setDeleteSlotLoading(true);
    try {
      await deleteSlotMutation({ slotId: slotToDelete as any });
      setToast({ message: "Créneau retiré.", type: "success" });
      setSlotToDelete(null);
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: "error" });
    } finally {
      setDeleteSlotLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    try {
      const start = new Date(`${newSlotDate}T${newSlotStart}`);
      const end = new Date(`${newSlotDate}T${newSlotEnd}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setToast({ message: "Veuillez entrer des heures valides.", type: "error" });
        return;
      }

      if (end.getTime() <= start.getTime()) {
        setToast({ message: "L'heure de fin doit être après l'heure de début.", type: "error" });
        return;
      }

      await createSlotMutation({
        campaignId: campaignId,
        startTime: start.getTime(),
        endTime: end.getTime(),
        maxCapacity: newSlotCapacity,
      });

      setToast({ message: "Créneau ajouté avec succès !", type: "success" });
      setIsAddSlotOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la création.", type: "error" });
    }
  };

  const sortedCampaignSlots = useMemo(() => {
    return [...campaignSlots].sort((a, b) => a.startTime - b.startTime);
  }, [campaignSlots]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof campaignSlots> = {};
    sortedCampaignSlots.forEach((slot) => {
      const dateStr = new Date(slot.startTime).toISOString().split("T")[0];
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(slot);
    });
    return groups;
  }, [sortedCampaignSlots]);

  const toggleSort = (field: "monthlyIncome" | "createdAt" | "lastName") => {
    setSorting((prev) => {
      const existing = prev.find((s) => s.id === field);
      if (existing) {
        return [{ id: field, desc: !existing.desc }];
      }
      return [{ id: field, desc: field === "lastName" ? false : true }];
    });
  };

  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const makeLockedBottomSortingFn = useCallback(<T,>(
    getValue: (row: Row<Doc<"candidates">>) => T,
    compare: (a: T, b: T) => number
  ) => {
    return (rowA: Row<Doc<"candidates">>, rowB: Row<Doc<"candidates">>, columnId: string) => {
      const isALocked = !isPremium && !unlockedCandidateIds.has(rowA.original._id);
      const isBLocked = !isPremium && !unlockedCandidateIds.has(rowB.original._id);

      if (isALocked !== isBLocked) {
        const isDesc = sorting.find((s) => s.id === columnId)?.desc ?? false;
        if (isALocked) return isDesc ? -1 : 1;
        return isDesc ? 1 : -1;
      }

      return compare(getValue(rowA), getValue(rowB));
    };
  }, [isPremium, unlockedCandidateIds, sorting]);

  const columns = useMemo<ColumnDef<Doc<"candidates">>[]>(() => [
    {
      id: "select",
      header: () => {
        const selectableCandidates = filteredCandidates.filter(
          (c) => isPremium || unlockedCandidateIds.has(c._id)
        );
        const allSelected =
          selectableCandidates.length > 0 &&
          selectableCandidates.every((c) => selectedIds.has(c._id));
        const someSelected =
          selectableCandidates.some((c) => selectedIds.has(c._id)) && !allSelected;

        return (
          <div className="flex justify-center items-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (allSelected) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(selectableCandidates.map((c) => c._id)));
                }
              }}
              className={`h-4 w-4 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 ${allSelected || someSelected
                ? "bg-[#000091] border-[#000091] text-white"
                : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                }`}
            >
              {allSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {someSelected && (
                <div className="w-2 h-0.5 bg-white rounded-xs" />
              )}
            </div>
          </div>
        );
      },
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return (
            <div className="flex justify-center items-center" title="Dossier verrouillé (Offre Gratuite)">
              <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          );
        }
        const isChecked = selectedIds.has(row.original._id);
        return (
          <div className="flex justify-center items-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(row.original._id)) {
                    next.delete(row.original._id);
                  } else {
                    next.add(row.original._id);
                  }
                  return next;
                });
              }}
              className={`h-4 w-4 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 ${isChecked
                ? "bg-[#000091] border-[#000091] text-white"
                : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                }`}
            >
              {isChecked && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "candidateInfo",
      accessorKey: "lastName",
      header: "Candidat",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return (
            <div>
              <div className="font-semibold text-[#64748B] italic">
                Candidat masqué
              </div>
              <div className="text-xs text-[#94A3B8]">
                Détails masqués (Offre Gratuite)
              </div>
            </div>
          );
        }
        return (
          <div>
            <div className="font-semibold text-[#0F172A] flex items-baseline gap-2">
              <span>{row.original.firstName} {row.original.lastName}</span>
              {row.original.age !== undefined && (
                <span className="text-xs font-normal text-[#64748B]">
                  {row.original.age} ans
                </span>
              )}
            </div>
            <div className="text-xs text-[#64748B]">
              {row.original.email} • {row.original.phone}
            </div>
          </div>
        );
      },
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.lastName,
        (a, b) => a.localeCompare(b)
      ),
    },
    {
      accessorKey: "jobStatus",
      header: "Statut",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return (
            <span className="bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] px-2.5 py-0.5 text-xs font-semibold rounded-md select-none">
              Masqué
            </span>
          );
        }
        const jobStatus = row.original.jobStatus;
        const style = JOB_STATUS_STYLES[jobStatus] || JOB_STATUS_STYLES.Other;
        return (
          <span className={`${style.bg} ${style.text} ${style.border} px-2.5 py-0.5 border text-xs font-semibold rounded-md`}>
            {style.label}
          </span>
        );
      },
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.jobStatus,
        (a, b) => a.localeCompare(b)
      ),
    },
    {
      accessorKey: "monthlyIncome",
      header: "Revenus Mensuels",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return <span className="text-[#94A3B8] font-mono select-none">•••• €</span>;
        }
        const income = row.original.monthlyIncome;
        return (
          <div className="font-semibold text-[#0F172A]">
            <div>{income.toLocaleString("fr-FR")} €</div>
            {campaign?.rentAmount !== undefined && (
              <span className={`inline-block text-[10px] mt-1 font-bold px-2 py-0.5 rounded border ${(income / campaign.rentAmount) >= 3
                ? "bg-[#E6F3EA] text-[#18753C] border-[#B9DFC5]"
                : "bg-[#FCE8E6] text-[#CE0500] border-[#F8C0BC]"
                }`}>
                {(income / campaign.rentAmount).toFixed(1)}x le loyer
              </span>
            )}
          </div>
        );
      },
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.monthlyIncome,
        (a, b) => a - b
      ),
    },
    {
      accessorKey: "hasGuarantor",
      header: "Garant",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return <span className="text-[#94A3B8] font-mono select-none">••</span>;
        }
        return (
          <span className={row.original.hasGuarantor
            ? "bg-[#E6F3EA] text-[#18753C] border border-[#B9DFC5] px-2 py-0.5 text-xs font-semibold rounded-md inline-block"
            : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 text-xs font-semibold rounded-md inline-block"
          }>
            {row.original.hasGuarantor ? "Oui" : "Non"}
          </span>
        );
      },
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.hasGuarantor,
        (a, b) => Number(a) - Number(b)
      ),
    },
    {
      accessorKey: "dossierFacileUrl",
      header: "Dossier",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return <span className="text-[#94A3B8] text-xs select-none">Masqué</span>;
        }
        return (
          <a
            href={row.original.dossierFacileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#000091] hover:text-[#0b0b7d] text-xs font-bold inline-flex items-center gap-1 transition-colors"
          >
            <span>Ouvrir</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "nameTrigram",
      header: "Trigramme",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return <span className="text-[#94A3B8] font-mono select-none">•••</span>;
        }
        return (
          <TrigramCell
            trigram={row.original.nameTrigram}
            onCopy={(message, type) => setToast({ message, type })}
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "État",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return (
            <div className="flex justify-center">
              <span className="bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] px-2.5 py-0.5 text-xs font-semibold rounded-md select-none">
                Masqué
              </span>
            </div>
          );
        }
        const status = row.original.status;
        return (
          <div className="flex justify-center">
            {status === "accepted" && (
              <span className="bg-[#E6F3EA] text-[#18753C] border border-[#B9DFC5] px-2.5 py-0.5 text-xs font-semibold rounded-md">
                Accepté
              </span>
            )}
            {status === "rejected" && (
              <span className="bg-[#FCE8E6] text-[#CE0500] border border-[#F8C0BC] px-2.5 py-0.5 text-xs font-semibold rounded-md">
                Refusé
              </span>
            )}
            {status === "pending" && (
              <span className="bg-[#FFF4EC] text-[#B35C00] border border-[#FFE0C2] px-2.5 py-0.5 text-xs font-semibold rounded-md">
                En attente
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.createdAt,
        (a, b) => a - b
      ),
    },
  ], [campaign, actionLoadingId, handleStatusChange, isPremium, unlockedCandidateIds, makeLockedBottomSortingFn, selectedIds, filteredCandidates]);

  const table = useReactTable({
    data: filteredCandidates,
    columns,
    state: {
      sorting,
      columnVisibility: {
        createdAt: false,
        select: activeTab === "pending",
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (authLoading || campaign === undefined || candidates === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de la campagne et des candidats...</span>
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F6F6F6] px-6">
        <div className="gov-card max-w-md text-center">
          <div className="gov-card-header text-red-600 border-red-600">Annonce introuvable</div>
          <div className="gov-card-body">
            <p className="mb-4">Ce logement n'existe pas ou vous n'êtes pas autorisé à le voir.</p>
            <Link href="/dashboard" className="btn-primary">Retour au tableau de bord</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Retour button */}
        <button
          onClick={() => router.push("/annonces")}
          className="inline-flex items-center gap-2 text-sm text-[#000091] hover:text-[#0b0b7d] font-medium mb-5 group transition-colors focus:outline-none cursor-pointer"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>

        {/* Campaign Info */}
        <div className="bg-white border border-[#E2E8F0] p-6 mb-8 rounded-xl shadow-xs transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-[#161616] flex flex-wrap items-center gap-3">
                <span>{campaign.title}</span>
                {campaign.rentAmount !== undefined && (
                  <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-3 py-1 rounded-full border border-[#000091]/10">
                    Loyer : {campaign.rentAmount} € / mois
                  </span>
                )}
              </h1>
              {campaign.address && (
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#000091]" />
                  <span>{campaign.address}</span>
                </div>
              )}
              {campaign.description && (
                <p className="text-sm text-[#475569] max-w-3xl leading-relaxed whitespace-pre-wrap">
                  {campaign.description.length > 100 && !isDescriptionExpanded ? (
                    <>
                      {campaign.description.slice(0, 100)}...{" "}
                      <button
                        onClick={() => setIsDescriptionExpanded(true)}
                        className="text-xs font-bold text-[#000091] hover:underline focus:outline-none cursor-pointer inline-flex items-center"
                      >
                        voir plus
                      </button>
                    </>
                  ) : (
                    <>
                      {campaign.description}{" "}
                      {campaign.description.length > 100 && (
                        <button
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="text-xs font-bold text-[#000091] hover:underline focus:outline-none cursor-pointer inline-flex items-center ml-1"
                        >
                          voir moins
                        </button>
                      )}
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="shrink-0 self-start flex flex-wrap gap-2">
              <button
                onClick={() => campaignSlots.length === 0 ? setIsNoSlotsWarningOpen(true) : setIsShareOpen(true)}
                title="Partager l'annonce"
                className="text-xs font-bold text-[#000091] hover:text-[#0b0b7d] bg-[#E3E3FD]/60 hover:bg-[#E3E3FD] py-2 px-4 border border-[#E3E3FD] rounded-full cursor-pointer transition-all duration-150 flex items-center gap-1.5 focus:outline-none"
              >
                <Share2 className="w-3.5 h-3.5 text-[#000091]" />
                <span>Partager l'annonce</span>
              </button>
              <button
                onClick={() => setIsArchiveConfirmOpen(true)}
                title="Marquer comme loué"
                className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#18753C] text-white hover:bg-[#135c2f] rounded-lg font-bold flex items-center gap-1.5 border border-[#B9DFC5]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>J'ai trouvé mon locataire</span>
              </button>
            </div>
          </div>
        </div>



        {/* Upgrade Banner for Free Campaign */}
        {!isPremium && candidates && candidates.length > 10 && (
          <div className="bg-[#FFF9E6] border border-[#FFD700]/40 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-[#8A6D00] uppercase tracking-wider block mb-0.5 font-sans">
                Ne passez pas à côté du locataire idéal
              </span>
              <p className="text-sm text-[#3A3A3A] font-semibold">
                Vous avez reçu {candidates.length} candidatures, mais seules les 10 premières sont visibles.
              </p>
              <p className="text-xs text-[#666666] mt-0.5">
                Ne risquez pas de passer à côté du <b>candidat idéal</b> parmi les {candidates.length - 10} dossiers encore masqués.
              </p>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="btn-primary text-xs shrink-0 cursor-pointer shadow-md bg-[#000091] text-white py-2 px-4 rounded hover:bg-[#0b0b7d] transition-colors"
            >
              Débloquer toutes les candidatures (19 €)
            </button>
          </div>
        )}

        {/* High-level navigation section tabs */}
        <div className="flex border-b border-[#E2E8F0] mb-6 gap-6 select-none">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 px-1 text-base font-bold transition-all relative cursor-pointer flex items-center ${activeTab !== "visits"
              ? "text-[#000091]"
              : "text-[#64748B] hover:text-[#0F172A]"
              }`}
          >
            <span>Candidatures</span>
            <span className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab !== "visits" ? "bg-[#000091] text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}>
              {counts.all}
            </span>
            {activeTab !== "visits" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000091] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("visits")}
            className={`pb-3 px-1 text-base font-bold transition-all relative cursor-pointer flex items-center ${activeTab === "visits"
              ? "text-[#000091]"
              : "text-[#64748B] hover:text-[#0F172A]"
              }`}
          >
            <CalendarRange className="w-4 h-4 mr-2" />
            <span>Visites & Créneaux</span>
            <span className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === "visits" ? "bg-[#000091] text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}>
              {campaignSlots.length}
            </span>
            {activeTab === "visits" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000091] rounded-full" />
            )}
          </button>
        </div>

        {/* Section actions & filters bar */}
        {activeTab === "visits" ? (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#161616]">Créneaux de visites planifiés</h2>
              <p className="text-xs text-[#64748B]">Gérez vos créneaux et visualisez les candidats positionnés.</p>
            </div>
            <button
              onClick={() => setIsAddSlotOpen(true)}
              className="bg-[#000091] text-white hover:bg-[#0b0b7d] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un créneau</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Sub-filter segment bar */}
            <div className="flex border border-[#E2E8F0] gap-1.5 overflow-x-auto select-none bg-[#F8FAFC] p-1.5 rounded-xl max-w-max">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center shrink-0 border border-transparent ${activeTab === "pending"
                  ? "bg-white text-[#B35C00] shadow-xs border-[#FFE0C2]/60"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/50"
                  }`}
              >
                <span>En attente de réponse</span>
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "pending" ? "bg-[#B35C00] text-white" : "bg-[#FFF4EC] text-[#B35C00]"
                  }`}>
                  {counts.pending}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("accepted")}
                className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center shrink-0 border border-transparent ${activeTab === "accepted"
                  ? "bg-white text-[#18753C] shadow-xs border-[#B9DFC5]/60"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/50"
                  }`}
              >
                <span>Acceptés</span>
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "accepted" ? "bg-[#18753C] text-white" : "bg-[#E6F3EA] text-[#18753C]"
                  }`}>
                  {counts.accepted}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("rejected")}
                className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center shrink-0 border border-transparent ${activeTab === "rejected"
                  ? "bg-white text-[#CE0500] shadow-xs border-[#F8C0BC]/60"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/50"
                  }`}
              >
                <span>Refusés</span>
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "rejected" ? "bg-[#CE0500] text-white" : "bg-[#FCE8E6] text-[#CE0500]"
                  }`}>
                  {counts.rejected}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center shrink-0 border border-transparent ${activeTab === "all"
                  ? "bg-white text-[#000091] shadow-xs border-[#CBD5E1]/60"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/50"
                  }`}
              >
                <span>Toutes</span>
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-[#000091] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}>
                  {counts.all}
                </span>
              </button>
            </div>

            {/* Sorting & Filter buttons */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end items-center">
              <button
                onClick={() => toggleSort("lastName")}
                className={`hidden md:inline-block text-xs font-bold px-3 py-1.5 border cursor-pointer rounded-lg transition-all duration-150 ${sortField === "lastName"
                  ? "bg-[#000091] text-white border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                Trier par Nom {sortField === "lastName" && (sortOrder === "desc" ? " ↓" : " ↑")}
              </button>
              <button
                onClick={() => toggleSort("monthlyIncome")}
                className={`hidden md:inline-block text-xs font-bold px-3 py-1.5 border cursor-pointer rounded-lg transition-all duration-150 ${sortField === "monthlyIncome"
                  ? "bg-[#000091] text-white border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                Trier par Revenu {sortField === "monthlyIncome" && (sortOrder === "desc" ? " ↓" : " ↑")}
              </button>
              <button
                onClick={() => toggleSort("createdAt")}
                className={`hidden md:inline-block text-xs font-bold px-3 py-1.5 border cursor-pointer rounded-lg transition-all duration-150 ${sortField === "createdAt"
                  ? "bg-[#000091] text-white border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                Trier par Date {sortField === "createdAt" && (sortOrder === "desc" ? " ↓" : " ↑")}
              </button>

              {/* Unique Filter Button */}
              <div className={`relative ${activeDropdown === "filters" ? "z-30" : ""}`}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "filters" ? null : "filters")}
                  className={`h-8 flex items-center justify-center gap-1.5 border rounded-lg focus:outline-none cursor-pointer transition-all duration-150 ${activeFiltersCount > 0
                    ? "bg-[#E3E3FD] text-[#000091] border-[#000091] shadow-xs px-2.5"
                    : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] w-8"
                    }`}
                  title="Filtrer les candidats"
                >
                  <Filter className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#000091] text-white px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                {activeDropdown === "filters" && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#E2E8F0] shadow-md z-30 py-3 rounded-lg divide-y divide-[#E2E8F0] max-h-[80vh] overflow-y-auto">
                    {/* Statut Professionnel Category */}
                    <div className="pb-3 px-4 text-left">
                      <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Statut professionnel</span>
                      <div className="space-y-1.5">
                        {JOB_STATUS_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center text-xs text-[#334155] hover:bg-[#F8FAFC] cursor-pointer select-none py-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedJobStatuses.includes(opt.value)}
                              onChange={() => toggleJobStatus(opt.value)}
                              className="mr-2.5 h-3.5 w-3.5 border-[#E2E8F0] text-[#000091] focus:ring-[#000091] rounded-sm cursor-pointer"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Garant Category */}
                    <div className="pt-3 px-4 text-left">
                      <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Garant</span>
                      <div className="space-y-1.5">
                        {GUARANTOR_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center text-xs text-[#334155] hover:bg-[#F8FAFC] cursor-pointer select-none py-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGuarantors.includes(opt.value)}
                              onChange={() => toggleGuarantor(opt.value)}
                              className="mr-2.5 h-3.5 w-3.5 border-[#E2E8F0] text-[#000091] focus:ring-[#000091] rounded-sm cursor-pointer"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Candidates Table or Visits Slots */}
        {activeTab === "visits" ? (
          <div className="space-y-6">
            {campaignSlots.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-xs">
                <CalendarRange className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
                <h3 className="text-base font-bold text-[#0F172A] mb-1">Aucun créneau configuré</h3>
                <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-5">
                  Proposez des créneaux horaires pour que les candidats puissent réserver une visite de votre logement.
                </p>
                <button
                  onClick={() => setIsAddSlotOpen(true)}
                  className="bg-[#000091] text-white hover:bg-[#0b0b7d] text-xs font-bold py-2.5 px-4 rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter mon premier créneau</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSlots).sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, slots]) => {
                  const dateObj = new Date(dateStr);
                  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  });
                  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

                  return (
                    <div key={dateStr} className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
                      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#000091]" />
                        <h3 className="font-bold text-sm text-[#0F172A]">{capitalizedDate}</h3>
                      </div>
                      <div className="divide-y divide-[#E2E8F0]">
                        {slots.map((slot) => {
                          const startTimeStr = new Date(slot.startTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                          const endTimeStr = new Date(slot.endTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                          const bookedCount = slot.candidates?.length || 0;

                          return (
                            <div key={slot._id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-[#F8FAFC]/50 transition-colors">
                              <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                                    <Clock className="w-3.5 h-3.5 text-[#000091]" />
                                    <span>{startTimeStr} - {endTimeStr}</span>
                                  </div>
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${bookedCount >= slot.maxCapacity
                                    ? "bg-[#FCE8E6] text-[#CE0500] border-[#F8C0BC]"
                                    : bookedCount > 0
                                      ? "bg-[#FFF4EC] text-[#B35C00] border-[#FFE0C2]"
                                      : "bg-[#E6F3EA] text-[#18753C] border-[#B9DFC5]"
                                    }`}>
                                    {bookedCount} / {slot.maxCapacity} réservé{slot.maxCapacity > 1 ? "s" : ""}
                                  </span>
                                </div>

                                {bookedCount > 0 ? (
                                  <div className="space-y-2 pl-2 border-l-2 border-[#E2E8F0]">
                                    <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">Candidats inscrits</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {slot.candidates?.map((candidate) => (
                                        <div key={candidate._id} className="bg-white border border-[#E2E8F0] p-3 rounded-lg flex items-center justify-between gap-3 shadow-2xs">
                                          <div className="min-w-0">
                                            <div className="text-xs font-bold text-[#0F172A] truncate">
                                              {candidate.firstName} {candidate.lastName}
                                            </div>
                                            <div className="text-[10px] text-[#64748B] truncate">
                                              {candidate.email} • {candidate.phone}
                                            </div>
                                          </div>
                                          {candidate.dossierFacileUrl && (
                                            <a
                                              href={candidate.dossierFacileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[#000091] hover:text-[#0b0b7d] flex-shrink-0"
                                              title="Ouvrir le dossier"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-[#64748B] italic">Aucune réservation pour ce créneau.</p>
                                )}
                              </div>

                              <button
                                onClick={() => setSlotToDelete(slot._id)}
                                className="text-[#CE0500] hover:text-[#a60400] hover:bg-[#FFE9E9] p-2 rounded-lg transition-colors duration-150 self-start border border-transparent hover:border-[#FCE8E6] cursor-pointer"
                                title="Supprimer ce créneau"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {table.getRowModel().rows.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-[#64748B]">Aucun candidat trouvé pour cette sélection.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-[#F8FAFC] border-b border-[#E2E8F0] border-l-4 border-transparent">
                        {headerGroup.headers.map((header) => {
                          let alignmentClass = "text-left";
                          if (header.column.id === "monthlyIncome") {
                            alignmentClass = "text-right";
                          } else if (
                            header.column.id === "select" ||
                            header.column.id === "hasGuarantor" ||
                            header.column.id === "dossierFacileUrl" ||
                            header.column.id === "status"
                          ) {
                            alignmentClass = "text-center";
                          }

                          const canSort = header.column.getCanSort();
                          const isSorted = header.column.getIsSorted();

                          return (
                            <th
                              key={header.id}
                              onClick={
                                canSort
                                  ? () => {
                                    if (!isSorted) {
                                      header.column.toggleSorting(false, false);
                                    } else {
                                      header.column.toggleSorting(isSorted === "asc", false);
                                    }
                                  }
                                  : undefined
                              }
                              className={`p-4 text-xs font-bold text-[#475569] uppercase tracking-wider ${alignmentClass} ${canSort ? "cursor-pointer select-none hover:bg-[#F1F5F9] transition-colors" : ""
                                }`}
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={`inline-flex items-center gap-1 ${alignmentClass === "text-right"
                                    ? "justify-end w-full"
                                    : alignmentClass === "text-center"
                                      ? "justify-center w-full"
                                      : ""
                                    }`}
                                >
                                  <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                  {canSort && (
                                    <span className="text-[#64748B] font-mono text-xs select-none">
                                      {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {table.getRowModel().rows.map((row) => {
                      const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
                      const isSelected = selectedIds.has(row.original._id);
                      return (
                        <tr
                          key={row.id}
                          onClick={() => {
                            if (isLocked || activeTab !== "pending") return;
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(row.original._id)) {
                                next.delete(row.original._id);
                              } else {
                                next.add(row.original._id);
                              }
                              return next;
                            });
                          }}
                          className={`text-sm text-[#334155] transition-colors duration-150 border-l-4 border-transparent hover:bg-[#F8FAFC] ${isLocked ? "cursor-default opacity-85" : activeTab === "pending" ? "cursor-pointer" : "cursor-default"
                            } ${isSelected ? "bg-[#F8FAFC] border-l-[#000091]" : ""}`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            let alignmentClass = "text-left";
                            if (cell.column.id === "monthlyIncome") {
                              alignmentClass = "text-right";
                            } else if (
                              cell.column.id === "select" ||
                              cell.column.id === "hasGuarantor" ||
                              cell.column.id === "dossierFacileUrl" ||
                              cell.column.id === "status"
                            ) {
                              alignmentClass = "text-center";
                            }

                            return (
                              <td key={cell.id} className={`p-4 ${alignmentClass}`}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/90 backdrop-blur-md border border-[#E2E8F0] px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="text-xs font-semibold text-[#0F172A]">
            {selectedIds.size} candidat(s) sélectionné(s)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange("accepted")}
              disabled={bulkActionLoading}
              className="bg-[#18753C] text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-[#135c2f] disabled:opacity-50 cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-sm"
            >
              {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Accepter</span>
            </button>
            <button
              onClick={() => handleBulkStatusChange("rejected")}
              disabled={bulkActionLoading}
              className="bg-[#CE0500] text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-[#a60400] disabled:opacity-50 cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-sm"
            >
              {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Refuser</span>
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkActionLoading}
            title="Annuler la sélection"
            className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeDropdown && (
        <div className="fixed inset-0 z-20 cursor-default" onClick={() => setActiveDropdown(null)} />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Upgrade Modal */}
      {upgradeOpen && (
        <div className="fixed inset-0 bg-[#161616]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <span className="bg-[#E3E3FD] text-[#000091] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  Optionnel
                </span>
                <h3 className="font-bold text-[#161616] text-sm">Activer le Pass Annonce</h3>
              </div>
              <button
                onClick={() => {
                  if (!modalLoading) {
                    setUpgradeOpen(false);
                  }
                }}
                disabled={modalLoading}
                className="text-[#666666] hover:text-[#161616] text-lg font-semibold w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#EEEEEE] transition-colors disabled:opacity-50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleModalPaymentSubmit} className="space-y-4">
                <div className="text-xs text-[#666666] space-y-1.5 pb-3 border-b border-[#EEEEEE]">
                  <p className="font-semibold text-[#161616]">
                    En débloquant cette annonce pour 19 €, vous profitez de :
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Candidatures illimitées (plus aucune limite de visibilité)</li>
                    <li>Rappels automatiques envoyés aux candidats</li>
                    <li>Planification automatique des visites en ligne</li>
                  </ul>
                </div>

                <div className="bg-[#F5F5FE] border border-[#CBCBFC] p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-white p-2 rounded-lg border border-[#CBCBFC] shadow-sm flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-[#000091]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#161616]">
                      Paiement unique de 19 €
                    </h4>
                    <p className="text-[10px] text-[#666666] mt-0.5 leading-relaxed">
                      Vous allez être redirigé vers le portail de paiement sécurisé de Stripe.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="btn-primary w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#000091] text-white hover:bg-[#0b0b7d] rounded font-bold text-xs"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Redirection...</span>
                      </>
                    ) : (
                      <span>Payer</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Archive Campaign Confirmation Dialog */}
      <Dialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        title="J'ai trouvé mon locataire ?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569] leading-relaxed">
            Félicitations ! Souhaitez-vous marquer l'annonce <strong>{campaign?.title}</strong> comme louée ?
          </p>
          <div className="bg-[#E6F3EA] border border-[#B9DFC5] p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#18753C] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#18753C] uppercase tracking-wider">
                Archivage de l'annonce
              </h4>
              <p className="text-xs text-[#1e5a35] mt-1 leading-relaxed">
                Cette annonce ne sera plus visible publiquement et les candidatures seront fermées.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsArchiveConfirmOpen(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              disabled={archiveLoading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleArchiveCampaign}
              disabled={archiveLoading}
              className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#18753C] text-white hover:bg-[#135c2f] rounded font-bold flex items-center gap-1.5 border border-[#B9DFC5]"
            >
              {archiveLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Confirmer</span>
            </button>
          </div>
        </div>
      </Dialog>

      {/* Slot creation Dialog */}
      <Dialog
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Ajouter un créneau de visite"
        size="md"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Date de visite</label>
            <input
              type="date"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              required
            />
          </div>

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

          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Capacité maximale (nombre de visiteurs)</label>
            <input
              type="number"
              min="1"
              value={newSlotCapacity}
              onChange={(e) => setNewSlotCapacity(parseInt(e.target.value) || 1)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddSlotOpen(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#000091] text-white hover:bg-[#0b0b7d] rounded font-bold"
            >
              Créer le créneau
            </button>
          </div>
        </form>
      </Dialog>

      {/* Share Campaign Dialog */}
      <Dialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Partager l'annonce"
        size="md"
      >
        <div className="space-y-5">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#E2E8F0] gap-4 select-none">
            <button
              onClick={() => setShareTab("desc")}
              className={`pb-2.5 px-1 text-xs font-bold transition-all relative cursor-pointer ${shareTab === "desc"
                ? "text-[#000091]"
                : "text-[#64748B] hover:text-[#0F172A]"
                }`}
            >
              Dans la description
              {shareTab === "desc" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000091] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShareTab("msg")}
              className={`pb-2.5 px-1 text-xs font-bold transition-all relative cursor-pointer ${shareTab === "msg"
                ? "text-[#000091]"
                : "text-[#64748B] hover:text-[#0F172A]"
                }`}
            >
              En réponse par message
              {shareTab === "msg" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000091] rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {shareTab === "desc" ? (
            <div className="space-y-4">
              {campaign?.code && (
                <>
                  <div className="text-center bg-[#F5F5FE] border border-[#E3E3FD] p-5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-[#000091] uppercase tracking-wider block">
                      Code de l'annonce
                    </span>
                    <div className="text-3xl font-mono font-bold tracking-widest text-[#000091] bg-white border border-[#E3E3FD] py-2.5 px-6 rounded-lg inline-block select-all">
                      {campaign.code}
                    </div>
                    <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                      Indiquez ce code de 6 chiffres dans la description de votre annonce pour que les candidats postulent directement depuis notre site.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-bold text-[#161616]">
                        Instructions courtes à copier
                      </h5>
                      <p className="text-[11px] text-[#666666] mt-1 leading-relaxed">
                        Les liens dans les descriptions d'annonces sont bloqués sur Leboncoin et SeLoger. Copiez plutôt ce texte explicatif :
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-3">
                      <div className="text-xs text-[#334155] bg-white border border-[#E2E8F0] p-3 rounded-md font-mono select-all">
                        Pour postuler, rendez-vous sur bailconnect.fr et saisissez le code : {campaign.code}
                      </div>
                      <button
                        onClick={async () => {
                          const instructions = `Pour postuler, rendez-vous sur bailconnect.fr et saisissez le code : ${campaign.code}`;
                          try {
                            await navigator.clipboard.writeText(instructions);
                            setToast({ message: "Instructions copiées !", type: "success" });
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-xs font-bold text-white bg-[#000091] hover:bg-[#0b0b7d] py-2.5 px-4 rounded-lg w-full transition-all duration-150 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <rect x="9" y="9" width="13" height="13" rx="1.5" ry="1.5" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copier les instructions</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Lien direct de candidature
                </label>
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
                  <span className="text-xs font-semibold text-[#161616] break-all select-all flex-1 font-mono">
                    {typeof window !== "undefined" && `${window.location.origin}/apply/${campaign?.slug}`}
                  </span>
                  <button
                    onClick={handleCopyApplyUrl}
                    className="text-xs font-bold text-[#000091] hover:text-[#0b0b7d] hover:bg-[#E3E3FD]/50 px-3 py-1.5 rounded-md border border-[#E3E3FD] bg-white transition-all duration-150 shrink-0 cursor-pointer"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
                <div>
                  <h5 className="text-xs font-bold text-[#161616]">
                    Message de réponse automatique
                  </h5>
                  <p className="text-[11px] text-[#666666] mt-1.5 leading-relaxed">
                    Dans la messagerie Leboncoin, SeLoger ou par SMS, les liens sont cliquables. Envoyez ce message contenant votre lien direct pour simplifier la candidature.
                  </p>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-3">
                  <div className="text-xs text-[#334155] bg-white border border-[#E2E8F0] p-3 rounded-md leading-relaxed select-all">
                    Bonjour, merci pour votre intérêt. Afin que je puisse étudier votre dossier, merci de postuler directement via ce lien : {typeof window !== "undefined" && `${window.location.origin}/apply/${campaign?.slug}`}
                  </div>
                  <button
                    onClick={async () => {
                      const message = `Bonjour, merci pour votre intérêt. Afin que je puisse étudier votre dossier, merci de postuler directement via ce lien : ${window.location.origin}/apply/${campaign?.slug}`;
                      try {
                        await navigator.clipboard.writeText(message);
                        setToast({ message: "Message de réponse copié !", type: "success" });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="text-xs font-bold text-white bg-[#000091] hover:bg-[#0b0b7d] py-2.5 px-4 rounded-lg w-full transition-all duration-150 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <rect x="9" y="9" width="13" height="13" rx="1.5" ry="1.5" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copier le message de réponse</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Warning Share Without Slots Dialog */}
      <Dialog
        isOpen={isNoSlotsWarningOpen}
        onClose={() => setIsNoSlotsWarningOpen(false)}
        title="Créer des créneaux de visite"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569] leading-relaxed">
            Vous devez ajouter au moins un créneau de visite avant de pouvoir partager votre annonce. Cela permettra aux candidats de choisir une disponibilité dès que vous aurez accepté leur dossier.
          </p>
          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNoSlotsWarningOpen(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNoSlotsWarningOpen(false);
                setActiveTab("visits");
                setIsAddSlotOpen(true);
              }}
              className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#000091] text-white hover:bg-[#0b0b7d] rounded font-bold"
            >
              Créer un créneau
            </button>
          </div>
        </div>
      </Dialog>

      {/* Delete Slot Confirmation Dialog */}
      <DeleteSlotDialog
        isOpen={slotToDelete !== null}
        onClose={() => setSlotToDelete(null)}
        onConfirm={handleConfirmDeleteSlot}
        isLoading={deleteSlotLoading}
      />

      <CampaignOnboarding
        isOpen={isCampaignOnboardingOpen}
        onClose={() => setIsCampaignOnboardingOpen(false)}
      />
    </div>
  );
}
