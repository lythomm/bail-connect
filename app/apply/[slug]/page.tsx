"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Dialog from "@/components/Dialog";
import { formatError } from "@/lib/errors";

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
  const [age, setAge] = useState("");
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("bailconnect_warning_dismissed");
    if (dismissed !== "true") {
      setShowWarningDialog(true);
    }
  }, []);

  const handleCloseWarning = () => {
    localStorage.setItem("bailconnect_warning_dismissed", "true");
    setShowWarningDialog(false);
  };

  // Stepper states
  const [currentStep, setCurrentStep] = useState(1);

  // Status states
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const ageNum = parseInt(age.trim());
    if (!age.trim() || isNaN(ageNum)) {
      setError("Veuillez saisir votre âge.");
      return false;
    }
    if (ageNum < 18) {
      setError("Vous devez avoir au moins 18 ans pour candidater.");
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

  const validateStep3 = (): boolean => {
    setError(null);
    const cleanUrl = dossierFacileUrl.trim();
    const dossierFacileRegex = /^https:\/\/[a-z0-9.-]*dossierfacile\.(logement\.gouv\.fr|fr)\/(file|pf)\/[a-zA-Z0-9-]+$/i;
    if (!dossierFacileRegex.test(cleanUrl)) {
      setError(
        "L'URL DossierFacile est invalide. Exemple de format attendu : https://locataire.dossierfacile.logement.gouv.fr/file/votre-identifiant"
      );
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
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
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

    // Validate steps first just in case
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
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

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

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
        age: parseInt(age.trim()),
        monthlyIncome: parseFloat(monthlyIncome),
        jobStatus,
        hasGuarantor,
        dossierFacileUrl: cleanUrl,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(formatError(err));
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
            <p className="mb-4">Ce logement n'est plus disponible ou l'adresse URL est incorrecte.</p>
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
              Votre candidature est en cours de validation par le propriétaire.
            </p>

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
      <Dialog
        isOpen={showWarningDialog}
        onClose={handleCloseWarning}
        title="Préparation de votre dossier"
        closeOnOverlayClick={false}
        footer={
          <button
            type="button"
            onClick={handleCloseWarning}
            className="btn-primary w-full sm:w-auto cursor-pointer"
          >
            C'est noté !
          </button>
        }
      >
        <div className="space-y-4">
          <div className="gov-callout gov-callout-info m-0">
            <strong className="text-[#000091]">Conseil pour votre candidature</strong>
            <p className="mt-1 text-xs leading-relaxed text-[#3A3A3A]">
              Veillez à ce que les informations saisies correspondent bien aux justificatifs officiels de votre dossier DossierFacile pour éviter tout malentendu.
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[#3A3A3A]">
            Une candidature transparente et cohérente instaure un climat de confiance réciproque et augmente vos chances d'obtenir rapidement un rendez-vous de visite.
          </p>
        </div>
      </Dialog>
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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="gov-badge">Candidature locataire</span>
            {campaign.rentAmount !== undefined && (
              <span className="text-xs font-semibold bg-[#E3E3FD] text-[#000091] px-2.5 py-1 rounded-sm border border-[#000091]/20">
                Loyer : {campaign.rentAmount} € / mois CC
              </span>
            )}
          </div>
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
                <span>Étape {currentStep} sur 4</span>
                <span className="text-[#000091]">
                  {currentStep === 1 && "Identité & Contact"}
                  {currentStep === 2 && "Situation & Revenus"}
                  {currentStep === 3 && "Dossier"}
                  {currentStep === 4 && "Validation"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className={`h-2 transition-all duration-300 ${currentStep >= 1 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 2 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 3 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
                <div className={`h-2 transition-all duration-300 ${currentStep >= 4 ? "bg-[#000091]" : "bg-[#EEEEEE]"}`}></div>
              </div>
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
                  handleNext();
                } else if (currentStep === 4) {
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="form-label">
                        Âge *
                      </label>
                      <input
                        id="age"
                        type="number"
                        required
                        min="18"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="form-input"
                        placeholder="ex: 25"
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
                        Revenus mensuels nets *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="income"
                          type="number"
                          required
                          min="0"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          className="form-input pr-10"
                          placeholder="ex: 2100"
                        />
                        <span className="absolute right-4 text-sm text-[#929292] font-semibold pointer-events-none select-none">
                          €
                        </span>
                      </div>
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
                    <a
                      href="https://www.dossierfacile.logement.gouv.fr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#000091] hover:underline mt-2.5 inline-flex items-center gap-1"
                    >
                      Accéder à DossierFacile.fr ↗
                    </a>
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
                      className="btn-primary"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Recap Box */}
                  <div className="border border-[#E3E3FD] bg-[#F5F5FE] p-5 animate-in fade-in duration-350">
                    <h3 className="text-sm font-bold text-[#000091] mb-3 uppercase tracking-wider border-b border-[#E3E3FD] pb-2">
                      Récapitulatif de votre dossier
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#3A3A3A]">
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Identité :</dt>
                        <dd className="font-medium text-[#161616]">{firstName} {lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#666666] font-semibold">Âge :</dt>
                        <dd className="font-medium text-[#161616]">{age} ans</dd>
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
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-[#666666] font-semibold">Lien DossierFacile :</dt>
                        <dd className="font-medium text-[#000091] break-all">
                          <a
                            href={dossierFacileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {dossierFacileUrl}
                          </a>
                        </dd>
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
