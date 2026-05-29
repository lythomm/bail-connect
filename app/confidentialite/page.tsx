import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité – BailConnect",
  description: "Comment BailConnect collecte, utilise et protège vos données personnelles. Conformité RGPD.",
  robots: "noindex",
};

export default function ConfidentialitePage() {
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
          <span className="gov-badge mb-4">RGPD</span>
          <h1 className="text-3xl font-extrabold text-[#161616] mb-2 tracking-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-[#666666] mb-12">
            Dernière mise à jour : mai 2026 — Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
          </p>

          <div className="space-y-10 text-sm text-[#3A3A3A] leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                1. Responsable du traitement
              </h2>
              <p>
                Le responsable du traitement des données collectées via BailConnect est :<br />
                <strong>Thomas LY EI</strong>, demeurant au 6 rue louise weiss, 31200 Toulouse, email : <Link href="mailto:contact@bailconnect.fr" className="text-[#000091] underline">contact@bailconnect.fr</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                2. Données collectées et finalités
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="bg-[#F5F5FE]">
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold text-[#161616]">Données</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold text-[#161616]">Finalité</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold text-[#161616]">Base légale</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold text-[#161616]">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2">Email, mot de passe (hashé)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Création et gestion du compte bailleur</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Exécution du contrat (art. 6.1.b RGPD)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Durée du compte + 3 ans</td>
                    </tr>
                    <tr className="bg-[#F9F9F9]">
                      <td className="border border-[#DDDDDD] px-3 py-2">Nom des annonces, liens générés</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Fourniture du service de gestion locative</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Exécution du contrat (art. 6.1.b)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Durée du compte + 1 an</td>
                    </tr>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2">Données de facturation (si plan payant)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Paiement et obligations comptables</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Obligation légale (art. 6.1.c)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">10 ans (obligation comptable)</td>
                    </tr>
                    <tr className="bg-[#F9F9F9]">
                      <td className="border border-[#DDDDDD] px-3 py-2">Logs de connexion, adresse IP</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Sécurité et prévention des abus</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Intérêt légitime (art. 6.1.f)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">12 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                3. Données des candidats locataires
              </h2>
              <div className="bg-[#F5F5FE] border border-[#E3E3FD] rounded-2xl p-4">
                <p className="font-semibold text-[#000091] mb-2">Point essentiel — Architecture sans stockage</p>
                <p>
                  BailConnect n&apos;accède aux données des candidats locataires (revenus, contrat de travail, pièce d&apos;identité) <strong>que via des liens sécurisés fournis par DossierFacile</strong>. Ces données ne sont <strong>jamais copiées ni stockées</strong> sur les serveurs de BailConnect.
                </p>
                <p className="mt-2">
                  Les documents physiques restent hébergés exclusivement sur l&apos;infrastructure de l&apos;État (DossierFacile — Ministère du Logement). BailConnect ne traite donc pas de données sensibles de candidats au sens du RGPD.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                4. Sous-traitants (transferts de données)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="bg-[#F5F5FE]">
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Sous-traitant</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Rôle</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Pays</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Garanties</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2">Vercel Inc.</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Hébergement de l&apos;application web</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">USA (UE possible)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">CCT UE — DPA disponible</td>
                    </tr>
                    <tr className="bg-[#F9F9F9]">
                      <td className="border border-[#DDDDDD] px-3 py-2">Convex Inc.</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Base de données et fonctions serveur</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Irlande (UE)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Données stockées dans l&apos;UE — DPA disponible</td>
                    </tr>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2">DossierFacile (État)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Certification des dossiers locataires</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">France</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Hébergement souverain France</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-[#666666]">CCT : Clauses Contractuelles Types approuvées par la Commission Européenne.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                5. Vos droits
              </h2>
              <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
              <ul className="mt-3 space-y-2 pl-4">
                <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> — supprimer votre compte et vos données</li>
                <li><strong>Droit à la portabilité</strong> — récupérer vos données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition</strong> — vous opposer à un traitement basé sur l&apos;intérêt légitime</li>
                <li><strong>Droit à la limitation</strong> — limiter temporairement le traitement</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <Link href="mailto:contact@bailconnect.fr" className="text-[#000091] underline">contact@bailconnect.fr</Link>
              </p>
              <p className="mt-2">
                En cas de litige, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#000091] underline">CNIL</a> (Commission Nationale de l&apos;Informatique et des Libertés).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                6. Cookies
              </h2>
              <p>BailConnect utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement du service (session d&apos;authentification). Aucun cookie analytique ou publicitaire n&apos;est déposé.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                7. Sécurité
              </h2>
              <p>
                BailConnect met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des communications (HTTPS/TLS), hachage des mots de passe, accès restreint aux données de production, journalisation des accès.
              </p>
            </section>

          </div>
        </div>
      </main>

      <footer className="bg-[#F6F6F6] border-t border-[#DDDDDD] py-8 px-6 text-center text-xs text-[#666666]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6">
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:underline font-semibold text-[#000091]">Politique de confidentialité</Link>
          <Link href="/cgv" className="hover:underline">CGV</Link>
          <Link href="/cgu" className="hover:underline">CGU</Link>
          <Link href="/" className="hover:underline">Accueil</Link>
        </div>
        <p className="mt-4">© 2026 BailConnect. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
