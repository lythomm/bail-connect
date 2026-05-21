"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const campaigns = useQuery(api.campaigns.list);
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const copyToClipboard = (slug: string, id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/apply/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none">
            BC
          </div>
          <span className="font-bold text-[#161616] text-lg">BailConnect</span>
        </div>
        <div className="flex items-center gap-4">
          {user?.name && (
            <span className="text-sm font-medium text-[#3A3A3A] hidden sm:inline mr-2">
              Bonjour, {user.name}
            </span>
          )}
          <Link href="/dashboard/campaigns/new" className="btn-primary text-sm h-9 flex items-center">
            Nouveau logement
          </Link>
          <button
            onClick={handleSignOut}
            className="btn-secondary text-sm h-9 flex items-center"
          >
            Se déconnecter
          </button>
        </div>
      </header>

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
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-[#666666] line-clamp-3 mb-4">
                      {campaign.description}
                    </p>
                  )}

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
    </div>
  );
}
