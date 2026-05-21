"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
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

export default function CampaignDetail() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as Id<"campaigns"> | undefined;

  const campaign = useQuery(api.campaigns.get, campaignId ? { id: campaignId } : "skip");
  const candidates = useQuery(api.candidates.getByCampaign, campaignId ? { campaignId } : "skip");
  const updateStatus = useMutation(api.candidates.updateStatus);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Sync statusFilter with columnFilters
  useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters([]);
    } else {
      setColumnFilters([{ id: "status", value: statusFilter }]);
    }
  }, [statusFilter]);

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
      cell: ({ row }) => (
        <span className="bg-[#F6F6F6] px-2 py-0.5 border border-[#DDDDDD] text-xs font-semibold text-[#3A3A3A]">
          {row.original.jobStatus}
        </span>
      ),
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
    data: candidates || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        createdAt: false,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (authLoading || campaign === undefined || candidates === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de la campagne et des candidats...</span>
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F6F6F6] px-6">
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F6]">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
          <Link href="/dashboard" className="hover:underline">Logements</Link>
          <span>&gt;</span>
          <span className="text-[#000091] font-medium truncate max-w-[200px]">{campaign.title}</span>
        </div>

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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <label htmlFor="filter-status" className="text-xs font-bold text-[#161616] whitespace-nowrap">
              Filtrer par statut :
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-[#DDDDDD] p-2 outline-none h-8"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
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
