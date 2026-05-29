import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales – BailConnect",
  description: "Mentions légales de BailConnect, solution de gestion des candidatures locataires.",
  robots: "noindex",
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none rounded-2xl">
            BC
          </div>
          <span className="font-bold text-[#161616] text-lg tracking-tight">BailConnect</span>
        </Link>
        <Link href="/" className="btn-secondary text-sm h-9 flex items-center">
          ← Retour à l&apos;accueil
        </Link>
      </header>

      <main className="flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="gov-badge mb-4">Légal</span>
          <h1 className="text-3xl font-extrabold text-[#161616] mb-2 tracking-tight">
            Mentions Légales
          </h1>
          <p className="text-sm text-[#666666] mb-12">
            Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN).
          </p>

          <div className="space-y-10 text-sm text-[#3A3A3A] leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                1. Éditeur du site
              </h2>
              <p>Le site <strong>bailconnect.fr</strong> est édité par :</p>
              <ul className="mt-3 space-y-1 pl-4 list-none">
                <li><strong>Nom / Raison sociale :</strong> <span>Thomas LY EI.</span></li>
                <li><strong>Forme juridique :</strong> <span>Auto-entrepreneur</span></li>
                <li><strong>Adresse :</strong> <span>6 rue louise weiss, 31200 Toulouse</span></li>
                <li><strong>SIRET :</strong> <span>10557895900014</span></li>
                <li><strong>Capital social :</strong> <span>Non applicable</span></li>
                <li><strong>TVA intracommunautaire :</strong> <span>TVA non applicable, article 293 B du CGI</span></li>
                <li><strong>Email de contact :</strong> <span>contact@bailconnect.fr</span></li>
                <li><strong>Directeur de la publication :</strong> <span>Thomas LY</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                2. Hébergement
              </h2>
              <p>Le site est hébergé par :</p>
              <ul className="mt-3 space-y-1 pl-4">
                <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
                <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#000091] underline">vercel.com</a></li>
              </ul>
              <p className="mt-3">La base de données est hébergée par :</p>
              <ul className="mt-3 space-y-1 pl-4">
                <li><strong>Prestataire :</strong> Convex, Inc.</li>
                <li><strong>Site web :</strong> <a href="https://convex.dev" target="_blank" rel="noopener noreferrer" className="text-[#000091] underline">convex.dev</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                3. Propriété intellectuelle
              </h2>
              <p>
                L&apos;ensemble du contenu de ce site (textes, graphismes, logotypes, icônes, logiciels) est la propriété exclusive de BailConnect, sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite.
              </p>
              <p className="mt-3">
                Les marques tierces citées (DossierFacile, Leboncoin, PAP, SeLoger, etc.) appartiennent à leurs propriétaires respectifs. BailConnect n&apos;est pas affilié à ces entreprises.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                4. Limitation de responsabilité
              </h2>
              <p>
                BailConnect s&apos;appuie sur l&apos;API publique de DossierFacile pour accéder aux données certifiées des dossiers locataires. BailConnect ne stocke pas les documents d&apos;identité ni les pièces justificatives sur ses propres serveurs.
              </p>
              <p className="mt-3">
                L&apos;éditeur ne saurait être tenu responsable des erreurs dans les informations fournies par DossierFacile, des décisions prises par les bailleurs sur la base des données affichées, ni des interruptions de service liées à l&apos;API DossierFacile.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                5. Données personnelles
              </h2>
              <p>
                Le traitement des données personnelles collectées via ce site est détaillé dans notre{" "}
                <Link href="/confidentialite" className="text-[#000091] underline font-semibold">
                  Politique de Confidentialité
                </Link>.
              </p>
              <p className="mt-3">
                Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ces droits : <Link href="mailto:[EMAIL_ADDRESS]">contact@bailconnect.fr</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                6. Droit applicable
              </h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-[#F6F6F6] border-t border-[#DDDDDD] py-8 px-6 text-center text-xs text-[#666666]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6">
          <Link href="/mentions-legales" className="hover:underline font-semibold text-[#000091]">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
          <Link href="/cgv" className="hover:underline">CGV</Link>
          <Link href="/cgu" className="hover:underline">CGU</Link>
          <Link href="/" className="hover:underline">Accueil</Link>
        </div>
        <p className="mt-4">© 2026 BailConnect. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
