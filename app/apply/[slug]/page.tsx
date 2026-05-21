"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ApplyPage() {
  const params = useParams();
  const slug = params.slug as string | undefined;

  const campaign = useQuery(api.campaigns.getBySlug, slug ? { slug } : "skip");
  const submitApplication = useMutation(api.candidates.create);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [jobStatus, setJobStatus] = useState("CDI");
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [dossierFacileUrl, setDossierFacileUrl] = useState("");

  // Stepper states
  const [currentStep, setCurrentStep] = useState(1);

  // Status states
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignedTrigram, setAssignedTrigram] = useState("");

  const validateStep1 = (): boolean => {
    setError(null);
    if (!firstName.trim()) {
      setError("Veuillez saisir votre prénom.");
      return false;
    }
    if (!lastName.trim()) {
      setError("Veuillez saisir votre nom.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez saisir une adresse email valide.");
      return false;
    }
    if (!phone.trim()) {
      setError("Veuillez saisir votre numéro de téléphone.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError(null);
    const incomeNumber = parseFloat(monthlyIncome);
    if (isNaN(incomeNumber) || incomeNumber < 0) {
      setError("Veuillez saisir un revenu mensuel valide (supérieur ou égal à 0).");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate step 1 & 2 first just in case
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setLoading(true);

    // Double check DossierFacile URL format client-side
    const cleanUrl = dossierFacileUrl.trim();
    const dossierFacileRegex = /^https:\/\/[a-z0-9.-]*dossierfacile\.(logement\.gouv\.fr|fr)\/(file|pf)\/[a-zA-Z0-9-]+$/i;
    if (!dossierFacileRegex.test(cleanUrl)) {
      setError(
        "L'URL DossierFacile est invalide. Exemple de format attendu : https://locataire.dossierfacile.logement.gouv.fr/file/votre-identifiant"
      );
      setLoading(false);
      return;
    }

    // Auto-generate name trigram (First letter of First Name + First two letters of Last Name)
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const firstLetter = cleanFirstName.substring(0, 1);
    const lastLetters = cleanLastName.replace(/[^a-zA-Z]/g, "").substring(0, 2);
    const trigram = `${firstLetter}${lastLetters}`.toUpperCase().padEnd(3, "X");

    try {
      if (!campaign?._id) {
        throw new Error("Campagne invalide.");
      }

      await submitApplication({
        campaignId: campaign._id,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: email.trim(),
        phone: phone.trim(),
        monthlyIncome: parseFloat(monthlyIncome),
        jobStatus,
        hasGuarantor,
        dossierFacileUrl: cleanUrl,
        nameTrigram: trigram,
      });

      setAssignedTrigram(trigram);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Une erreur est survenue lors de la soumission de votre dossier."
      );
    } finally {
      setLoading(false);
    }
  };

  if (campaign === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de la page de candidature...</span>
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F6F6F6] px-6">
        <div className="gov-card max-w-md text-center">
          <div className="gov-card-header text-red-600 border-red-600">Offre introuvable</div>
          <div className="gov-card-body">
            <p className="mb-4">Cette annonce de logement n'existe plus ou l'adresse URL est incorrecte.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F6F6F6] px-6">
        <div className="gov-card max-w-lg w-full">
          <div className="gov-card-header text-[#18753C] border-[#18753C]">Candidature soumise avec succès !</div>
          <div className="gov-card-body space-y-4">
            <div className="gov-callout gov-callout-info">
              <p className="text-sm">
                Votre dossier a bien été transmis au propriétaire du logement : <strong>{campaign.title}</strong>.
              </p>
            </div>

            <p className="text-sm text-[#3A3A3A]">
              Pour protéger votre identité sur le tableau de bord du bailleur, votre dossier est associé au trigramme unique :
            </p>

            <div className="bg-[#F5F5FE] p-4 text-center border border-[#E3E3FD]">
              <span className="text-3xl font-mono font-bold text-[#000091] tracking-widest">
                {assignedTrigram}
              </span>
            </div>

            <p className="text-xs text-[#666666]">
              Le propriétaire pourra valider vos pièces directement sur la plateforme officielle <strong>DossierFacile</strong> à l'aide de votre lien sécurisé. Vous serez contacté par email si votre dossier est retenu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm select-none">
            BC
          </div>
          <span className="font-bold text-[#161616] text-base">BailConnect</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="gov-badge mb-2">Candidature locataire</span>
          <h1 className="text-2xl font-bold text-[#161616]">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-[#666666] mt-2 bg-white p-4 border border-[#DDDDDD] whitespace-pre-line">
              {campaign.description}
            </p>
          )}
        </div>

        <div className="gov-card">
          <div className="gov-card-header">Formulaire de candidature</div>
          <div className="gov-card-body">
            {/* Stepper progress indicator */}
            <div className="mb-8 select-none">
              <div className="flex justify-between items-center text-xs font-semibold text-[#666666] mb-3">
                <span>Étape {currentStep} sur 3</span>
                <span className="text-[#000091]">
                  {currentStep === 1 && "Identité & Contact"}
                  {currentStep === 2 && "Situation & Revenus"}
                  {currentStep === 3 && "Dossier & Validation"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-2 transition-all duration-300 ${currentStep >= 1 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 2 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 3 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
              </div>
              {currentStep < 3 && (
                <p className="text-[11px] text-[#666666] mt-2 italic text-right">
                  Suivant : {currentStep === 1 ? "Situation & Revenus" : "Dossier & Validation"}
                </p>
              )}
            </div>

            {error && (
              <div className="gov-callout gov-callout-warning mb-6 text-sm">
                <strong>Veuillez corriger les erreurs suivantes :</strong>
                <p className="mt-1">{error}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === 1) {
                  handleNext();
                } else if (currentStep === 2) {
                  handleNext();
                } else if (currentStep === 3) {
                  handleSubmit(e);
                }
              }}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstname" className="form-label">
                        Prénom *
                      </label>
                      <input
                        id="firstname"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="form-input"
                        placeholder="ex: Jean"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastname" className="form-label">
                        Nom *
                      </label>
                      <input
                        id="lastname"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-input"
                        placeholder="ex: Dupont"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="form-label">
                        Adresse email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="ex: jean.dupont@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="form-label">
                        Téléphone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                        placeholder="ex: 0612345678"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#DDDDDD] flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary w-full sm:w-auto"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="jobstatus" className="form-label">
                        Situation professionnelle *
                      </label>
                      <select
                        id="jobstatus"
                        value={jobStatus}
                        onChange={(e) => setJobStatus(e.target.value)}
                        className="form-input"
                      >
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Student">Étudiant</option>
                        <option value="Freelance">Indépendant / Freelance</option>
                        <option value="Functionary">Fonctionnaire</option>
                        <option value="Other">Autre situation</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="income" className="form-label">
                        Revenus mensuels nets (€) *
                      </label>
                      <input
                        id="income"
                        type="number"
                        required
                        min="0"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="form-input"
                        placeholder="ex: 2100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasGuarantor}
                        onChange={(e) => setHasGuarantor(e.target.checked)}
                        className="h-5 w-5 accent-[#000091] border border-[#DDDDDD] rounded-[2px]"
                      />
                      <span className="text-sm text-[#161616] font-medium">
                        Je dispose d'un garant physique ou d'une garantie (ex: Visale)
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-[#DDDDDD] flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="btn-secondary"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary animate-none"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="gov-callout gov-callout-info mb-6 text-xs">
                    <strong>Zéro document hébergé :</strong> Pour votre sécurité et conformément au RGPD, nous ne stockons aucun justificatif PDF. Fournissez simplement votre lien public <strong>DossierFacile</strong> validé par l'État.
                  </div>

                  <div>
                    <label htmlFor="dossierfacile" className="form-label">
                      Lien public de partage DossierFacile *
                    </label>
                    <input
                      id="dossierfacile"
                      type="url"
                      required
                      value={dossierFacileUrl}
                      onChange={(e) => setDossierFacileUrl(e.target.value)}
                      className="form-input"
                      placeholder="https://locataire.dossierfacile.logement.gouv.fr/file/..."
                    />
                    <span className="text-xs text-[#666666] mt-2 block leading-relaxed">
                      Le dépôt de dossier sur DossierFacile (service public gratuit) est requis. Obtenez votre lien de partage sécurisé dans votre espace locataire DossierFacile.
                    </span>
                  </div>

                  {/* Recap Box */}
                  <div className="border border-[#E3E3FD] bg-[#F5F5FE] p-5">
                    <h3 className="text-sm font-bold text-[#000091] mb-3 uppercase tracking-wider border-b border-[#E3E3FD] pb-2">
                      Récapitulatif de votre dossier
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#3A3A3A]">
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Identité :</dt>
                        <dd className="font-medium text-[#161616]">{firstName} {lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Contact :</dt>
                        <dd className="font-medium text-[#161616]">{phone} • {email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Situation professionnelle :</dt>
                        <dd className="font-medium text-[#161616]">
                          {jobStatus === "CDI" && "CDI"}
                          {jobStatus === "CDD" && "CDD"}
                          {jobStatus === "Student" && "Étudiant"}
                          {jobStatus === "Freelance" && "Indépendant / Freelance"}
                          {jobStatus === "Functionary" && "Fonctionnaire"}
                          {jobStatus === "Other" && "Autre situation"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Revenus mensuels :</dt>
                        <dd className="font-medium text-[#161616]">{monthlyIncome} € net / mois</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-[#666666] font-semibold">Garant :</dt>
                        <dd className="font-medium text-[#161616]">{hasGuarantor ? "Oui, dispose d'un garant physique ou d'une garantie (ex: Visale)" : "Non, pas de garant"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="pt-4 border-t border-[#DDDDDD] flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="btn-secondary"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? "Envoi en cours..." : "Soumettre ma candidature"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
