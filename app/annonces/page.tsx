"use client";

import { useQuery, useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Toast, { ToastType } from "@/components/Toast";
import { Trash2, Loader2 } from "lucide-react";
import Dialog from "@/components/Dialog";

export default function AnnoncesPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const campaigns = useQuery(api.campaigns.listWithStats);
  const user = useQuery(api.users.current);
  const router = useRouter();
  const deleteCampaign = useMutation(api.campaigns.remove);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const campaignToDelete = campaigns?.find(c => c._id === deleteConfirmId);

  const handleDeleteCampaign = async (id: any) => {
    setDeleteLoadingId(id);
    try {
      await deleteCampaign({ id });
      setToast({
        message: "L'annonce a été clôturée et supprimée avec succès.",
        type: "success"
      });
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Une erreur est survenue lors de la suppression de l'annonce.",
        type: "error"
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const copyToClipboard = async (slug: string, id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/apply/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({
        message: "Lien de candidature copié !",
        type: "success",
      });
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setToast({
        message: "Une erreur est survenue lors de la copie du lien.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#161616]">Vos Logements</h1>
            <p className="text-sm text-[#666666] mt-1">
              Gérez vos annonces et visualisez les dossiers de candidature reçus.
            </p>
          </div>
          {campaigns && campaigns.length > 0 && (
            <Link href="/dashboard/campaigns/new" className="btn-primary whitespace-nowrap self-start sm:self-auto">
              Créer une annonce
            </Link>
          )}
        </div>

        {campaigns === undefined ? (
          <div className="text-center py-12">
            <span className="text-sm text-[#666666]">Chargement de vos annonces...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="gov-callout gov-callout-info">
            <h3 className="font-bold text-lg mb-2">Bienvenue sur BailConnect{user?.name ? `, ${user.name}` : ""} !</h3>
            <p className="text-sm text-[#3A3A3A] mb-4">
              Vous n'avez pas encore configuré de tunnel de recrutement pour vos logements. Créez votre première annonce pour obtenir un lien de candidature public.
            </p>
            <Link href="/dashboard/campaigns/new" className="btn-primary">
              Créer ma première annonce
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="gov-card flex flex-col justify-between h-full mb-0 min-w-0">
                <div className="min-w-0">
                  <div className="gov-card-header text-lg font-bold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-col gap-1 min-w-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="truncate">{campaign.title}</span>
                        {campaign.adType === "pass" ? (
                          <span className="text-[10px] font-extrabold bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-sans">
                            Pass Premium
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-[#EEEEEE] text-[#666666] border border-[#CCCCCC]/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-sans">
                            Gratuit
                          </span>
                        )}
                      </div>
                    </div>
                    {campaign.rentAmount !== undefined && (
                      <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-2.5 py-1 rounded-sm border border-[#000091]/20 whitespace-nowrap font-sans self-start sm:self-auto">
                        Loyer : {campaign.rentAmount} €
                      </span>
                    )}
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-[#666666] line-clamp-3 mb-4">
                      {campaign.description}
                    </p>
                  )}

                  {/* Campaign Stats badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-semibold bg-[#FFEFE0] text-[#B35C00] px-2 py-0.5 border border-[#B35C00]/20 rounded-sm">
                      {campaign.stats.pending} en attente
                    </span>
                    <span className="text-xs font-semibold bg-[#E8F6EE] text-[#18753C] px-2 py-0.5 border border-[#18753C]/20 rounded-sm">
                      {campaign.stats.accepted} accepté(s)
                    </span>
                    <span className="text-xs font-semibold bg-[#FCEAEB] text-[#CE0500] px-2 py-0.5 border border-[#CE0500]/20 rounded-sm">
                      {campaign.stats.rejected} refusé(s)
                    </span>
                  </div>

                  <div className="bg-[#F5F5FE] p-3 border border-[#E3E3FD] mb-6 min-w-0">
                    <label className="block text-xs font-bold text-[#000091] uppercase tracking-wider mb-1">
                      Lien public de candidature
                    </label>
                    <div className="flex gap-2 items-center min-w-0">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/apply/${campaign.slug}`}
                        className="text-xs text-[#3A3A3A] bg-transparent border-none outline-none select-all flex-1 truncate min-w-0"
                      />
                      <button
                        onClick={() => copyToClipboard(campaign.slug, campaign._id)}
                        className="text-xs font-bold text-[#000091] hover:underline whitespace-nowrap cursor-pointer shrink-0"
                      >
                        {copiedId === campaign._id ? "Copié !" : "Copier"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-[#DDDDDD] pt-4 mt-auto">
                  <Link
                    href={`/dashboard/campaigns/${campaign._id}`}
                    className="btn-primary text-xs flex-1 text-center justify-center"
                  >
                    Voir les candidats
                  </Link>
                  <button
                    onClick={() => setDeleteConfirmId(campaign._id)}
                    title="Clôturer et supprimer l'annonce"
                    className="text-xs font-bold text-[#CE0500] hover:bg-[#FCE8E6] border border-[#F8C0BC] px-3 py-2 rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1.5 focus:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#CE0500]" />
                    <span>Clôturer</span>
                  </button>
                </div>
              </div>
            ))}

            {/* New campaign mockup card */}
            <Link
              href="/dashboard/campaigns/new"
              className="flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed border-[#CCCCCC] rounded-lg hover:border-[#000091] hover:bg-[#F5F5FE] transition-all duration-200 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#CCCCCC] group-hover:border-[#000091] flex items-center justify-center mb-4 transition-colors">
                <svg className="w-6 h-6 text-[#CCCCCC] group-hover:text-[#000091] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#999999] group-hover:text-[#000091] transition-colors">
                Créer une annonce
              </span>
            </Link>
          </div>
        )}
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Campaign Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Clôturer l'annonce définitivement ?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569] leading-relaxed">
            Êtes-vous sûr de vouloir clôturer définitivement l'annonce <strong>{campaignToDelete?.title}</strong> ?
          </p>
          <div className="bg-[#FFE9E9] border border-[#F8C0BC] p-4 rounded-xl flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-[#CE0500] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#CE0500] uppercase tracking-wider">
                Action irréversible
              </h4>
              <p className="text-xs text-[#7A1C1C] mt-1 leading-relaxed">
                Cette action supprimera définitivement cette annonce ainsi que toutes les candidatures reçues, les créneaux de visite configurés et les rendez-vous associés.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              disabled={deleteLoadingId !== null}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteConfirmId) {
                  handleDeleteCampaign(deleteConfirmId);
                }
              }}
              disabled={deleteLoadingId !== null}
              className="btn-primary text-xs px-4 py-2 cursor-pointer bg-[#CE0500] text-white hover:bg-[#a60400] rounded font-bold flex items-center gap-1.5"
            >
              {deleteLoadingId !== null ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Confirmer la clôture</span>
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
