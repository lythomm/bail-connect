"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
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

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
];

export default function CampaignDetail() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as Id<"campaigns"> | undefined;

  const campaign = useQuery(api.campaigns.get, isAuthenticated && campaignId ? { id: campaignId } : "skip");
  const candidates = useQuery(api.candidates.getByCampaign, isAuthenticated && campaignId ? { campaignId } : "skip");
  const updateStatus = useMutation(api.candidates.updateStatus);
  const user = useQuery(api.users.current);
  const upgradeCampaign = useMutation(api.campaigns.upgradeToPass);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [modalCardNumber, setModalCardNumber] = useState("4242 4242 4242 4242");
  const [modalCardExpiry, setModalCardExpiry] = useState("12/28");
  const [modalCardCvv, setModalCardCvv] = useState("123");
  const [modalCardName, setModalCardName] = useState("JEAN DUPONT");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  const isPremium = campaign?.adType === "pass" || user?.tier === "pro";

  const unlockedCandidateIds = useMemo(() => {
    if (!candidates) return new Set<string>();
    const sorted = [...candidates].sort((a, b) => a.createdAt - b.createdAt);
    return new Set(sorted.slice(0, 10).map((c) => c._id));
  }, [candidates]);

  const handleModalCardNumberChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 16);
    const matches = clean.match(/\d{1,4}/g);
    if (matches) {
      setModalCardNumber(matches.join(" "));
    } else {
      setModalCardNumber("");
    }
  };

  const handleModalCardExpiryChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    if (clean.length > 2) {
      setModalCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setModalCardExpiry(clean);
    }
  };

  const handleModalCardCvvChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 3);
    setModalCardCvv(clean);
  };

  const handleModalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    setTimeout(async () => {
      setModalSuccess(true);
      if (campaignId) {
        try {
          await upgradeCampaign({ id: campaignId });
          setToast({
            message: "Votre annonce a été mise à niveau en Premium !",
            type: "success",
          });
        } catch (err: any) {
          console.error(err);
          setToast({
            message: err.message || "Erreur de mise à niveau de l'annonce.",
            type: "error",
          });
        }
      }
      setTimeout(() => {
        setUpgradeOpen(false);
        setModalLoading(false);
        setModalSuccess(false);
      }, 1500);
    }, 1500);
  };

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>([]);
  const [selectedGuarantors, setSelectedGuarantors] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<"jobStatus" | "guarantor" | "status" | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

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

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedJobStatuses([]);
    setSelectedGuarantors([]);
    setSelectedStatuses([]);
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
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(c.status)) {
        return false;
      }
      return true;
    });
  }, [candidates, selectedJobStatuses, selectedGuarantors, selectedStatuses]);

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

  const toggleSort = (field: "monthlyIncome" | "createdAt") => {
    setSorting((prev) => {
      const existing = prev.find((s) => s.id === field);
      if (existing) {
        return [{ id: field, desc: !existing.desc }];
      }
      return [{ id: field, desc: true }];
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
      id: "candidateInfo",
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
      enableSorting: false,
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
      sortingFn: makeLockedBottomSortingFn(
        (row) => row.original.status,
        (a, b) => a.localeCompare(b)
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isLocked = !isPremium && !unlockedCandidateIds.has(row.original._id);
        if (isLocked) {
          return (
            <div className="flex justify-end">
              <button
                onClick={() => setUpgradeOpen(true)}
                className="bg-[#000091] text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#0b0b7d] cursor-pointer transition-all duration-150 shadow-xs flex items-center gap-1"
              >
                <span>Débloquer</span>
              </button>
            </div>
          );
        }
        const candidate = row.original;
        return (
          <div className="flex gap-2 justify-end">
            {candidate.status !== "accepted" && (
              <button
                onClick={() => handleStatusChange(candidate._id, "accepted")}
                disabled={actionLoadingId === candidate._id}
                className="bg-[#18753C] text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#135c2f] disabled:opacity-50 cursor-pointer transition-all duration-150 shadow-xs"
              >
                Accepter
              </button>
            )}
            {candidate.status !== "rejected" && (
              <button
                onClick={() => handleStatusChange(candidate._id, "rejected")}
                disabled={actionLoadingId === candidate._id}
                className="bg-[#CE0500] text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#a60400] disabled:opacity-50 cursor-pointer transition-all duration-150 shadow-xs"
              >
                Refuser
              </button>
            )}
            {candidate.status !== "pending" && (
              <button
                onClick={() => handleStatusChange(candidate._id, "pending")}
                disabled={actionLoadingId === candidate._id}
                className="bg-white border border-[#E2E8F0] text-[#334155] text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#F8FAFC] hover:border-[#CBD5E1] disabled:opacity-50 cursor-pointer transition-all duration-150"
              >
                Réinitialiser
              </button>
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
  ], [campaign, actionLoadingId, handleStatusChange, isPremium, unlockedCandidateIds, makeLockedBottomSortingFn]);

  const table = useReactTable({
    data: filteredCandidates,
    columns,
    state: {
      sorting,
      columnVisibility: {
        createdAt: false,
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
          onClick={() => router.back()}
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
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-[#161616] flex flex-wrap items-center gap-3">
                <span>{campaign.title}</span>
                {campaign.rentAmount !== undefined && (
                  <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-3 py-1 rounded-full border border-[#000091]/10">
                    Loyer : {campaign.rentAmount} € / mois
                  </span>
                )}
              </h1>
              {campaign.description && (
                <p className="text-sm text-[#475569] max-w-3xl leading-relaxed">{campaign.description}</p>
              )}
            </div>
            <div className="shrink-0 self-start">
              <span className="text-xs font-bold text-[#475569] bg-[#F8FAFC] py-1.5 px-3 border border-[#E2E8F0] rounded-full inline-block">
                {candidates.length} candidat(s) au total
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] pt-4 border-t border-[#F1F5F9]">
            <span>Lien de candidature : </span>
            <button
              onClick={handleCopyApplyUrl}
              title="Copier le lien de candidature"
              className="text-[#000091] hover:text-[#0b0b7d] font-medium cursor-pointer focus:outline-none inline-flex items-center gap-1.5 group transition-colors"
            >
              <span>{typeof window !== "undefined" ? window.location.origin : ""}/apply/{campaign.slug}</span>
              <svg className="w-4 h-4 text-[#000091] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="1.5" ry="1.5" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
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

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <span className="text-xs font-bold text-[#0F172A] mr-2">Filtrer par :</span>

            {/* Professional Status Dropdown */}
            <div className={`relative ${activeDropdown === "jobStatus" ? "z-30" : ""}`}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "jobStatus" ? null : "jobStatus")}
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 rounded-lg focus:outline-none cursor-pointer transition-all duration-150 ${selectedJobStatuses.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                <span>Statut {selectedJobStatuses.length > 0 ? `(${selectedJobStatuses.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${activeDropdown === "jobStatus" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "jobStatus" && (
                <div className="absolute left-0 mt-1.5 w-56 bg-white border border-[#E2E8F0] shadow-md z-30 py-2 rounded-lg">
                  {JOB_STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] cursor-pointer select-none"
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
              )}
            </div>

            {/* Guarantor Dropdown */}
            <div className={`relative ${activeDropdown === "guarantor" ? "z-30" : ""}`}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "guarantor" ? null : "guarantor")}
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 rounded-lg focus:outline-none cursor-pointer transition-all duration-150 ${selectedGuarantors.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                <span>Garant {selectedGuarantors.length > 0 ? `(${selectedGuarantors.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${activeDropdown === "guarantor" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "guarantor" && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#E2E8F0] shadow-md z-30 py-2 rounded-lg">
                  {GUARANTOR_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] cursor-pointer select-none"
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
              )}
            </div>

            {/* Application State Dropdown */}
            <div className={`relative ${activeDropdown === "status" ? "z-30" : ""}`}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 rounded-lg focus:outline-none cursor-pointer transition-all duration-150 ${selectedStatuses.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091] shadow-xs"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
              >
                <span>État {selectedStatuses.length > 0 ? `(${selectedStatuses.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${activeDropdown === "status" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "status" && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#E2E8F0] shadow-md z-30 py-2 rounded-lg">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        className="mr-2.5 h-3.5 w-3.5 border-[#E2E8F0] text-[#000091] focus:ring-[#000091] rounded-sm cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Clear filters button */}
            {(selectedJobStatuses.length > 0 || selectedGuarantors.length > 0 || selectedStatuses.length > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-bold text-[#CE0500] hover:bg-[#FFE9E9] border border-[#CE0500]/20 rounded-lg focus:outline-none cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => toggleSort("monthlyIncome")}
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer rounded-lg transition-all duration-150 ${sortField === "monthlyIncome"
                ? "bg-[#000091] text-white border-[#000091] shadow-xs"
                : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                }`}
            >
              Trier par Revenu {sortField === "monthlyIncome" && (sortOrder === "desc" ? " ↓" : " ↑")}
            </button>
            <button
              onClick={() => toggleSort("createdAt")}
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer rounded-lg transition-all duration-150 ${sortField === "createdAt"
                ? "bg-[#000091] text-white border-[#000091] shadow-xs"
                : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                }`}
            >
              Trier par Date {sortField === "createdAt" && (sortOrder === "desc" ? " ↓" : " ↑")}
            </button>
          </div>
        </div>

        {/* Candidates Table */}
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
                  <tr key={headerGroup.id} className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    {headerGroup.headers.map((header) => {
                      let alignmentClass = "text-left";
                      if (header.column.id === "monthlyIncome" || header.column.id === "actions") {
                        alignmentClass = "text-right";
                      } else if (
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
                          className={`p-4 text-xs font-bold text-[#475569] uppercase tracking-wider ${alignmentClass} ${canSort
                            ? "cursor-pointer select-none hover:bg-[#F1F5F9] transition-colors"
                            : ""
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
                              <span>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAFC] text-sm text-[#334155] transition-colors duration-150">
                    {row.getVisibleCells().map((cell) => {
                      let alignmentClass = "text-left";
                      if (cell.column.id === "monthlyIncome" || cell.column.id === "actions") {
                        alignmentClass = "text-right";
                      } else if (
                        cell.column.id === "hasGuarantor" ||
                        cell.column.id === "dossierFacileUrl" ||
                        cell.column.id === "status"
                      ) {
                        alignmentClass = "text-center";
                      }

                      return (
                        <td key={cell.id} className={`p-4 ${alignmentClass}`}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </main>
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
                    setModalSuccess(false);
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
              {modalSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#18753C] animate-bounce" />
                  <h4 className="text-base font-bold text-[#161616]">Abonnement activé !</h4>
                  <p className="text-xs text-[#666666] text-center">
                    Toutes les candidatures de cette annonce sont désormais débloquées et visibles.
                  </p>
                </div>
              ) : (
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

                  <div className="space-y-3">
                    {/* Live Card Preview */}
                    <div className="w-full max-w-[240px] h-[140px] mx-auto rounded-xl bg-gradient-to-br from-[#000091] via-[#1212a5] to-[#2626e2] p-3.5 text-white relative shadow-md overflow-hidden flex flex-col justify-between select-none">
                      <div className="absolute -top-12 -right-12 w-20 h-20 bg-[#4242e8]/20 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-12 -left-12 w-16 h-16 bg-[#18753C]/20 rounded-full blur-xl"></div>

                      <div className="flex justify-between items-start">
                        <span className="text-[7px] font-bold tracking-widest uppercase opacity-80">BailConnect Premium</span>
                        <CreditCard className="w-4 h-4 opacity-90" />
                      </div>

                      <div className="w-6 h-4.5 bg-gradient-to-r from-[#e6c15c] to-[#f4d682] rounded-xs relative flex items-center justify-center shadow-inner mt-1">
                        <div className="w-4 h-2.5 border border-[#b38f2d]/30 rounded-xs"></div>
                      </div>

                      <div className="text-sm font-mono tracking-widest text-center mt-1">
                        {modalCardNumber || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between items-end mt-1">
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-[6px] uppercase tracking-wider block opacity-60">Titulaire</span>
                          <span className="text-[9px] font-mono font-bold tracking-wide truncate block">
                            {modalCardName.toUpperCase() || "NOM DU TITULAIRE"}
                          </span>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-[6px] uppercase tracking-wider block opacity-60">Expire</span>
                          <span className="text-[9px] font-mono font-bold tracking-wide">
                            {modalCardExpiry || "MM/AA"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2">
                      <div>
                        <label className="form-label text-[11px] mb-0.5">Nom du titulaire *</label>
                        <input
                          type="text"
                          required
                          value={modalCardName}
                          onChange={(e) => setModalCardName(e.target.value)}
                          className="form-input text-xs py-1 px-2.5"
                          placeholder="JEAN DUPONT"
                          disabled={modalLoading}
                        />
                      </div>

                      <div>
                        <label className="form-label text-[11px] mb-0.5">Numéro de carte *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={modalCardNumber}
                            onChange={(e) => handleModalCardNumberChange(e.target.value)}
                            className="form-input text-xs py-1 px-2.5 pl-8"
                            placeholder="4242 4242 4242 4242"
                            disabled={modalLoading}
                          />
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <CreditCard className="h-3.5 w-3.5 text-[#666666]" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="form-label text-[11px] mb-0.5">Date d&apos;expiration *</label>
                          <input
                            type="text"
                            required
                            value={modalCardExpiry}
                            onChange={(e) => handleModalCardExpiryChange(e.target.value)}
                            className="form-input text-xs py-1 px-2.5"
                            placeholder="12/28"
                            disabled={modalLoading}
                          />
                        </div>
                        <div>
                          <label className="form-label text-[11px] mb-0.5">CVV *</label>
                          <input
                            type="text"
                            required
                            value={modalCardCvv}
                            onChange={(e) => handleModalCardCvvChange(e.target.value)}
                            className="form-input text-xs py-1 px-2.5"
                            placeholder="123"
                            disabled={modalLoading}
                          />
                        </div>
                      </div>
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
                          <span>Paiement en cours...</span>
                        </>
                      ) : (
                        <span>Payer 19 € &amp; Débloquer</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
