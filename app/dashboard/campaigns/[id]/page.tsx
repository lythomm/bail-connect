"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
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

  const columns = useMemo<ColumnDef<Doc<"candidates">>[]>(() => [
    {
      id: "candidateInfo",
      header: "Candidat",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-[#0F172A]">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-xs text-[#64748B]">
            {row.original.email} • {row.original.phone}
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "jobStatus",
      header: "Statut",
      cell: ({ row }) => {
        const jobStatus = row.original.jobStatus;
        const style = JOB_STATUS_STYLES[jobStatus] || JOB_STATUS_STYLES.Other;
        return (
          <span className={`${style.bg} ${style.text} ${style.border} px-2.5 py-0.5 border text-xs font-semibold rounded-md`}>
            {style.label}
          </span>
        );
      },
    },
    {
      accessorKey: "monthlyIncome",
      header: "Revenus Mensuels",
      cell: ({ row }) => {
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
    },
    {
      accessorKey: "hasGuarantor",
      header: "Garant",
      cell: ({ row }) => (
        <span className={row.original.hasGuarantor 
          ? "bg-[#E6F3EA] text-[#18753C] border border-[#B9DFC5] px-2 py-0.5 text-xs font-semibold rounded-md inline-block" 
          : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 text-xs font-semibold rounded-md inline-block"
        }>
          {row.original.hasGuarantor ? "Oui" : "Non"}
        </span>
      ),
    },
    {
      accessorKey: "dossierFacileUrl",
      header: "Dossier",
      cell: ({ row }) => (
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
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nameTrigram",
      header: "Trigramme",
      cell: ({ row }) => (
        <TrigramCell
          trigram={row.original.nameTrigram}
          onCopy={(message, type) => setToast({ message, type })}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "État",
      cell: ({ row }) => {
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
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
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
    },
  ], [campaign, actionLoadingId, handleStatusChange]);

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
    </div>
  );
}
