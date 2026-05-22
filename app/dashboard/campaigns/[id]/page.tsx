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
        title="Copier"
        className="font-mono font-bold text-[#000091] hover:underline cursor-pointer focus:outline-none flex items-center gap-1.5 group"
      >
        <span>{trigram}</span>
        <svg className="w-3.5 h-3.5 text-[#000091] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
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
          <div className="font-semibold text-[#161616]">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-xs text-[#666666]">
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
          <span className={`${style.bg} ${style.text} ${style.border} px-2 py-0.5 border text-xs font-semibold rounded-sm`}>
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
          <div className="font-semibold text-[#161616]">
            <div>{income.toLocaleString("fr-FR")} €</div>
            {campaign?.rentAmount !== undefined && (
              <div className={`text-xs mt-1 font-medium ${(income / campaign.rentAmount) >= 3
                ? "text-[#18753C]"
                : "text-[#CE0500]"
                }`}>
                {(income / campaign.rentAmount).toFixed(1)}x le loyer
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "hasGuarantor",
      header: "Garant",
      cell: ({ row }) => (
        <span className={row.original.hasGuarantor ? "text-[#18753C] font-semibold" : "text-[#666666]"}>
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
          className="text-[#000091] hover:underline text-xs font-bold inline-flex items-center gap-1"
        >
          Ouvrir ↗
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
          <div>
            {status === "accepted" && <span className="gov-badge gov-badge-success">Accepté</span>}
            {status === "rejected" && <span className="gov-badge gov-badge-error">Refusé</span>}
            {status === "pending" && <span className="gov-badge gov-badge-warning">En attente</span>}
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
                className="bg-[#18753C] text-white text-xs font-bold py-1 px-3 hover:bg-[#135c2f] disabled:opacity-50 cursor-pointer"
              >
                Accepter
              </button>
            )}
            {candidate.status !== "rejected" && (
              <button
                onClick={() => handleStatusChange(candidate._id, "rejected")}
                disabled={actionLoadingId === candidate._id}
                className="bg-[#CE0500] text-white text-xs font-bold py-1 px-3 hover:bg-[#a60400] disabled:opacity-50 cursor-pointer"
              >
                Refuser
              </button>
            )}
            {candidate.status !== "pending" && (
              <button
                onClick={() => handleStatusChange(candidate._id, "pending")}
                disabled={actionLoadingId === candidate._id}
                className="bg-transparent border border-[#DDDDDD] text-[#3A3A3A] text-xs font-bold py-1 px-3 hover:bg-[#F6F6F6] disabled:opacity-50 cursor-pointer"
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
        <div className="bg-white border border-[#DDDDDD] p-6 mb-8 relative">
          <div className="absolute top-6 right-6">
            <span className="text-xs font-semibold text-[#666666] bg-[#F6F6F6] py-1 px-3 border border-[#DDDDDD]">
              {candidates.length} candidat(s) au total
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#161616] mb-2 flex flex-wrap items-center gap-3">
            <span>{campaign.title}</span>
            {campaign.rentAmount !== undefined && (
              <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-2.5 py-1 rounded-sm border border-[#000091]/20">
                Loyer : {campaign.rentAmount} € / mois
              </span>
            )}
          </h1>
          {campaign.description && (
            <p className="text-sm text-[#3A3A3A] max-w-3xl mb-4">{campaign.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-[#666666] mt-4 pt-4 border-t border-[#F6F6F6]">
            <span>Lien de candidature : </span>
            <button
              onClick={handleCopyApplyUrl}
              title="Copier le lien de candidature"
              className="text-[#000091] hover:underline font-medium cursor-pointer focus:outline-none inline-flex items-center gap-1.5 group"
            >
              <span>{typeof window !== "undefined" ? window.location.origin : ""}/apply/{campaign.slug}</span>
              <svg className="w-4 h-4 text-[#000091] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <span className="text-xs font-bold text-[#161616] mr-2">Filtrer par :</span>

            {/* Professional Status Dropdown */}
            <div className={`relative ${activeDropdown === "jobStatus" ? "z-30" : ""}`}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "jobStatus" ? null : "jobStatus")}
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 hover:bg-[#F6F6F6] focus:outline-none cursor-pointer transition-colors ${selectedJobStatuses.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091]"
                  : "bg-white text-[#161616] border-[#DDDDDD]"
                  }`}
              >
                <span>Statut {selectedJobStatuses.length > 0 ? `(${selectedJobStatuses.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${activeDropdown === "jobStatus" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "jobStatus" && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-[#DDDDDD] shadow-lg z-30 py-2 rounded-sm">
                  {JOB_STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#3A3A3A] hover:bg-[#F6F6F6] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedJobStatuses.includes(opt.value)}
                        onChange={() => toggleJobStatus(opt.value)}
                        className="mr-2.5 h-3.5 w-3.5 border-[#DDDDDD] text-[#000091] focus:ring-[#000091] rounded-sm"
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
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 hover:bg-[#F6F6F6] focus:outline-none cursor-pointer transition-colors ${selectedGuarantors.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091]"
                  : "bg-white text-[#161616] border-[#DDDDDD]"
                  }`}
              >
                <span>Garant {selectedGuarantors.length > 0 ? `(${selectedGuarantors.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${activeDropdown === "guarantor" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "guarantor" && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-[#DDDDDD] shadow-lg z-30 py-2 rounded-sm">
                  {GUARANTOR_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#3A3A3A] hover:bg-[#F6F6F6] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGuarantors.includes(opt.value)}
                        onChange={() => toggleGuarantor(opt.value)}
                        className="mr-2.5 h-3.5 w-3.5 border-[#DDDDDD] text-[#000091] focus:ring-[#000091] rounded-sm"
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
                className={`h-8 px-3 border text-xs font-medium flex items-center gap-1.5 hover:bg-[#F6F6F6] focus:outline-none cursor-pointer transition-colors ${selectedStatuses.length > 0
                  ? "bg-[#E3E3FD] text-[#000091] border-[#000091]"
                  : "bg-white text-[#161616] border-[#DDDDDD]"
                  }`}
              >
                <span>État {selectedStatuses.length > 0 ? `(${selectedStatuses.length})` : ""}</span>
                <svg className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${activeDropdown === "status" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "status" && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-[#DDDDDD] shadow-lg z-30 py-2 rounded-sm">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center px-4 py-2 text-xs text-[#3A3A3A] hover:bg-[#F6F6F6] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        className="mr-2.5 h-3.5 w-3.5 border-[#DDDDDD] text-[#000091] focus:ring-[#000091] rounded-sm"
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
                className="h-8 px-3 text-xs font-bold text-[#CE0500] hover:bg-[#FFE9E9] border border-[#CE0500]/20 rounded-sm focus:outline-none cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => toggleSort("monthlyIncome")}
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer ${sortField === "monthlyIncome"
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#3A3A3A] border-[#DDDDDD]"
                }`}
            >
              Trier par Revenu {sortField === "monthlyIncome" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => toggleSort("createdAt")}
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer ${sortField === "createdAt"
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#3A3A3A] border-[#DDDDDD]"
                }`}
            >
              Trier par Date {sortField === "createdAt" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white border border-[#DDDDDD] overflow-x-auto">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-[#666666]">Aucun candidat trouvé pour cette sélection.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-[#F6F6F6] border-b border-[#DDDDDD]">
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
                          className={`p-4 text-xs font-bold text-[#161616] uppercase tracking-wider ${alignmentClass} ${canSort
                            ? "cursor-pointer select-none hover:bg-[#E5E5E5] transition-colors"
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
                                <span className="text-[#666666] font-mono text-xs select-none">
                                  {isSorted === "asc" ? "↑" : isSorted === "desc" ? "↓" : "↕"}
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
              <tbody className="divide-y divide-[#DDDDDD]">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F5F5FE] text-sm text-[#3A3A3A]">
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
