import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ShieldCheck, User } from "lucide-react";
import { getGuideBySlug, getAllGuides } from "@/lib/guides";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide non trouvé",
      description: "Le guide demandé est introuvable.",
    };
  }

  return {
    title: `${guide.title} – BailConnect`,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": guide.title,
    "description": guide.description,
    "datePublished": guide.date,
    "author": {
      "@type": "Organization",
      "name": "BailConnect",
      "url": "https://bailconnect.fr",
    },
    "publisher": {
      "@type": "Organization",
      "name": "BailConnect",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bailconnect.fr/icon.svg",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex-1 bg-[#F6F6F6] min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="text-xs text-[#666666] mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-[#000091] hover:underline">
              Accueil
            </Link>
            <span>&gt;</span>
            <Link href="/guides" className="hover:text-[#000091] hover:underline">
              Guides & Conseils
            </Link>
            <span>&gt;</span>
            <span className="text-[#000091] font-medium truncate max-w-[200px] md:max-w-xs">
              {guide.title}
            </span>
          </nav>

          {/* Back button */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm text-[#000091] font-semibold mb-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux guides
          </Link>

          {/* Article Container */}
          <article className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-12 shadow-xs">
            {/* Header info */}
            <header className="border-b border-[#E2E8F0] pb-6 mb-8">
              <span className="inline-block bg-[#E3E3FD] text-[#000091] text-xs font-bold px-2.5 py-1 rounded-full mb-4">
                {guide.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#161616] tracking-tight leading-tight mb-4">
                {guide.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(guide.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Par l'équipe BailConnect
                </span>
              </div>
            </header>

            {/* Markdown rendered HTML */}
            <div
              className="guide-content"
              dangerouslySetInnerHTML={{ __html: guide.contentHtml }}
            />

            {/* In-article CTA */}
            <footer className="mt-12 pt-8 border-t border-[#E2E8F0]">
              <div className="bg-[#F5F5FE] border border-[#E3E3FD] rounded-2xl p-8 text-center flex flex-col items-center">
                <ShieldCheck className="w-10 h-10 text-[#000091] mb-3" />
                <h3 className="text-lg font-bold text-[#161616] mb-2">
                  Gérez vos dossiers locataires en toute sérénité
                </h3>
                <p className="text-sm text-[#3A3A3A] max-w-lg mb-6 leading-relaxed">
                  BailConnect vous permet de centraliser les candidatures et de vérifier automatiquement les dossiers avec DossierFacile. Zéro stress, zéro faux documents.
                </p>
                <Link
                  href="/dashboard"
                  className="btn-primary px-8 h-12 flex items-center justify-center font-bold text-base bg-[#000091] text-white hover:bg-[#0b0b7d]"
                >
                  Démarrer gratuitement
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}
