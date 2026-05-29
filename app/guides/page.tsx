import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { getAllGuides } from "@/lib/guides";

export const metadata = {
  title: "Guides et Conseils pour Propriétaires Bailleurs – BailConnect",
  description: "Découvrez nos guides pratiques pour gérer vos locations : recherche de locataires, vérification de dossier DossierFacile, visites et gestion locative.",
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <div className="flex-1 bg-[#F6F6F6] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#666666] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#000091] hover:underline">
            Accueil
          </Link>
          <span>&gt;</span>
          <span className="text-[#000091] font-medium">Guides & Conseils</span>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="inline-flex items-center justify-center bg-[#E3E3FD] border border-[#CBCBFC] text-[#000091] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Ressources Bailleurs
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#161616] tracking-tight mb-4">
            Guides & Conseils pour Propriétaires
          </h1>
          <p className="text-base md:text-lg text-[#3A3A3A] max-w-2xl">
            Toutes les clés pour gérer vos locations en toute sérénité : optimiser vos annonces, sécuriser vos dossiers et simplifier vos visites.
          </p>
        </div>

        {/* Guides Grid */}
        {guides.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] p-12 text-center rounded-2xl">
            <BookOpen className="w-12 h-12 text-[#666666] mx-auto mb-4" />
            <p className="text-lg text-[#161616] font-bold">Aucun guide disponible pour le moment.</p>
            <p className="text-sm text-[#3A3A3A] mt-2">Revenez très bientôt pour de nouveaux articles !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-[#CBCBFC] transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block bg-[#E3E3FD] text-[#000091] text-xs font-bold px-2.5 py-1 rounded-full">
                      {guide.category}
                    </span>
                    <span className="text-xs text-[#666666] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(guide.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#161616] mb-3 group-hover:text-[#000091] transition-colors duration-300">
                    <Link href={`/guides/${guide.slug}`}>
                      {guide.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed mb-6">
                    {guide.description}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#000091] hover:underline"
                  >
                    Lire le guide
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Security & Co-branding banner */}
        <div className="mt-16 bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-[#E3E3FD] text-[#000091] rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#161616] mb-1">
              Des dossiers vérifiés à 100% par l'État
            </h3>
            <p className="text-sm text-[#3A3A3A] leading-relaxed">
              BailConnect s'associe au service officiel <strong>DossierFacile</strong> pour garantir la conformité et l'authenticité des pièces justificatives fournies par vos candidats. Fini le risque de faux dossiers.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/dashboard"
              className="btn-primary w-full md:w-auto px-6 h-11 flex items-center justify-center font-bold text-sm bg-[#000091] text-white hover:bg-[#0b0b7d]"
            >
              Créer mon annonce gratuite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
