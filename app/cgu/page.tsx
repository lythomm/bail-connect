import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – BailConnect",
  description: "CGU de BailConnect : modalités d'utilisation de la plateforme de gestion de dossiers locataires.",
  robots: "noindex",
};

export default function CGUPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
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
          <span className="gov-badge mb-4">Utilisation</span>
          <h1 className="text-3xl font-extrabold text-[#161616] mb-2 tracking-tight">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-sm text-[#666666] mb-12">
            Dernière mise à jour : mai 2026 — Ces CGU définissent les règles d&apos;accès et d&apos;utilisation du service BailConnect.
          </p>

          <div className="space-y-10 text-sm text-[#3A3A3A] leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                1. Objet et acceptation des CGU
              </h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (ci-après &quot;CGU&quot;) ont pour objet de définir les modalités de mise à disposition et d&apos;utilisation du site <strong>bailconnect.fr</strong> et de ses services associés.
              </p>
              <p className="mt-3">
                L&apos;accès et l&apos;utilisation du site par tout Utilisateur impliquent l&apos;acceptation pleine, entière et sans réserve des présentes CGU. Si un Utilisateur n&apos;accepte pas tout ou partie des CGU, il doit cesser immédiatement d&apos;utiliser le site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                2. Services fournis
              </h2>
              <p>
                BailConnect est une plateforme en ligne indépendante conçue pour aider les bailleurs (propriétaires ou professionnels de l&apos;immobilier) à collecter, organiser et étudier les candidatures locataires certifiées.
              </p>
              <p className="mt-3">
                Le service s&apos;appuie sur l&apos;API de la plateforme publique <strong>DossierFacile</strong>. BailConnect n&apos;est pas un service public de l&apos;État français, mais un service tiers connecté à l&apos;API DossierFacile.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                3. Accès au service et création de compte
              </h2>
              <p>
                L&apos;accès aux fonctionnalités principales de BailConnect nécessite la création d&apos;un compte Utilisateur (espace propriétaire). L&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription.
              </p>
              <p className="mt-3">
                L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants et de toutes les actions réalisées sous son compte. En cas d&apos;utilisation frauduleuse constatée, il s&apos;engage à en informer immédiatement l&apos;éditeur à l&apos;adresse : <span className="text-[#CE0500]">[contact@bailconnect.fr]</span>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                4. Obligations de l&apos;Utilisateur (Bailleur)
              </h2>
              <p>Dans le cadre de l&apos;utilisation de BailConnect, l&apos;Utilisateur s&apos;engage à :</p>
              <ul className="mt-3 space-y-2 pl-4 list-disc">
                <li>Respecter la législation en vigueur, notamment en matière de protection des données personnelles (RGPD) et de non-discrimination au logement.</li>
                <li>Ne pas collecter les dossiers des candidats dans un but malveillant, frauduleux ou d&apos;usurpation d&apos;identité.</li>
                <li>Ne pas effectuer de copies locales non sécurisées des pièces d&apos;identité et justificatifs financiers des candidats.</li>
                <li>N&apos;utiliser les informations des candidats reçues via DossierFacile que dans le cadre exclusif de l&apos;analyse de leur solvabilité pour le logement concerné.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                5. Responsabilité et limitation de garanties
              </h2>
              <p>
                BailConnect met en œuvre tous les moyens raisonnables pour assurer un accès de qualité au service. Cependant, le service est fourni &quot;en l&apos;état&quot; et &quot;selon disponibilité&quot; sans garantie d&apos;aucune sorte.
              </p>
              <p className="mt-3">
                BailConnect ne saurait être tenu responsable des dysfonctionnements, lenteurs ou pannes de la plateforme publique DossierFacile, dont le service dépend entièrement pour la validation et l&apos;accès aux dossiers locataires.
              </p>
              <p className="mt-3">
                L&apos;Utilisateur est seul décisionnaire du choix de son locataire. BailConnect n&apos;intervient pas dans la relation contractuelle entre le bailleur et le candidat locataire, et ne peut en aucun cas être tenu responsable de loyers impayés, de dégradations ou de tout litige découlant du bail de location.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                6. Propriété intellectuelle
              </h2>
              <p>
                La structure du site, les logos, designs, graphismes, textes et codes sources de BailConnect sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou distribution non autorisée est passible de poursuites.
              </p>
              <p className="mt-3">
                Les dénominations DossierFacile, Leboncoin, PAP, SeLoger, etc., sont des marques déposées de leurs propriétaires respectifs et ne font l&apos;objet d&apos;aucun transfert de propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                7. Modification des CGU
              </h2>
              <p>
                L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment, notamment pour s&apos;adapter aux évolutions législatives, réglementaires ou techniques. Les modifications sont opposables aux Utilisateurs dès leur mise en ligne.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                8. Droit applicable et juridiction
              </h2>
              <p>
                Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation et/ou à leur exécution relève des tribunaux français compétents.
              </p>
            </section>

            <div className="bg-[#FFF8E6] border border-[#FFD700] rounded-2xl p-4 text-xs text-[#3A3A3A]">
              <strong>⚠️ Note pour le déploiement :</strong> Renseignez l&apos;adresse de contact <span className="text-[#CE0500]">[contact@bailconnect.fr]</span> ou vos informations réelles avant la mise en ligne.
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-[#F6F6F6] border-t border-[#DDDDDD] py-8 px-6 text-center text-xs text-[#666666]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6">
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
          <Link href="/cgv" className="hover:underline">CGV</Link>
          <Link href="/cgu" className="hover:underline font-semibold text-[#000091]">CGU</Link>
          <Link href="/" className="hover:underline">Accueil</Link>
        </div>
        <p className="mt-4">© 2026 BailConnect. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
