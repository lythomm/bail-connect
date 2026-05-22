"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewCampaign() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createCampaign = useMutation(api.campaigns.create);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim()) {
      setError("Le titre de l'annonce est obligatoire.");
      setLoading(false);
      return;
    }

    const parsedRent = rentAmount ? parseFloat(rentAmount) : undefined;
    if (parsedRent !== undefined && (isNaN(parsedRent) || parsedRent <= 0)) {
      setError("Le montant du loyer doit être un nombre supérieur à 0.");
      setLoading(false);
      return;
    }

    try {
      await createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        rentAmount: parsedRent,
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
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
      {/* Main Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#666666] mb-2">
            <Link href="/dashboard" className="hover:underline">Tableau de bord</Link>
            <span>&gt;</span>
            <span className="text-[#000091]">Nouveau logement</span>
          </div>
          <h1 className="text-2xl font-bold text-[#161616]">Ajouter un logement</h1>
          <p className="text-sm text-[#666666] mt-1">
            Configurez un nouveau logement pour générer un lien de candidature unique.
          </p>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">Détails de l'annonce</div>
          <div className="gov-card-body">
            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Titre de l'annonce *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="ex: Studio 20m² Paris 11 - Métro Charonne"
                />
                <span className="text-xs text-[#666666] mt-1 block">
                  Saisissez un titre clair pour aider les candidats à identifier votre logement.
                </span>
              </div>

              <div>
                <label htmlFor="rentAmount" className="form-label">
                  Loyer mensuel charges comprises (en €) *
                </label>
                <input
                  id="rentAmount"
                  type="number"
                  required
                  min="1"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="form-input"
                  placeholder="ex: 850"
                />
                <span className="text-xs text-[#666666] mt-1 block">
                  Indiquez le loyer mensuel charges comprises pour calculer le ratio de revenus des candidats (ex: 3x le loyer).
                </span>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description / Critères (Optionnel)
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input h-auto min-h-[100px]"
                  placeholder="ex: Disponible le 1er juin. Profils sérieux uniquement. Garant obligatoire."
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#DDDDDD]">
                <Link
                  href="/dashboard"
                  className="btn-secondary flex-1 text-center justify-center"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Création..." : "Créer l'annonce"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
