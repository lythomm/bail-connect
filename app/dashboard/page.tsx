"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Home,
  User,
  Plus,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Check
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const campaigns = useQuery(api.campaigns.listWithStats);
  const appointments = useQuery(api.appointments.getAllUpcomingAppointments);
  const user = useQuery(api.users.current);
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement de votre session...</span>
      </div>
    );
  }

  // Calculate stats
  const totalCampaigns = campaigns?.length || 0;

  const totalPendingCandidates = campaigns?.reduce(
    (acc, curr) => acc + (curr.stats?.pending || 0),
    0
  ) || 0;

  // Filter only future/upcoming appointments
  const upcomingVisits = appointments?.filter(
    (apt) => apt.endTime >= Date.now()
  ) || [];

  const totalUpcomingVisits = upcomingVisits.length;

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#161616]">
              Ravi de vous revoir, {user?.name || "Propriétaire"}
            </h1>
            <p className="text-sm text-[#666666] mt-1">
              Voici l'état d'avancement de vos locations et vos prochaines visites.
            </p>
          </div>
          <Link href="/dashboard/campaigns/new" className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un logement
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Link
            href="/annonces"
            className="bg-white border border-[#E2E8F0] hover:border-[#000091] rounded-lg p-3 sm:p-6 shadow-xs transition-all duration-200 group flex flex-col justify-between"
          >
            <div className="flex items-start sm:items-center justify-between gap-1">
              <span className="text-[10px] sm:text-sm font-bold text-[#666666] leading-tight">Logements Actifs</span>
              <div className="hidden sm:block p-2 bg-[#F5F5FE] text-[#000091] rounded-lg group-hover:bg-[#000091] group-hover:text-white transition-colors shrink-0">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-4 flex items-end justify-between">
              <span className="text-xl sm:text-3xl font-bold text-[#161616]">{totalCampaigns}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#000091] flex items-center gap-0.5">
                Gérer <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/calendar"
            className="bg-white border border-[#E2E8F0] hover:border-[#000091] rounded-lg p-3 sm:p-6 shadow-xs transition-all duration-200 group flex flex-col justify-between"
          >
            <div className="flex items-start sm:items-center justify-between gap-1">
              <span className="text-[10px] sm:text-sm font-bold text-[#666666] leading-tight">Visites Planifiées</span>
              <div className="hidden sm:block p-2 bg-[#E8F6EE] text-[#18753C] rounded-lg group-hover:bg-[#18753C] group-hover:text-white transition-colors shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-4 flex items-end justify-between">
              <span className="text-xl sm:text-3xl font-bold text-[#161616]">{totalUpcomingVisits}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#18753C] flex items-center gap-0.5">
                Calendrier <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/annonces"
            className="bg-white border border-[#E2E8F0] hover:border-[#000091] rounded-lg p-3 sm:p-6 shadow-xs transition-all duration-200 group flex flex-col justify-between"
          >
            <div className="flex items-start sm:items-center justify-between gap-1">
              <span className="text-[10px] sm:text-sm font-bold text-[#666666] leading-tight">Candidatures en attente</span>
              <div className="hidden sm:block p-2 bg-[#FFEFE0] text-[#B35C00] rounded-lg group-hover:bg-[#B35C00] group-hover:text-white transition-colors shrink-0">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-4 flex items-end justify-between">
              <span className="text-xl sm:text-3xl font-bold text-[#161616]">{totalPendingCandidates}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#B35C00] flex items-center gap-0.5">
                Analyser <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Main Dashboard Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Prochaines Visites */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0F0F0]">
                <h2 className="text-lg font-bold text-[#161616] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#000091]" /> Prochaines visites planifiées
                </h2>
                <Link href="/calendar" className="text-xs font-bold text-[#000091] hover:underline">
                  Voir tout le calendrier
                </Link>
              </div>

              {campaigns === undefined || appointments === undefined ? (
                <div className="text-center py-12">
                  <span className="text-sm text-[#666666]">Chargement de vos rendez-vous...</span>
                </div>
              ) : upcomingVisits.length === 0 ? (
                <div className="text-center py-12 text-[#666666] space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto text-[#666666]/30" />
                  <p className="text-sm font-semibold">Aucune visite planifiée pour le moment.</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Partagez votre lien de candidature ou acceptez des dossiers pour permettre aux candidats de planifier une visite.
                  </p>
                  {totalCampaigns > 0 && (
                    <div className="pt-2">
                      <Link href="/calendar" className="btn-secondary text-xs inline-block">
                        Configurer des créneaux horaires
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingVisits.slice(0, 5).map((apt) => {
                    const formattedDate = new Date(apt.startTime).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    });
                    const formattedTime = `${new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })} - ${new Date(apt.endTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}`;

                    return (
                      <div
                        key={apt.appointmentId}
                        className="p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#F5F5FE]/20 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#161616]">
                              {apt.candidate.firstName} {apt.candidate.lastName}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#F5F5FE] text-[#000091] px-1.5 py-0.5 border border-[#E3E3FD] rounded-[3px]">
                              {apt.candidate.nameTrigram}
                            </span>
                            <span className="text-[10px] font-semibold bg-[#E8F6EE] text-[#18753C] px-1.5 py-0.5 border border-[#18753C]/20 rounded-sm flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Dossier Certifié
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#666666]">
                            <span className="flex items-center gap-1.5 truncate">
                              <Home className="w-3.5 h-3.5" /> {apt.campaign.title}
                            </span>
                            <span className="font-semibold text-[#161616]">
                              {apt.candidate.monthlyIncome.toLocaleString("fr-FR")} € • {apt.candidate.jobStatus}
                            </span>
                          </div>
                        </div>

                        {/* Date/Time badge and Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-left md:text-right shrink-0">
                            <div className="text-sm font-bold text-[#000091] capitalize">{formattedDate}</div>
                            <div className="text-xs text-[#3A3A3A] font-semibold flex items-center gap-1 md:justify-end">
                              <Clock className="w-3 h-3" /> {formattedTime}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={apt.candidate.dossierFacileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-[11px] px-3 py-1.5 flex items-center justify-center gap-1"
                              title="Voir DossierFacile"
                            >
                              Dossier <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions & Quick Guide */}
          <div className="space-y-6">

            {/* Quick Actions Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
              <h3 className="text-base font-bold text-[#161616] mb-4 pb-2 border-b border-[#F0F0F0]">
                Raccourcis
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/dashboard/campaigns/new"
                    className="w-full flex items-center justify-between p-3 border border-[#E2E8F0] hover:border-[#000091] hover:bg-[#F5F5FE]/40 rounded-lg transition-all text-sm font-semibold text-[#161616] group"
                  >
                    <span>Ajouter un logement</span>
                    <Plus className="w-4 h-4 text-[#666666] group-hover:text-[#000091]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calendar"
                    className="w-full flex items-center justify-between p-3 border border-[#E2E8F0] hover:border-[#000091] hover:bg-[#F5F5FE]/40 rounded-lg transition-all text-sm font-semibold text-[#161616] group"
                  >
                    <span>Gérer les créneaux horaires</span>
                    <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#000091]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="w-full flex items-center justify-between p-3 border border-[#E2E8F0] hover:border-[#000091] hover:bg-[#F5F5FE]/40 rounded-lg transition-all text-sm font-semibold text-[#161616] group"
                  >
                    <span>Mon profil bailleur</span>
                    <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#000091]" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#F5F5FE] border border-[#000091]/10 rounded-lg p-6">
              <h3 className="text-sm font-bold text-[#000091] mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Astuce BailConnect
              </h3>
              <p className="text-xs text-[#3A3A3A] leading-relaxed">
                Les dossiers des candidats sont vérifiés et garantis par l'État via le service <strong>DossierFacile</strong>. N'hésitez pas à leur envoyer un rappel SMS avant la visite pour confirmer leur présence.
              </p>
            </div>

          </div>

        </div>

      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
