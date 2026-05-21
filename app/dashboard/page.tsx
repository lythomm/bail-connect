"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Toast, { ToastType } from "@/components/Toast";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const campaigns = useQuery(api.campaigns.listWithStats);
  const user = useQuery(api.users.current);
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F6]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#161616]">Vos Logements</h1>
            <p className="text-sm text-[#666666] mt-1">
              Gérez vos annonces et visualisez les dossiers de candidature reçus.
            </p>
          </div>
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
              <div key={campaign._id} className="gov-card flex flex-col justify-between h-full mb-0">
                <div>
                  <div className="gov-card-header text-lg font-bold flex justify-between items-start gap-4">
                    <span className="truncate">{campaign.title}</span>
                    {campaign.rentAmount !== undefined && (
                      <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-2.5 py-1 rounded-sm border border-[#000091]/20 whitespace-nowrap font-sans">
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

                  {/* Public Link section */}
                  <div className="bg-[#F5F5FE] p-3 border border-[#E3E3FD] mb-6">
                    <label className="block text-xs font-bold text-[#000091] uppercase tracking-wider mb-1">
                      Lien public de candidature
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/apply/${campaign.slug}`}
                        className="text-xs text-[#3A3A3A] bg-transparent border-none outline-none select-all flex-1 truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(campaign.slug, campaign._id)}
                        className="text-xs font-bold text-[#000091] hover:underline whitespace-nowrap cursor-pointer"
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
                </div>
              </div>
            ))}
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
    </div>
  );
}
