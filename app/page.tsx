"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Check, CheckCircle, ClipboardCheck, Users, ChevronDown, X, Clock, LayoutDashboard, Lock, Calendar, PhoneOff } from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Est-ce que BailConnect est payant pour les propriétaires ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "BailConnect propose une formule Découverte entièrement gratuite (jusqu\u2019à 10 candidats par annonce), idéale pour tester l\u2019outil. Si vos besoins évoluent, choisissez notre Pass Annonce à 19\u20ac par annonce ou l\u2019Abonnement Pro à 49\u20ac/mois sans engagement."
        }
      },
      {
        "@type": "Question",
        "name": "Comment l\u2019État certifie-t-il les justificatifs des locataires ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "BailConnect s\u2019appuie sur DossierFacile, la plateforme publique officielle de l\u2019État français. Des opérateurs de l\u2019État analysent chaque document (carte d\u2019identité, contrat de travail, bulletins de salaire, avis d\u2019imposition) et vérifient les montants directement auprès de la DGFIP."
        }
      },
      {
        "@type": "Question",
        "name": "Le locataire est-il obligé de créer un compte DossierFacile ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui. DossierFacile est le standard recommandé par les autorités publiques pour protéger la vie privée des locataires. La création de compte est gratuite pour le locataire et lui servira pour toutes ses visites de logements."
        }
      },
      {
        "@type": "Question",
        "name": "Comment respecte-t-on le RGPD avec BailConnect ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Avec BailConnect, aucun document n\u2019est enregistré sur nos serveurs ni sur votre ordinateur. Les documents restent hébergés dans l\u2019infrastructure de l\u2019État (DossierFacile). Vous consultez les dossiers en ligne via des liens sécurisés temporaires."
        }
      },
      {
        "@type": "Question",
        "name": "Puis-je utiliser BailConnect avec n\u2019importe quel site d\u2019annonces ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui. Copiez-collez le lien généré par BailConnect dans vos annonces sur Leboncoin, PAP, SeLoger, Facebook Marketplace ou tout autre support. Les candidats cliquent sur le lien et soumettent leur dossier certifié en quelques minutes."
        }
      },
      {
        "@type": "Question",
        "name": "Comment éviter de recevoir des appels téléphoniques à toute heure de la part des locataires ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Avec BailConnect, vous n\u2019avez plus besoin d\u2019afficher votre numéro de téléphone sur Leboncoin ou SeLoger. Les candidats postulent via votre lien de candidature unique, vous évitant le harcèlement téléphonique et les spams."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BailConnect",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "BailConnect est un outil en ligne qui permet aux bailleurs de collecter, centraliser et comparer des candidatures locataires vérifiées par DossierFacile, sans email ni PDF en vrac.",
    "url": "https://bailconnect.fr",
    "offers": [
      {
        "@type": "Offer",
        "name": "Découverte",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Jusqu\u2019à 10 candidats, lien de candidature unique, accès DossierFacile"
      },
      {
        "@type": "Offer",
        "name": "Pass Annonce",
        "price": "19",
        "priceCurrency": "EUR",
        "description": "Candidats illimités, refus automatiques par SMS, planificateur de visites"
      },
      {
        "@type": "Offer",
        "name": "Abonnement Pro",
        "price": "49",
        "priceCurrency": "EUR",
        "description": "Gestion multi-biens, toutes fonctionnalités automatisées, exports CSV/PDF"
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Comment centraliser les candidatures locataires avec BailConnect",
    "description": "Collectez et triez les dossiers DossierFacile de vos candidats locataires en 3 étapes simples.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Générez votre lien de candidature",
        "text": "Connectez-vous sur votre espace BailConnect, nommez votre logement et obtenez immédiatement votre lien de candidature unique."
      },
      {
        "@type": "HowToStep",
        "name": "Diffusez le lien dans vos annonces",
        "text": "Copiez le lien et insérez-le dans vos annonces sur Leboncoin, PAP, SeLoger ou tout autre site. Les candidats postulent directement en ligne."
      },
      {
        "@type": "HowToStep",
        "name": "Sélectionnez sans stress",
        "text": "Comparez tous les dossiers certifiés par DossierFacile sur un tableau de bord standardisé : revenus, contrat, garant — en 10 minutes."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Hero Section */}
        <section
          className="bg-cover bg-center border-b border-[#DDDDDD] h-dvh flex items-center relative"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.45)), url('/assets/hero-bg.png')"
          }}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-0 w-full">
            <div className="flex flex-col items-center text-center">
              <span className="gov-badge mb-4 animate-fade-in-up">Solution Bailleurs • Version Gratuite Disponible</span>
              <h1 className="text-4xl sm:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100">
                Gérez les candidatures locataires DossierFacile en 10 minutes chrono
              </h1>
              <p className="text-lg text-white mb-8 leading-relaxed max-w-3xl animate-fade-in-up animation-delay-200">
                Dites adieu aux e-mails en vrac, les faux documents et les <strong>appels téléphoniques incessants à toute heure</strong>.
                Protégez vos coordonnées sur Leboncoin et SeLoger : insérez simplement votre lien de candidature unique et recevez des dossiers certifiés et <strong>pré-vérifiés par l'État via DossierFacile</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up animation-delay-300">
                <Link href="/dashboard" className="btn-primary text-base px-8 h-12 flex items-center justify-center font-bold transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]">
                  Commencez gratuitement
                </Link>
                <a
                  href="#fonctionnement"
                  className="btn-secondary !bg-white text-base px-8 h-12 flex items-center justify-center font-semibold transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Découvrir la méthode ↗
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-white/90 drop-shadow-sm animate-fade-in-up animation-delay-400">
                <ShieldCheck className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                <span>Conforme RGPD : aucun stockage local de documents d'identité</span>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="bg-white border-b border-[#DDDDDD] py-12 max-w-6xl mx-auto px-6 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4 reveal">
              <h4 className="text-4xl sm:text-5xl font-black text-[#000091] mb-2">10 minutes</h4>
              <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">De tri par annonce</p>
              <p className="text-sm text-[#3A3A3A]">
                Visualisez toutes les candidatures sur une page claire au lieu de passer des heures à ouvrir des e-mails.
              </p>
            </div>
            <div className="p-4 border-t md:border-t-0 md:border-x border-[#DDDDDD] reveal reveal-delay-100">
              <h4 className="text-4xl sm:text-5xl font-black text-[#18753C] mb-2">0% de Fraude</h4>
              <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">Documents vérifiés par l’État</p>
              <p className="text-sm text-[#3A3A3A]">
                Tous les documents (avis d’impôt, bulletins de salaire, identité) sont certifiés par les agents officiels DossierFacile.
              </p>
            </div>
            <div className="p-4 border-t md:border-t-0 border-[#DDDDDD] reveal reveal-delay-200">
              <h4 className="text-4xl sm:text-5xl font-black text-[#FF6B4A] mb-2">Accès Libre</h4>
              <p className="text-sm font-bold text-[#161616] uppercase tracking-wider mb-2">Formule gratuite disponible</p>
              <p className="text-sm text-[#3A3A3A]">
                Commencez sans frais. Testez l'outil pour vos premiers candidats sans aucune carte bancaire requise.
              </p>
            </div>
          </div>
          {/* Bloc définition extractable — optimisé pour les AI Overviews */}
          <p className="text-sm text-[#666666] italic leading-relaxed text-center pt-8 reveal reveal-delay-300">
            <strong className="text-[#161616] not-italic">BailConnect</strong> est un outil en ligne qui permet aux bailleurs de collecter, centraliser et comparer des candidatures locataires vérifiées par DossierFacile — sans email, sans PDF en vrac, sans perte de temps.
          </p>
        </section>

        {/* Pain Points vs. Solution (Avant / Après) */}
        <section id="comparatif" className="bg-[#F6F6F6] border-b border-[#DDDDDD] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 reveal">
              <span className="gov-badge mb-3">La comparaison</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
                Arretez de passer vos soirées à trier des dossiers de locataires
              </h2>
              <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
                Découvrez comment notre solution élimine les complexités du tri manuel pour vous faire gagner un temps précieux et sécuriser vos locations.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Card 1: Time Savings (Large) */}
              <div className="md:col-span-2 bg-[#F6FCF8] border-2 border-[#18753C] p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-[#18753C] reveal reveal-delay-100">
                <div>
                  <div className="w-12 h-12 bg-[#E6F4EA] text-[#18753C] rounded-2xl flex items-center justify-center border border-[#C2E7CD] mb-6">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#161616] mb-3">
                    Gagnez 8 heures par annonce et libérez vos soirées
                  </h3>
                  <p className="text-sm md:text-base text-[#3A3A3A] leading-relaxed max-w-2xl">
                    Fini de passer vos soirées à télécharger, classer et renommer des dizaines de PDF mal organisés reçus par e-mail. Diffusez votre lien de candidature unique sur LeBonCoin, PAP ou SeLoger : vos candidats complètent un formulaire fluide et tout est trié et centralisé automatiquement.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="text-xs font-semibold text-[#18753C] bg-[#E6F4EA] px-3 py-1.5 rounded-full border border-[#C2E7CD]">
                    ⚡ Temps de tri divisé par 10 <span className="font-normal opacity-70">(selon nos utilisateurs)</span>
                  </span>
                  <span className="text-xs font-semibold text-[#18753C] bg-[#E6F4EA] px-3 py-1.5 rounded-full border border-[#C2E7CD]">
                    📥 Centralisation automatique des dossiers
                  </span>
                </div>
              </div>

              {/* Card 2: Anti-Fraude (Medium) */}
              <div className="md:col-span-1 bg-white border border-[#DDDDDD] p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal reveal-delay-200">
                <div>
                  <div className="w-12 h-12 bg-[#E6F4EA] text-[#18753C] rounded-2xl flex items-center justify-center border border-[#C2E7CD] mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#161616] mb-3">
                    Sécurité anti-fraude et zéro faux
                  </h3>
                  <p className="text-xs md:text-sm text-[#3A3A3A] leading-relaxed">
                    Les candidats soumettent leur dossier d'un clic avec la certification officielle de l'État via DossierFacile. Vous évitez les vérifications manuelles complexes et les justificatifs retouchés.
                  </p>
                </div>
                <div className="mt-6 text-xs text-[#666666] font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#18753C]" /> Dossiers vérifiés officiellement
                </div>
              </div>

              {/* Card 3: Protection coordonnées / Téléphone (Medium) */}
              <div className="md:col-span-1 bg-white border border-[#DDDDDD] p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal reveal-delay-100">
                <div>
                  <div className="w-12 h-12 bg-[#FFE9E6] text-[#FF4D3A] rounded-2xl flex items-center justify-center border border-[#FFD2CC] mb-6">
                    <PhoneOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#161616] mb-3">
                    Zéro harcèlement téléphonique
                  </h3>
                  <p className="text-xs md:text-sm text-[#3A3A3A] leading-relaxed">
                    Plus besoin de publier votre numéro de téléphone sur Leboncoin ou SeLoger. Évitez les appels intempestifs et le spam à toute heure. Masquez vos coordonnées en toute sérénité.
                  </p>
                </div>
                <div className="mt-6 text-xs text-[#FF4D3A] font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#FF4D3A]" /> Tranquillité d'esprit garantie
                </div>
              </div>

              {/* Card 4: RGPD (Large) */}
              <div className="md:col-span-2 bg-[#F5F5FE] border border-[#E2E8F0] p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal reveal-delay-200">
                <div>
                  <div className="w-12 h-12 bg-[#E3E3FD] text-[#000091] rounded-2xl flex items-center justify-center border border-[#CBCBFC] mb-6">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#161616] mb-3">
                    Zéro fichier stocké, 100% conforme RGPD
                  </h3>
                  <p className="text-sm md:text-base text-[#3A3A3A] leading-relaxed max-w-2xl">
                    Consultez les pièces d'identité et justificatifs de revenus en ligne en toute sécurité sans encombrer ni exposer votre propre ordinateur. Éliminez les risques de piratage de données sensibles.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="text-xs font-semibold text-[#000091] bg-[#E3E3FD] px-3 py-1.5 rounded-full border border-[#CBCBFC]">
                    🔒 Hébergement sécurisé
                  </span>
                  <span className="text-xs font-semibold text-[#000091] bg-[#E3E3FD] px-3 py-1.5 rounded-full border border-[#CBCBFC]">
                    🇪🇺 Respect de la vie privée
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="fonctionnement" className="bg-white border-b border-[#DDDDDD] py-20">
          <div className="max-w-6xl mx-auto rounded-2xl relative overflow-hidden">

            <div className="text-center mb-16 relative z-10 reveal">
              {/* Pill Badge matching the screenshot style */}
              <span className="inline-flex items-center justify-center bg-white border border-[#E2E8F0] text-[#666666] text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs mb-4">
                La méthode
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
                Comment centraliser et organiser vos visites en 4 étapes
              </h2>
              <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
                Une gestion complète de vos locations, <br />du dépôt de dossier jusqu'au rendez-vous de visite.
              </p>
            </div>

            {/* Horizontal 4-Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 px-6 md:px-0">

              {/* Step 1 */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 hover:border-[#CBCBFC] transition-all duration-300 group reveal">
                <div className="h-14 w-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <ClipboardCheck className="w-7 h-7 text-republic-blue" />
                </div>
                <h3 className="text-base font-bold text-[#161616] mb-3">
                  1. Génerez votre lien
                </h3>
                <p className="text-xs text-[#3A3A3A] leading-relaxed">
                  Connectez-vous sur votre espace, nommez votre logement (ex: <em>"Studio Lyon 3e"</em>) et obtenez votre lien unique de candidature.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 hover:border-[#CBCBFC] transition-all duration-300 group reveal reveal-delay-100">
                <div className="h-14 w-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-7 h-7 text-republic-blue" />
                </div>
                <h3 className="text-base font-bold text-[#161616] mb-3">
                  2. Diffusez le lien
                </h3>
                <p className="text-xs text-[#3A3A3A] leading-relaxed mb-4">
                  Copiez-collez le lien directement dans la description de vos annonces (Leboncoin, PAP, SeLoger, etc.).
                </p>
                <div className="bg-[#F8FAFC] p-3 border border-dashed border-[#E2E8F0] rounded-2xl w-full mt-auto">
                  <span className="block text-[10px] font-bold text-[#000091] uppercase tracking-wider mb-1">Exemple :</span>
                  <p className="text-[10px] font-mono text-[#3A3A3A] leading-normal break-all">
                    "Postulez sur :<br /> <strong className="text-[#000091] font-semibold">bailconnect.fr/apply/studio-lyon-3</strong>"
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 hover:border-[#CBCBFC] transition-all duration-300 group reveal reveal-delay-200">
                <div className="h-14 w-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-republic-blue" />
                </div>
                <h3 className="text-base font-bold text-[#161616] mb-3">
                  3. Comparez sans stress
                </h3>
                <p className="text-xs text-[#3A3A3A] leading-relaxed">
                  Les dossiers de vos candidats, pré-vérifiés officiellement par l'État via <strong>DossierFacile</strong>, s'affichent proprement sur votre tableau de bord.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 hover:border-[#CBCBFC] transition-all duration-300 group reveal reveal-delay-300">
                <div className="h-14 w-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-republic-blue" />
                </div>
                <h3 className="text-base font-bold text-[#161616] mb-3">
                  4. Planifiez les visites
                </h3>
                <p className="text-xs text-[#3A3A3A] leading-relaxed">
                  Invitez d'un clic les candidats retenus à réserver leur créneau sur votre calendrier. Les rappels sont gérés automatiquement.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center relative z-10 reveal reveal-delay-300">
              <Link href="/dashboard" className="btn-primary text-base px-8 h-12 inline-flex items-center font-bold transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]">
                Essayer gratuitement maintenant
              </Link>
            </div>
          </div>
        </section>
        {/* DossierFacile and State integration section */}
        <section id="dossier-facile" className="bg-[#F5F5FE] border-b border-[#DDDDDD] py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            <div className="md:col-span-8 flex flex-col items-start text-left reveal">
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
              <div className="bg-white border border-[#E3E3FD] p-6 w-full max-w-[280px] shadow-sm flex flex-col items-center text-center rounded-2xl reveal reveal-delay-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            <div className="text-center mb-16 reveal">
              <span className="inline-flex items-center justify-center bg-white border border-[#E2E8F0] text-[#666666] text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs mb-4">
                Tarifs
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#161616] mb-4 tracking-tight">
                Tarifs BailConnect : trier vos dossiers locataires à partir de 0€
              </h2>
              <p className="text-base text-[#3A3A3A] max-w-2xl mx-auto">
                Choisissez le plan adapté à vos besoins de gestion locative. Sans aucun abonnement caché.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
              {/* Plan 1: Découverte */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal">
                <div>
                  <h3 className="text-2xl font-bold text-[#161616] mt-2">Découverte</h3>
                  <p className="text-sm text-[#666666] mt-1">Idéal pour tester ou pour un besoin unique très simple.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-[#161616]">GRATUIT</span>
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
                      <span>Limité à 1 annonce gratuite</span>
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
              <div className="bg-white border-2 border-[#000091] rounded-2xl p-8 flex flex-col justify-between shadow-lg relative transform md:-translate-y-4 hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-5 transition-all duration-300 reveal reveal-delay-100">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#000091] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                  Populaire
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
                      <span>Lien de candidature unique</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                      <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                      <span>Notifications candidats automatisées</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                      <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                      <span>Planificateur de visites intégré</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/dashboard?plan=pass" className="btn-primary w-full text-center py-3 block font-bold rounded-2xl">
                    Créer mon annonce
                  </Link>
                </div>
              </div>

              {/* Plan 3: Abonnement Pro */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal reveal-delay-200">
                <div>
                  <h3 className="text-2xl font-bold text-[#161616] mt-2">Abonnement Pro</h3>
                  <p className="text-sm text-[#666666] mt-1">Pour les bailleurs multi-biens et / ou professionnels de l'immobilier.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-[#161616]">49€</span>
                    <span className="text-sm text-[#666666] ml-2">/ mois, sans engagement</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start gap-3 text-sm text-[#3A3A3A]">
                      <Check className="w-5 h-5 text-[#18753C] flex-shrink-0" />
                      <span>Toutes les annonces bénéficient automatiquement du Pass Annonce</span>
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
                      <span>Import LeBonCoin / SeLoger</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/dashboard?plan=pro" className="btn-secondary w-full text-center py-3 block font-bold rounded-2xl">
                    Choisir l’Abonnement Pro
                  </Link>
                </div>
              </div>
            </div>

            {/* Co-branding security trust badge */}
            <div className="text-center reveal reveal-delay-300">
              <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#F5F5FE] border border-[#E3E3FD] px-6 py-3 rounded-full text-xs text-[#3A3A3A] hover:border-[#CBCBFC] transition-colors duration-300">
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
            <div className="text-center mb-12 reveal">
              <span className="gov-badge mb-3">FAQ</span>
              <h2 className="text-3xl font-extrabold text-[#161616] mb-4">
                FAQ — Gestion des candidatures locataires avec BailConnect
              </h2>
              <p className="text-base text-[#3A3A3A]">
                Toutes les réponses à vos questions sur l'utilisation de la plateforme.
              </p>
            </div>

            <div className="space-y-4">

              {/* FAQ 1 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Est-ce que BailConnect est payant pour les propriétaires ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 0 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 0 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      BailConnect propose une formule Découverte entièrement gratuite (jusqu'à 10 candidats par annonce), idéale pour tester l'outil ou pour un besoin unique. Si vos besoins évoluent, vous pouvez choisir notre Pass Annonce ou notre formule Pro.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal reveal-delay-100">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Comment l'État certifie-t-il les justificatifs des locataires ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 1 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 1 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      BailConnect s'appuie sur <strong>DossierFacile</strong>, la plateforme publique officielle de l'État français. Lorsqu'un candidat soumet son dossier, des opérateurs de l'État analysent chaque document (carte d'identité, justificatif de domicile, contrat de travail, 3 derniers bulletins de salaire, dernier avis d'imposition). Ils vérifient directement auprès de l'administration fiscale la véracité des montants déclarés afin d'assurer l'absence totale de falsification.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal reveal-delay-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Le locataire est-il obligé de créer un compte DossierFacile ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 2 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 2 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      Oui. DossierFacile est le standard recommandé par les autorités publiques pour protéger la vie privée des locataires et sécuriser les pièces d'identité contre l'usurpation (ajout de filigranes obligatoires sur les pièces). La création de compte est gratuite pour le locataire et lui servira pour toutes ses visites de logements.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal reveal-delay-300">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Comment respecte-t-on le RGPD avec BailConnect ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 3 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 3 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      Le RGPD interdit de conserver indéfiniment et sans sécurité forte des documents personnels hautement sensibles (cartes d'identité, RIB, impôts). Avec BailConnect, <strong>aucun document n'est enregistré sur nos serveurs ni sur votre ordinateur</strong>. Les documents physiques restent hébergés dans l'infrastructure hautement sécurisée de l'État (DossierFacile). Vous ne consultez les dossiers qu'en ligne, via des liens sécurisés temporaires.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 5 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal reveal-delay-400">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Puis-je utiliser BailConnect avec n'importe quel site d'annonces ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 4 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 4 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      Oui. Il vous suffit de copier-coller le lien public généré par BailConnect dans la description de vos annonces sur Leboncoin, PAP, SeLoger, Facebook Marketplace, GensdeConfiance, ou par e-mail direct. Les candidats cliquent simplement sur le lien pour soumettre leur candidature.
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ 6 */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl hover:border-[#CBCBFC] hover:shadow-sm transition-all duration-300 reveal reveal-delay-500">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                  className="flex items-center justify-between w-full p-6 font-bold text-[#161616] text-left cursor-pointer focus:outline-none"
                >
                  <span>Comment éviter de recevoir des appels téléphoniques à toute heure ?</span>
                  <span className={`transition-transform duration-500 text-[#000091] ${openFaq === 5 ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${openFaq === 5 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-sm text-[#3A3A3A] leading-relaxed border-t border-gray-100 pt-4">
                      En utilisant BailConnect, vous pouvez masquer ou ne pas publier votre numéro de téléphone sur Leboncoin ou SeLoger. Les candidats postulent via votre lien de candidature unique, ce qui bloque le harcèlement téléphonique et les spams à toute heure du jour et de la nuit.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="bg-[#000091] text-white py-16 px-6 text-center reveal">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-6">
              Reprenez le contrôle de vos locations dès aujourd'hui
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Créez votre première annonce en moins d'une minute, générez votre lien unique et commencez à recevoir des candidatures structurées et validées.
            </p>
            <div className="flex justify-center items-center">
              <Link href="/dashboard" className="bg-white text-[#000091] hover:bg-[#F5F5FE] text-base px-8 h-12 flex items-center justify-center font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]">
                Commencer gratuitement
              </Link>
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
            <div className="flex flex-col md:items-end gap-2 text-right">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#666666] justify-center md:justify-end">
                <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
                <span>•</span>
                <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
                <span>•</span>
                <Link href="/cgv" className="hover:underline">CGV</Link>
                <span>•</span>
                <Link href="/cgu" className="hover:underline">CGU</Link>
              </div>
              <p className="text-xs text-[#666666] text-center md:text-right">© 2026 BailConnect. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
