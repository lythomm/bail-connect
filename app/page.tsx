export const dynamic = "force-dynamic";

import Link from "next/link";
import { ShieldCheck, Check, XCircle, CheckCircle, ClipboardCheck, Users, ChevronDown, X, Mail, AlertTriangle, Clock, ShieldAlert, Link2, LayoutDashboard, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none rounded-2xl">
            BC
          </div>
          <span className="font-bold text-[#161616] text-lg tracking-tight">BailConnect</span>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#comparatif" className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors">
            Pourquoi nous ?
          </a>
          <a href="#fonctionnement" className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors">
            Comment ça marche
          </a>
          <a href="#dossier-facile" className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors">
            Partenaire DossierFacile
          </a>
          <a href="#tarifs" className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="btn-secondary text-sm h-9 flex items-center">
            Espace Propriétaire
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F5FE] to-white border-b border-[#DDDDDD] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Hero Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="gov-badge mb-4">Solution Bailleurs • 100% Gratuit</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#161616] tracking-tight leading-tight mb-6">
              Divisez par 10 le temps de traitement de vos candidatures de locataires
            </h1>
            <p className="text-lg text-[#3A3A3A] mb-8 leading-relaxed">
              Ne subissez plus la pollution d'e-mails et les dizaines de pièces jointes PDF en vrac.
              Générez un lien de candidature unique à insérer dans vos annonces et recevez des profils complets,
              <strong> pré-vérifiés par l'État via DossierFacile</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/dashboard" className="btn-primary text-base px-8 h-12 flex items-center justify-center font-bold">
                Créer un tunnel de candidature
              </Link>
              <a
                href="#fonctionnement"
                className="btn-secondary text-base px-8 h-12 flex items-center justify-center font-semibold"
              >
                Découvrir la méthode ↗
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-[#666666]">
              <ShieldCheck className="w-5 h-5 text-[#18753C] flex-shrink-0" />
              <span>Conforme RGPD : aucun stockage local de documents d'identité</span>
            </div>
          </div>

          {/* Right Hero Column: Dashboard Mockup Preview */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white border border-[#DDDDDD] shadow-lg rounded-2xl overflow-hidden">
              {/* Fake Dashboard Title Bar */}
              <div className="bg-[#000091] px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span className="text-xs font-bold uppercase tracking-wider">Aperçu Propriétaire</span>
                </div>
                <span className="text-xs text-blue-200">Appartement Lyon 3e</span>
              </div>

              {/* Fake Candidates List */}
              <div className="p-4 space-y-3 bg-[#F6F6F6]">
                {/* Candidate 1 */}
                <div className="bg-white p-3 border border-[#DDDDDD] rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#161616]">Alexandre M.</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#18753C] bg-green-50 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3 text-[#18753C]" />
                      Dossier Certifié
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-[#3A3A3A] bg-[#F5F5FE] p-2 rounded-2xl">
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Contrat</span>
                      <strong className="font-semibold text-xs">CDI</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Revenus</span>
                      <strong className="font-semibold text-xs">3 150 €</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Garant</span>
                      <strong className="font-semibold text-xs">Oui (Physique)</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-[#F2F2F2]">
                    <span className="text-[#666666]">Revenus : <strong>3.7x</strong> le loyer</span>
                    <span className="text-[#000091] font-semibold hover:underline">Voir dossier d'État ↗</span>
                  </div>
                </div>

                {/* Candidate 2 */}
                <div className="bg-white p-3 border border-[#DDDDDD] rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#161616]">Mélanie D.</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#18753C] bg-green-50 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3 text-[#18753C]" />
                      Dossier Certifié
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-[#3A3A3A] bg-[#F5F5FE] p-2 rounded-2xl">
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Contrat</span>
                      <strong className="font-semibold text-xs">CDI (Période d'essai)</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Revenus</span>
                      <strong className="font-semibold text-xs">2 850 €</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#666666] uppercase">Garant</span>
                      <strong className="font-semibold text-xs">Visale (Action Log.)</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-[#F2F2F2]">
                    <span className="text-[#666666]">Revenus : <strong>3.3x</strong> le loyer</span>
                    <span className="text-[#000091] font-semibold hover:underline">Voir dossier d'État ↗</span>
                  </div>
                </div>

                {/* Candidate 3 */}
                <div className="bg-white p-3 border border-[#DDDDDD] rounded-2xl flex flex-col gap-2 opacity-75">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#161616] line-through">Julien L.</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#CE0500] bg-red-50 px-2 py-0.5 rounded">
                      Incomplet / Non validé
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#666666]">Dossier rejeté par DossierFacile</span>
                    <span className="text-[#666666] text-[11px]">Éliminé d'office</span>
                  </div>
                </div>
              </div>

              {/* Fake dashboard summary bar */}
              <div className="bg-white border-t border-[#DDDDDD] p-3 text-center text-xs text-[#666666]">
                Comparez instantanément les dossiers certifiés sur un tableau unique.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-white border-b border-[#DDDDDD] py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <h4 className="text-4xl sm:text-5xl font-black text-[#000091] mb-2">10 minutes</h4>
            <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">De tri par annonce</p>
            <p className="text-sm text-[#3A3A3A]">
              Visualisez toutes les candidatures sur une page claire au lieu de passer des heures à ouvrir des e-mails.
            </p>
          </div>
          <div className="p-4 border-t md:border-t-0 md:border-x border-[#DDDDDD]">
            <h4 className="text-4xl sm:text-5xl font-black text-[#18753C] mb-2">0% de Fraude</h4>
            <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">Documents vérifiés par l'État</p>
            <p className="text-sm text-[#3A3A3A]">
              Tous les documents (avis d'impôt, bulletins de salaire, identité) sont certifiés par les agents officiels DossierFacile.
            </p>
          </div>
          <div className="p-4 border-t md:border-t-0 border-[#DDDDDD]">
            <h4 className="text-4xl sm:text-5xl font-black text-[#FF6B4A] mb-2">100% Gratuit</h4>
            <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">Pour tous les bailleurs</p>
            <p className="text-sm text-[#3A3A3A]">
              Pas de frais cachés. Créez autant de tunnels de candidature que nécessaire pour vos locations.
            </p>
          </div>
        </div>
      </section>

      {/* Pain Points vs. Solution (Avant / Après) */}
      <section id="comparatif" className="bg-[#F6F6F6] border-b border-[#DDDDDD] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="gov-badge mb-3">La comparaison</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
              Pourquoi changer votre façon de recruter vos locataires ?
            </h2>
            <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
              La gestion traditionnelle des dossiers de location est une source de stress et de risques juridiques. Voici comment BailConnect simplifie tout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* The Old Painful Way */}
            <div className="bg-[#FFFDFD] border border-[#FAD8D8] p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-[#CE0500]">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#CE0500] uppercase tracking-wider flex items-center gap-2.5">
                    <XCircle className="w-6 h-6 text-[#CE0500] flex-shrink-0" />
                    Avant : Le chaos traditionnel
                  </h3>
                  <span className="text-xs font-semibold text-[#CE0500] bg-[#FFF0F0] border border-[#FCD8D0] px-3 py-1 rounded-full">
                    Frustrant & risqué
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Point 1 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#FAD8D8]/50 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FFF0F0] text-[#CE0500] rounded-xl flex items-center justify-center border border-[#FCD8D0]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Saturation de votre messagerie</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Des dizaines d'e-mails par jour contenant des gigaoctets de PDF non structurés à télécharger manuellement.
                      </p>
                    </div>
                  </div>

                  {/* Point 2 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#FAD8D8]/50 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FFF0F0] text-[#CE0500] rounded-xl flex items-center justify-center border border-[#FCD8D0]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Risque élevé de faux documents</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Impossible de vérifier par vous-même l'authenticité d'un avis d'imposition ou d'un bulletin de paie retouché sur Photoshop.
                      </p>
                    </div>
                  </div>

                  {/* Point 3 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#FAD8D8]/50 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FFF0F0] text-[#CE0500] rounded-xl flex items-center justify-center border border-[#FCD8D0]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Dossiers incomplets & relances</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Des allers-retours interminables par e-mail ou téléphone pour réclamer la pièce d'identité manquante ou le garant.
                      </p>
                    </div>
                  </div>

                  {/* Point 4 */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FFF0F0] text-[#CE0500] rounded-xl flex items-center justify-center border border-[#FCD8D0]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Illégalité RGPD involontaire</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Stocker des copies de cartes d'identité et de pièces d'impôts sur votre ordinateur personnel vous expose à des risques juridiques et de piratage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* The New BailConnect Way */}
            <div className="bg-[#F6FCF8] border-2 border-[#18753C] p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-[#18753C] scale-[1.01]">
              <span className="absolute top-4 right-4 bg-[#18753C] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Le choix de la sérénité
              </span>
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#18753C] uppercase tracking-wider flex items-center gap-2.5">
                    <CheckCircle className="w-6 h-6 text-[#18753C] flex-shrink-0" />
                    Après : La méthode BailConnect
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Point 1 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#D1FAE5]/60 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E6F4EA] text-[#18753C] rounded-xl flex items-center justify-center border border-[#C2E7CD]">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Un seul lien de candidature unique</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Insérez votre lien personnalisé sur LeBonCoin, PAP ou SeLoger. Plus aucun e-mail polluant sur votre boîte personnelle.
                      </p>
                    </div>
                  </div>

                  {/* Point 2 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#D1FAE5]/60 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E6F4EA] text-[#18753C] rounded-xl flex items-center justify-center border border-[#C2E7CD]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Sécurité anti-fraude garantie</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Les candidats postulent en transmettant leur dossier validé et certifié par l'État via DossierFacile. Zéro faux justificatif.
                      </p>
                    </div>
                  </div>

                  {/* Point 3 */}
                  <div className="flex gap-4 items-start pb-6 border-b border-[#D1FAE5]/60 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E6F4EA] text-[#18753C] rounded-xl flex items-center justify-center border border-[#C2E7CD]">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Format 100% standardisé</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Toutes les candidatures s'affichent de façon homogène sur votre tableau de bord (situation, revenus nets, garant, etc.).
                      </p>
                    </div>
                  </div>

                  {/* Point 4 */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E6F4EA] text-[#18753C] rounded-xl flex items-center justify-center border border-[#C2E7CD]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#161616] text-sm md:text-base">Sécurité juridique & conformité RGPD</h4>
                      <p className="text-xs md:text-sm text-[#3A3A3A] mt-1 leading-relaxed">
                        Vous ne stockez aucun fichier sensible sur vos disques. Vous consultez en ligne les pièces sécurisées par la plateforme d'État.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="fonctionnement" className="bg-white border-b border-[#DDDDDD] py-20">
        <div className="max-w-6xl mx-auto rounded-2xl relative overflow-hidden">

          <div className="text-center mb-16 relative z-10">
            {/* Pill Badge matching the screenshot style */}
            <span className="inline-flex items-center justify-center bg-white border border-[#E2E8F0] text-[#666666] text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs mb-4">
              La méthode
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
              Comment fonctionne BailConnect ?
            </h2>
            <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
              Une mise en place ultra-simple en 3 étapes, sans installation de logiciel.
            </p>
          </div>

          {/* Horizontal 3-Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

            {/* Step 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 ">
                <ClipboardCheck className="w-8 h-8 text-republic-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#161616] mb-3">
                1. Générez votre lien
              </h3>
              <p className="text-sm text-[#3A3A3A] leading-relaxed">
                Connectez-vous sur votre espace BailConnect, nommez votre logement (ex: <em>"Studio Lyon 3e"</em>) et obtenez immédiatement votre adresse de candidature publique unique.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 ">
                <Users className="w-8 h-8 text-republic-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#161616] mb-3">
                2. Diffusez le lien
              </h3>
              <p className="text-sm text-[#3A3A3A] leading-relaxed mb-6">
                Copiez le lien et insérez-le directement dans le texte de vos annonces de location (LeBonCoin, PAP, SeLoger, Facebook, etc.).
              </p>
              <div className="bg-[#F8FAFC] p-4 border border-dashed border-[#E2E8F0] rounded-2xl w-full mt-auto">
                <span className="block text-xs font-bold text-[#000091] uppercase tracking-wider mb-2">Exemple de mention :</span>
                <p className="text-[11px] font-mono text-[#3A3A3A] leading-relaxed">
                  "Pour postuler à cet appartement, merci de soumettre votre dossier certifié sur : <strong className="text-[#000091] font-semibold break-all">bailconnect.fr/apply/studio-lyon-3</strong>"
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 ">
                <ShieldCheck className="w-8 h-8 text-republic-blue" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#161616] mb-3">
                3. Sélectionnez sans stress
              </h3>
              <p className="text-sm text-[#3A3A3A] leading-relaxed">
                Les candidats postulent en ligne via le service officiel <strong>DossierFacile</strong>. Leurs informations d'emploi, de revenus et de garants s'affichent de façon homogène sur votre tableau de bord.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center relative z-10">
            <Link href="/dashboard" className="btn-primary text-base px-8 h-12 inline-flex items-center font-bold">
              Essayer gratuitement maintenant
            </Link>
          </div>
        </div>
      </section>
      {/* DossierFacile and State integration section */}
      <section id="dossier-facile" className="bg-[#F5F5FE] border-b border-[#DDDDDD] py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-8 flex flex-col items-start text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] leading-tight mb-4">
              DossierFacile : L'assurance d'un dossier locataire certifié et sécurisé
            </h2>

            <p className="text-sm sm:text-base text-[#3A3A3A] mb-6 leading-relaxed">
              <strong>DossierFacile</strong> est le service public officiel de l'État (Ministère du Logement) destiné à simplifier la recherche de location.
              Des agents de l'État qualifiés ouvrent et vérifient minutieusement chaque pièce justificative déposée par les locataires.
              Ils s'assurent de la validité de l'avis d'impôt en le croisant avec les bases de la DGFIP, vérifient l'identité et valident la cohérence du contrat de travail.
            </p>

            <div className="gov-callout gov-callout-info mb-0 w-full text-sm">
              <h4 className="font-bold text-[#000091] mb-1">Comment BailConnect utilise ce service :</h4>
              <p className="text-xs text-[#3A3A3A] leading-relaxed">
                BailConnect n'est pas un site de stockage de documents d'identité. Notre service extrait de manière sécurisée les indicateurs clefs validés par DossierFacile (nature du contrat de travail, montant des revenus certifiés, garant) et vous fournit le lien officiel de consultation. C'est l'assurance d'une conformité légale totale vis-à-vis du RGPD pour le bailleur.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-center">
            {/* Elegant visual box representing official credentials */}
            <div className="bg-white border border-[#E3E3FD] p-6 w-full max-w-[280px] shadow-sm flex flex-col items-center text-center rounded-2xl">
              <div className="h-14 w-14 rounded-full bg-[#E3E3FD] text-[#000091] flex items-center justify-center font-bold text-xl mb-4">
                DF
              </div>
              <span className="font-bold text-[#161616] text-sm block mb-1">DossierFacile.fr</span>
              <span className="text-xs text-[#666666] block mb-4">Service Public officiel de l'État</span>
              <div className="border-t border-[#E3E3FD] pt-4 w-full text-xs text-[#3A3A3A]">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Avis d'impôt</span>
                  <span className="font-bold text-[#18753C]">Validé ✓</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Bulletins salaire</span>
                  <span className="font-bold text-[#18753C]">Vérifiés ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Justificatif Garant</span>
                  <span className="font-bold text-[#18753C]">Certifié ✓</span>
                </div>
              </div>
              <a
                href="https://www.dossierfacile.logement.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#000091] hover:underline mt-4 block"
              >
                Visiter DossierFacile ↗
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials (Avis de Bailleurs) */}
      {/* <section className="bg-white border-b border-[#DDDDDD] py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="gov-badge mb-3">Témoignages</span>
          <h2 className="text-3xl font-extrabold text-[#161616] mb-4">
            Ils utilisent BailConnect au quotidien
          </h2>
          <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto mb-12">
            Découvrez comment des propriétaires particuliers et agences gagnent un temps précieux sur la gestion de leurs dossiers de location.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

            <div className="bg-[#F6F6F6] p-6 border border-[#DDDDDD] flex flex-col justify-between rounded-2xl">
              <p className="text-sm text-[#3a3a3a] italic leading-relaxed mb-6">
                "J'ai mis mon T2 à Lyon en location sur LeBonCoin. J'ai reçu 62 messages en une seule journée. D'habitude, c'est le cauchemar : trier les emails, demander les fiches de paie oubliées... Avec BailConnect, j'ai simplement mis le lien unique dans l'annonce. Les dossiers complets sont arrivés structurés. J'ai choisi mon locataire en 15 minutes."
              </p>
              <div>
                <span className="font-bold text-sm text-[#161616] block">Pierre-Yves G.</span>
                <span className="text-xs text-[#666666]">Propriétaire de 3 studios à Lyon</span>
              </div>
            </div>

            <div className="bg-[#F6F6F6] p-6 border border-[#DDDDDD] flex flex-col justify-between rounded-2xl">
              <p className="text-sm text-[#3a3a3a] italic leading-relaxed mb-6">
                "Ce qui me rassure le plus, c'est l'aspect anti-fraude. J'avais toujours peur des faux bulletins de salaire, très faciles à fabriquer aujourd'hui. BailConnect s'appuie sur le contrôle officiel des agents de DossierFacile. Quand un profil s'affiche en vert sur mon tableau de bord, je sais que l'impôt et les revenus sont réels."
              </p>
              <div>
                <span className="font-bold text-sm text-[#161616] block">Martine L.</span>
                <span className="text-xs text-[#666666]">Bailleuse particulière à Bordeaux</span>
              </div>
            </div>

            <div className="bg-[#F6F6F6] p-6 border border-[#DDDDDD] flex flex-col justify-between rounded-2xl">
              <p className="text-sm text-[#3a3a3a] italic leading-relaxed mb-6">
                "Je craignais la réaction des locataires face à un lien de candidature. C'est en fait l'inverse : ils apprécient de ne pas envoyer leurs documents sensibles par email. Et comme DossierFacile est le service public de l'État, la confiance est immédiate. C'est simple, transparent et 100% conforme au RGPD."
              </p>
              <div>
                <span className="font-bold text-sm text-[#161616] block">Valentin D.</span>
                <span className="text-xs text-[#666666]">Propriétaire bailleur à Paris 15e</span>
              </div>
            </div>

          </div>
        </div>
      </section> */}

      {/* Pricing Section */}
      <section id="tarifs" className="bg-white border-b border-[#DDDDDD] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center justify-center bg-white border border-[#E2E8F0] text-[#666666] text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs mb-4">
              Tarifs
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
              Des tarifs simples et transparents
            </h2>
            <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
              Choisissez le plan adapté à vos besoins de gestion locative. Sans aucun abonnement caché.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
            {/* Plan 1: Découverte */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <h3 className="text-2xl font-bold text-[#161616] mt-2">Découverte</h3>
                <p className="text-sm text-[#666666] mt-1">Idéal pour tester ou pour un besoin unique très simple.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-[#161616]">0€</span>
                  <span className="text-sm text-[#666666] ml-2">sans engagement</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Jusqu'à <strong>10 candidats</strong> maximum</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Lien de candidature unique</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Accès aux dossiers DossierFacile</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span>Refus manuels uniquement</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span>Pas de relances automatiques</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/dashboard?plan=free" className="btn-secondary w-full text-center py-3 block font-bold rounded-2xl">
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* Plan 2: Pass Annonce (Highlighted) */}
            <div className="bg-white border-2 border-[#000091] rounded-2xl p-8 flex flex-col justify-between shadow-lg relative transform md:-translate-y-4 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#000091] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                Recommandé
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#161616] mt-2">Pass Annonce</h3>
                <p className="text-sm text-[#666666] mt-1">Parfait pour louer rapidement un bien en toute sérénité.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-[#161616]">19€</span>
                  <span className="text-sm text-[#666666] ml-2">/ annonce</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Candidats <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Refus automatisés par SMS</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Planificateur de visites intégré</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>1 lot sous gestion</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/dashboard?plan=pass" className="btn-primary w-full text-center py-3 block font-bold rounded-2xl">
                  Choisir ce plan
                </Link>
              </div>
            </div>

            {/* Plan 3: Abonnement Pro */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <h3 className="text-2xl font-bold text-[#161616] mt-2">Abonnement Pro</h3>
                <p className="text-sm text-[#666666] mt-1">Pour les bailleurs multi-biens et professionnels de l'immobilier.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black text-[#161616]">39€</span>
                  <span className="text-sm text-[#666666] ml-2">/ mois, sans engagement</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Candidats <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Gestion <strong>multi-biens</strong></span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Toutes les fonctionnalités automatisées</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Exports de données (CSV/PDF)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                    <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                    <span>Support dédié et téléphonique</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/dashboard?plan=pro" className="btn-secondary w-full text-center py-3 block font-bold rounded-2xl">
                  Essayer Pro gratuitement
                </Link>
              </div>
            </div>
          </div>

          {/* Co-branding security trust badge */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#F5F5FE] border border-[#E3E3FD] px-6 py-3 rounded-full text-xs text-[#3A3A3A]">
              <span className="flex items-center gap-1.5 font-bold text-[#000091]">
                <ShieldCheck className="w-4 h-4 text-[#000091]" />
                Sécurité & Confidentialité :
              </span>
              <span>Zéro stockage de documents confidentiels. Intégration 100% sécurisée avec les standards DossierFacile.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#F6F6F6] border-b border-[#DDDDDD] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="gov-badge mb-3">FAQ</span>
            <h2 className="text-3xl font-extrabold text-[#161616] mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-base text-[#3A3A3A]">
              Toutes les réponses à vos questions sur l'utilisation de la plateforme.
            </p>
          </div>

          <div className="space-y-4">

            <details className="group bg-white p-6 border border-[#DDDDDD] rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-[#161616] cursor-pointer">
                <span>Est-ce que BailConnect est payant pour les propriétaires ?</span>
                <span className="transition group-open:rotate-180 text-[#000091]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="mt-4 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                Non, BailConnect est 100% gratuit pour les propriétaires bailleurs. Vous pouvez générer autant de liens de candidature que vous le souhaitez, pour un nombre illimité de logements.
              </div>
            </details>

            <details className="group bg-white p-6 border border-[#DDDDDD] rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-[#161616] cursor-pointer">
                <span>Comment l'État certifie-t-il les justificatifs des locataires ?</span>
                <span className="transition group-open:rotate-180 text-[#000091]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="mt-4 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                BailConnect s'appuie sur <strong>DossierFacile</strong>, la plateforme publique officielle de l'État français. Lorsqu'un candidat soumet son dossier, des opérateurs de l'État analysent chaque document (carte d'identité, justificatif de domicile, contrat de travail, 3 derniers bulletins de salaire, dernier avis d'imposition). Ils vérifient directement auprès de l'administration fiscale la véracité des montants déclarés afin d'assurer l'absence totale de falsification.
              </div>
            </details>

            <details className="group bg-white p-6 border border-[#DDDDDD] rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-[#161616] cursor-pointer">
                <span>Le locataire est-il obligé de créer un compte DossierFacile ?</span>
                <span className="transition group-open:rotate-180 text-[#000091]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="mt-4 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                Oui. DossierFacile est le standard recommandé par les autorités publiques pour protéger la vie privée des locataires et sécuriser les pièces d'identité contre l'usurpation (ajout de filigranes obligatoires sur les pièces). La création de compte est gratuite pour le locataire et lui servira pour toutes ses visites de logements.
              </div>
            </details>

            <details className="group bg-white p-6 border border-[#DDDDDD] rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-[#161616] cursor-pointer">
                <span>Comment respecte-t-on le RGPD avec BailConnect ?</span>
                <span className="transition group-open:rotate-180 text-[#000091]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="mt-4 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                Le RGPD interdit de conserver indéfiniment et sans sécurité forte des documents personnels hautement sensibles (cartes d'identité, RIB, impôts). Avec BailConnect, <strong>aucun document n'est enregistré sur nos serveurs ni sur votre ordinateur</strong>. Les documents physiques restent hébergés dans l'infrastructure hautement sécurisée de l'État (DossierFacile). Vous ne consultez les dossiers qu'en ligne, via des liens sécurisés temporaires.
              </div>
            </details>

            <details className="group bg-white p-6 border border-[#DDDDDD] rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-[#161616] cursor-pointer">
                <span>Puis-je utiliser BailConnect avec n'importe quel site d'annonces ?</span>
                <span className="transition group-open:rotate-180 text-[#000091]">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <div className="mt-4 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                Oui. Il vous suffit de copier-coller le lien public généré par BailConnect dans la description de vos annonces sur Leboncoin, PAP, SeLoger, Facebook Marketplace, GensdeConfiance, ou par e-mail direct. Les candidats cliquent simplement sur le lien pour soumettre leur candidature.
              </div>
            </details>

          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[#000091] text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-6">
            Reprenez le contrôle de vos locations dès aujourd'hui
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Créez votre première annonce en moins d'une minute, générez votre lien unique et commencez à recevoir des candidatures structurées et validées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="bg-white text-[#000091] hover:bg-[#F5F5FE] text-base px-8 h-12 flex items-center justify-center font-bold rounded-2xl transition-colors">
              Commencer gratuitement
            </Link>
            <a
              href="https://www.dossierfacile.logement.gouv.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline text-sm font-medium px-4 py-2"
            >
              Découvrir DossierFacile ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F6F6F6] border-t border-[#DDDDDD] py-12 px-6 text-center text-xs text-[#666666]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#000091] text-white flex items-center justify-center font-bold text-xs select-none rounded-2xl">
              BC
            </div>
            <span className="font-bold text-[#161616] text-sm">BailConnect</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#comparatif" className="hover:underline">Pourquoi BailConnect</a>
            <a href="#fonctionnement" className="hover:underline">Comment ça marche</a>
            <a href="#dossier-facile" className="hover:underline">DossierFacile</a>
            <a href="#tarifs" className="hover:underline">Tarifs</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <Link href="/dashboard" className="hover:underline font-semibold text-[#000091]">Espace Propriétaire</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-[#DDDDDD] mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#666666] text-left max-w-xl">
            BailConnect est une solution indépendante s'appuyant sur l'API DossierFacile. Les marques DossierFacile, Leboncoin, PAP, SeLoger et autres citées appartiennent à leurs propriétaires respectifs.
          </p>
          <p>© 2026 BailConnect. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
