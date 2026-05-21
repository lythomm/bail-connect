import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente – BailConnect",
  description: "CGV de BailConnect : tarifs, modalités de paiement, droit de rétractation et conditions d'abonnement.",
  robots: "noindex",
};

export default function CGVPage() {
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
          <span className="gov-badge mb-4">Commercial</span>
          <h1 className="text-3xl font-extrabold text-[#161616] mb-2 tracking-tight">
            Conditions Générales de Vente
          </h1>
          <p className="text-sm text-[#666666] mb-12">
            Dernière mise à jour : mai 2026 — Ces CGV s&apos;appliquent à toute souscription payante sur la plateforme BailConnect.
          </p>

          <div className="space-y-10 text-sm text-[#3A3A3A] leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                1. Parties et objet
              </h2>
              <p>
                Les présentes CGV régissent les relations entre BailConnect (<span className="text-[#CE0500]">[Raison sociale — SIRET]</span>, ci-après &quot;le Prestataire&quot;) et toute personne physique ou morale procédant à l&apos;achat d&apos;un plan payant (ci-après &quot;le Client&quot;).
              </p>
              <p className="mt-3">
                BailConnect est un service en ligne permettant aux bailleurs de collecter et gérer des candidatures locataires certifiées via DossierFacile.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                2. Offres et tarifs
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="bg-[#F5F5FE]">
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Plan</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Prix TTC</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Facturation</th>
                      <th className="border border-[#DDDDDD] px-3 py-2 text-left font-bold">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2 font-semibold">Découverte</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">0 €</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">—</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Sans engagement</td>
                    </tr>
                    <tr className="bg-[#F9F9F9]">
                      <td className="border border-[#DDDDDD] px-3 py-2 font-semibold">Pass Annonce</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">19 € TTC</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Par annonce (paiement unique)</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Sans engagement</td>
                    </tr>
                    <tr>
                      <td className="border border-[#DDDDDD] px-3 py-2 font-semibold">Abonnement Pro</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">39 € TTC / mois</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Mensuelle, reconduction tacite</td>
                      <td className="border border-[#DDDDDD] px-3 py-2">Sans engagement minimum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                Les prix sont indiqués en euros TTC. <span className="text-[#CE0500]">[Préciser si soumis à TVA et à quel taux]</span>. Le Prestataire se réserve le droit de modifier ses tarifs à tout moment. Les modifications de tarif prennent effet pour les abonnements existants avec un préavis d&apos;un mois.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                3. Modalités de paiement
              </h2>
              <p>
                Le paiement s&apos;effectue en ligne par carte bancaire via <span className="text-[#CE0500]">[Stripe / Mollie / etc. — à préciser]</span>, opérateur de paiement sécurisé. Les données bancaires ne transitent pas par les serveurs de BailConnect.
              </p>
              <p className="mt-3">
                Pour l&apos;Abonnement Pro, le paiement est prélevé automatiquement chaque mois à la date anniversaire de la souscription.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                4. Droit de rétractation
              </h2>
              <div className="bg-[#F5F5FE] border border-[#E3E3FD] rounded-2xl p-4 mb-4">
                <p className="font-semibold text-[#000091] mb-2">Article L221-18 du Code de la consommation</p>
                <p>
                  Pour tout achat réalisé par un consommateur (personne physique agissant hors cadre professionnel), vous disposez d&apos;un <strong>délai de rétractation de 14 jours calendaires</strong> à compter de la date de souscription.
                </p>
              </div>
              <p>
                <strong>Exception :</strong> Si vous demandez expressément que le service commence avant l&apos;expiration du délai de rétractation (en cochant la case lors de la souscription), vous reconnaissez perdre votre droit de rétractation dès que le service a été pleinement exécuté.
              </p>
              <p className="mt-3">
                Pour exercer votre droit de rétractation : <span className="text-[#CE0500]">[contact@bailconnect.fr]</span> avec l&apos;objet &quot;Rétractation&quot; et votre numéro de commande.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                5. Résiliation de l&apos;Abonnement Pro
              </h2>
              <p>
                Le Client peut résilier son Abonnement Pro à tout moment, sans frais, depuis son espace personnel ou par email à <span className="text-[#CE0500]">[contact@bailconnect.fr]</span>. La résiliation prend effet à la fin de la période mensuelle en cours déjà facturée.
              </p>
              <p className="mt-3">Aucun remboursement au prorata ne sera effectué pour la période restante après résiliation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                6. Disponibilité du service
              </h2>
              <p>
                BailConnect s&apos;engage à maintenir une disponibilité du service de <span className="text-[#CE0500]">[99% — à adapter selon votre SLA réel]</span>, hors maintenances planifiées notifiées à l&apos;avance. BailConnect ne peut garantir la disponibilité permanente de l&apos;API DossierFacile, qui dépend du Ministère du Logement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                7. Limitation de responsabilité
              </h2>
              <p>
                BailConnect est un outil d&apos;aide à la décision. Le Prestataire ne peut être tenu responsable des décisions de location prises par le Client, des interruptions de service liées à DossierFacile, ni de toute perte financière résultant de l&apos;utilisation du service.
              </p>
              <p className="mt-3">
                La responsabilité du Prestataire est limitée au montant des sommes effectivement payées par le Client au cours des 12 derniers mois.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#161616] mb-3 pb-2 border-b border-[#DDDDDD]">
                8. Droit applicable et litiges
              </h2>
              <p>
                Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort du siège social du Prestataire seront saisis.
              </p>
              <p className="mt-3">
                Conformément au Code de la consommation, vous pouvez avoir recours à la médiation de la consommation. <span className="text-[#CE0500]">[Indiquer le nom du médiateur agréé retenu]</span>.
              </p>
            </section>

            <div className="bg-[#FFF8E6] border border-[#FFD700] rounded-2xl p-4 text-xs text-[#3A3A3A]">
              <strong>⚠️ Note pour le déploiement :</strong> Les champs en rouge <span className="text-[#CE0500]">[À COMPLÉTER]</span> doivent être renseignés avant la mise en ligne. En particulier : l&apos;opérateur de paiement, le médiateur de la consommation, et les informations sur la TVA. Ces CGV engagent votre responsabilité commerciale — faites-les relire par un professionnel.
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-[#F6F6F6] border-t border-[#DDDDDD] py-8 px-6 text-center text-xs text-[#666666]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6">
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
          <Link href="/cgv" className="hover:underline font-semibold text-[#000091]">CGV</Link>
          <Link href="/cgu" className="hover:underline">CGU</Link>
          <Link href="/" className="hover:underline">Accueil</Link>
        </div>
        <p className="mt-4">© 2026 BailConnect. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
