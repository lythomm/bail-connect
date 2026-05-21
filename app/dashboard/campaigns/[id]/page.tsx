"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function CampaignDetail() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as Id<"campaigns"> | undefined;

  const campaign = useQuery(api.campaigns.get, campaignId ? { id: campaignId } : "skip");
  const candidates = useQuery(api.candidates.getByCampaign, campaignId ? { campaignId } : "skip");
  const updateStatus = useMutation(api.candidates.updateStatus);

  const [sortField, setSortField] = useState<"monthlyIncome" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Memoized and sorted candidates
  const sortedAndFilteredCandidates = useMemo(() => {
    if (!candidates) return [];

    let filtered = [...candidates];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [candidates, sortField, sortOrder, statusFilter]);

  const handleStatusChange = async (candidateId: Id<"candidates">, newStatus: "accepted" | "rejected" | "pending") => {
    setActionLoadingId(candidateId);
    try {
      await updateStatus({ id: candidateId, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Une erreur est survenue lors de la mise à jour du statut.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleSort = (field: "monthlyIncome" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

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
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none">
            BC
          </div>
          <Link href="/dashboard" className="font-bold text-[#161616] text-lg hover:underline">
            BailConnect
          </Link>
        </div>
        <Link href="/dashboard" className="btn-secondary text-sm h-9 flex items-center">
          Tableau de bord
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
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
          <h1 className="text-2xl font-bold text-[#161616] mb-2">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-[#3A3A3A] max-w-3xl mb-4">{campaign.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-[#666666] mt-4 pt-4 border-t border-[#F6F6F6]">
            <span>Lien de candidature : </span>
            <a
              href={`${typeof window !== "undefined" ? window.location.origin : ""}/apply/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#000091] hover:underline font-medium"
            >
              {typeof window !== "undefined" ? window.location.origin : ""}/apply/{campaign.slug}
            </a>
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
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer ${
                sortField === "monthlyIncome"
                  ? "bg-[#000091] text-white border-[#000091]"
                  : "bg-white text-[#3A3A3A] border-[#DDDDDD]"
              }`}
            >
              Trier par Revenu {sortField === "monthlyIncome" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => toggleSort("createdAt")}
              className={`text-xs font-bold px-3 py-1.5 border cursor-pointer ${
                sortField === "createdAt"
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
          {sortedAndFilteredCandidates.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-[#666666]">Aucun candidat trouvé pour cette sélection.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] border-b border-[#DDDDDD]">
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider">Trigramme</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider">Candidat</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider">Statut Professionnel</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider text-right">Revenus Mensuels</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider text-center">Garant</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider text-center">Dossier</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider text-center">Statut</th>
                  <th className="p-4 text-xs font-bold text-[#161616] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDDDD]">
                {sortedAndFilteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-[#F5F5FE] text-sm text-[#3A3A3A]">
                    <td className="p-4 font-mono font-bold text-[#000091]">
                      {candidate.nameTrigram}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#161616]">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                      <div className="text-xs text-[#666666]">
                        {candidate.email} • {candidate.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#F6F6F6] px-2 py-0.5 border border-[#DDDDDD] text-xs font-semibold text-[#3A3A3A]">
                        {candidate.jobStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-[#161616]">
                      {candidate.monthlyIncome.toLocaleString("fr-FR")} €
                    </td>
                    <td className="p-4 text-center">
                      {candidate.hasGuarantor ? (
                        <span className="text-[#18753C] font-semibold">Oui</span>
                      ) : (
                        <span className="text-[#666666]">Non</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <a
                        href={candidate.dossierFacileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#000091] hover:underline text-xs font-bold inline-flex items-center gap-1"
                      >
                        Ouvrir ↗
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      {candidate.status === "accepted" && (
                        <span className="gov-badge gov-badge-success">Accepté</span>
                      )}
                      {candidate.status === "rejected" && (
                        <span className="gov-badge gov-badge-error">Refusé</span>
                      )}
                      {candidate.status === "pending" && (
                        <span className="gov-badge gov-badge-warning">En attente</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
