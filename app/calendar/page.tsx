"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  CalendarRange, 
  Info,
  Trash2
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const campaigns = useQuery(api.campaigns.listWithStats) || [];

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "slots">("upcoming");
  
  // Set initial selected campaign once they load
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0]._id);
    }
  }, [campaigns, selectedCampaignId]);

  // Query real slots and appointments for the selected campaign
  const slotsData = useQuery(
    api.appointments.getCampaignSlots, 
    selectedCampaignId ? { campaignId: selectedCampaignId as any } : "skip"
  ) || [];

  const createSlotMutation = useMutation(api.appointments.createSlot);
  const deleteSlotMutation = useMutation(api.appointments.deleteSlot);

  // Parse backend data to match the appointments UI
  const appointments = slotsData.flatMap(slot => 
    (slot.candidates || []).map(cand => ({
      id: cand.appointmentId,
      slotId: slot._id,
      candidateName: `${cand.firstName} ${cand.lastName}`,
      email: cand.email,
      phone: cand.phone,
      listingTitle: campaigns.find(c => c._id === selectedCampaignId)?.title || "Mon annonce",
      startTime: slot.startTime,
      endTime: slot.endTime,
      dossierUrl: cand.dossierFacileUrl,
      income: cand.monthlyIncome,
      job: cand.jobStatus,
    }))
  ).sort((a, b) => a.startTime - b.startTime);

  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const selectedApt = appointments.find(a => a.id === selectedAptId) || null;

  // Custom slot creator state
  const [newSlotDate, setNewSlotDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:30");
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0, Tue=1...
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

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

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      setToast({ message: "Veuillez sélectionner une annonce d'abord.", type: "error" });
      return;
    }

    try {
      const start = new Date(`${newSlotDate}T${newSlotStart}`);
      const end = new Date(`${newSlotDate}T${newSlotEnd}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setToast({ message: "Veuillez entrer une date et des heures valides.", type: "error" });
        return;
      }

      if (end.getTime() <= start.getTime()) {
        setToast({ message: "L'heure de fin doit être après l'heure de début.", type: "error" });
        return;
      }

      await createSlotMutation({
        campaignId: selectedCampaignId as any,
        startTime: start.getTime(),
        endTime: end.getTime(),
        maxCapacity: newSlotCapacity,
      });

      setToast({ message: "Créneau ajouté avec succès !", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la création.", type: "error" });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce créneau et annuler les rendez-vous associés ?")) {
      return;
    }
    try {
      await deleteSlotMutation({ slotId: slotId as any });
      if (selectedApt?.slotId === slotId) {
        setSelectedAptId(null);
      }
      setToast({ message: "Créneau retiré.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: "error" });
    }
  };

  const filteredApts = appointments.filter(apt => {
    const isPast = apt.endTime < Date.now();
    if (activeTab === "upcoming") return !isPast;
    if (activeTab === "past") return isPast;
    return false;
  });

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Group slots by day for config tab
  const groupedSlotsByDay: Record<string, typeof slotsData> = {};
  slotsData.forEach(slot => {
    const dayLabel = new Date(slot.startTime).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    if (!groupedSlotsByDay[dayLabel]) {
      groupedSlotsByDay[dayLabel] = [];
    }
    groupedSlotsByDay[dayLabel].push(slot);
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Campaign selector and header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="gov-badge mb-2">Planification</span>
            <h1 className="text-2xl font-bold text-[#161616]">Mes Rendez-vous</h1>
            <p className="text-sm text-[#666666] mt-1">
              Gérez vos créneaux de visite et suivez les confirmations des candidats.
            </p>
          </div>
          
          {campaigns.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#3A3A3A] whitespace-nowrap">Annonce :</label>
              <select
                value={selectedCampaignId || ""}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  setSelectedAptId(null);
                }}
                className="text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091] max-w-xs font-semibold"
              >
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-[#666666]/30 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#161616] mb-2">Aucune annonce trouvée</h3>
            <p className="text-sm text-[#666666] max-w-md mx-auto">
              Vous devez créer au moins une annonce immobilière depuis votre tableau de bord avant de pouvoir planifier des créneaux de visite.
            </p>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-[#DDDDDD] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => { setActiveTab("upcoming"); setSelectedAptId(null); }}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "upcoming"
                    ? "border-[#000091] text-[#000091]"
                    : "border-transparent text-[#666666] hover:text-[#161616]"
                }`}
              >
                Visites à venir ({appointments.filter(a => a.endTime >= Date.now()).length})
              </button>
              <button
                onClick={() => { setActiveTab("past"); setSelectedAptId(null); }}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "past"
                    ? "border-[#000091] text-[#000091]"
                    : "border-transparent text-[#666666] hover:text-[#161616]"
                }`}
              >
                Historique ({appointments.filter(a => a.endTime < Date.now()).length})
              </button>
              <button
                onClick={() => { setActiveTab("slots"); setSelectedAptId(null); }}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "slots"
                    ? "border-[#000091] text-[#000091]"
                    : "border-transparent text-[#666666] hover:text-[#161616]"
                }`}
              >
                Configuration des créneaux ({slotsData.length})
              </button>
            </div>

            {/* Calendar Page Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left/Middle Column: Content area */}
              <div className="lg:col-span-2 space-y-6">
                
                {activeTab !== "slots" ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-[#161616]">
                        {activeTab === "upcoming" ? "Vos prochaines visites" : "Visites passées"}
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-[#666666] bg-[#F5F5FE] px-3 py-1 border border-[#000091]/10 rounded-sm">
                        <Info className="w-3.5 h-3.5 text-[#000091]" />
                        <span>Fuseau horaire : Europe/Paris</span>
                      </div>
                    </div>

                    {filteredApts.length === 0 ? (
                      <div className="text-center py-12 text-[#666666] text-sm">
                        Aucun rendez-vous dans cette catégorie.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DDDDDD]">
                        {filteredApts.map((apt) => {
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
                              key={apt.id} 
                              onClick={() => setSelectedAptId(apt.id)}
                              className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F5FE]/40 transition-colors p-3 rounded-lg -mx-3 ${
                                selectedAptId === apt.id ? "bg-[#F5F5FE]" : ""
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#161616] text-sm md:text-base">{apt.candidateName}</span>
                                  <span className="text-[10px] font-semibold bg-[#E8F6EE] text-[#18753C] px-1.5 py-0.5 border border-[#18753C]/20 rounded-sm flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" /> Dossier Certifié
                                  </span>
                                </div>
                                <div className="text-xs text-[#666666] flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" /> {apt.listingTitle}
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-6">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#000091] capitalize">{formattedDate}</div>
                                  <div className="text-xs text-[#3A3A3A] font-semibold flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3" /> {formattedTime}
                                  </div>
                                </div>
                                <div className="text-xs">
                                  {apt.endTime >= Date.now() ? (
                                    <span className="px-2.5 py-1 bg-[#E8F6EE] text-[#18753C] font-semibold border border-[#18753C]/30 rounded-sm">
                                      Confirmé
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-[#EEEEEE] text-[#666666] font-semibold border border-[#DDDDDD] rounded-sm">
                                      Terminé
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  // Configurer les créneaux area
                  <div className="space-y-6">
                    {/* Form to add slot */}
                    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
                      <h2 className="text-lg font-bold text-[#161616] mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#000091]" /> Ajouter un nouveau créneau de visite
                      </h2>
                      <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Date de visite</label>
                          <input
                            type="date"
                            value={newSlotDate}
                            onChange={(e) => setNewSlotDate(e.target.value)}
                            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Début</label>
                          <input
                            type="time"
                            value={newSlotStart}
                            onChange={(e) => setNewSlotStart(e.target.value)}
                            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Fin</label>
                          <input
                            type="time"
                            value={newSlotEnd}
                            onChange={(e) => setNewSlotEnd(e.target.value)}
                            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Capacité max</label>
                          <input
                            type="number"
                            min="1"
                            value={newSlotCapacity}
                            onChange={(e) => setNewSlotCapacity(parseInt(e.target.value) || 1)}
                            className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <button type="submit" className="btn-primary w-full text-center justify-center text-sm py-2">
                            Créer ce créneau de visite
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Slots display */}
                    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
                      <h2 className="text-lg font-bold text-[#161616] mb-4">Créneaux de visites configurés</h2>
                      <p className="text-xs text-[#666666] mb-6">
                        Ces plages horaires seront proposées aux candidats acceptés pour qu&apos;ils réservent leur visite.
                      </p>

                      {slotsData.length === 0 ? (
                        <div className="text-center py-12 text-[#666666] text-sm">
                          Aucun créneau configuré pour le moment.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.keys(groupedSlotsByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map((dayLabel) => (
                            <div key={dayLabel} className="border-b border-[#DDDDDD] pb-4 last:border-0 last:pb-0">
                              <h3 className="font-bold text-sm text-[#161616] mb-3 flex items-center gap-2 capitalize">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#000091]"></span>
                                {dayLabel}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {groupedSlotsByDay[dayLabel].map((slot) => {
                                  const timeString = `${new Date(slot.startTime).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })} - ${new Date(slot.endTime).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}`;
                                  
                                  return (
                                    <span 
                                      key={slot._id}
                                      className="text-xs font-semibold bg-[#F5F5FE] text-[#000091] px-2.5 py-1.5 border border-[#000091]/20 rounded-md flex items-center gap-1.5"
                                    >
                                      {timeString} ({slot.bookedCount}/{slot.maxCapacity})
                                      <button 
                                        onClick={() => handleDeleteSlot(slot._id)}
                                        className="text-red-500 hover:text-red-700 font-bold ml-1.5 cursor-pointer focus:outline-none flex items-center justify-center"
                                        title="Supprimer le créneau"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Premium Interactive Month Calendar View */}
                <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-[#161616]">Vue d&apos;ensemble du calendrier</h2>
                      <p className="text-xs text-[#666666] mt-0.5">Visualisez les jours contenant des visites planifiées.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#161616] capitalize">{monthLabel}</span>
                      <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-[#F5F5FE] rounded-lg border border-[#DDDDDD] cursor-pointer">
                          <ChevronLeft className="w-4 h-4 text-[#666666]" />
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-[#F5F5FE] rounded-lg border border-[#DDDDDD] cursor-pointer">
                          <ChevronRight className="w-4 h-4 text-[#666666]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Day header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#666666] mb-2">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mer</span>
                    <span>Jeu</span>
                    <span>Ven</span>
                    <span>Sam</span>
                    <span>Dim</span>
                  </div>

                  {/* Day Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Offsets */}
                    {Array.from({ length: startDayOffset }).map((_, idx) => (
                      <div key={`offset-${idx}`} className="aspect-square bg-transparent"></div>
                    ))}
                    
                    {daysInMonth.map((day) => {
                      const dateOfDay = new Date(year, month, day);
                      
                      // Check if there are appointments on this day
                      const apptsOnDay = appointments.filter(apt => {
                        const d = new Date(apt.startTime);
                        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                      });

                      const hasVisits = apptsOnDay.length > 0;
                      const isToday = new Date().toDateString() === dateOfDay.toDateString();

                      return (
                        <button
                          key={`day-${day}`}
                          onClick={() => {
                            if (hasVisits) {
                              setSelectedAptId(apptsOnDay[0].id);
                              setActiveTab(apptsOnDay[0].startTime >= Date.now() ? "upcoming" : "past");
                            } else {
                              setToast({ message: `Aucune visite prévue pour le ${day} ${currentDate.toLocaleDateString("fr-FR", { month: "long" })}.`, type: "warning" });
                            }
                          }}
                          className={`aspect-square flex flex-col items-center justify-center relative rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                            isToday 
                              ? "bg-[#000091] text-white border-[#000091] shadow-xs" 
                              : hasVisits
                                ? "bg-[#E3E3FD] border-[#000091]/30 text-[#000091] hover:bg-[#000091]/10"
                                : "bg-white hover:bg-[#F5F5FE] border-[#E2E8F0] text-[#161616]"
                          }`}
                        >
                          <span>{day}</span>
                          {hasVisits && (
                            <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isToday ? 'bg-white' : 'bg-[#000091]'}`}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Appointment details */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-[#161616] mb-6 pb-2 border-b border-[#DDDDDD] flex items-center gap-2">
                    <CalendarRange className="w-5 h-5 text-[#000091]" /> Détails de la visite
                  </h2>

                  {selectedApt ? (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#000091] uppercase tracking-wider">Candidat</span>
                        <h3 className="text-lg font-bold text-[#161616]">{selectedApt.candidateName}</h3>
                        <div className="text-xs text-[#3A3A3A] font-semibold bg-[#E8F6EE] text-[#18753C] px-2 py-0.5 border border-[#18753C]/20 rounded-sm inline-block">
                          Dossier vérifié & certifié par l&apos;État
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-[#3A3A3A]">
                        <div className="flex justify-between py-1 border-b border-[#F0F0F0] gap-2">
                          <span className="text-[#666666] shrink-0">Bien concerné</span>
                          <span className="font-bold text-[#161616] text-right truncate">{selectedApt.listingTitle}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#F0F0F0]">
                          <span className="text-[#666666]">Revenus mensuels</span>
                          <span className="font-bold text-[#161616]">{selectedApt.income.toLocaleString("fr-FR")} € / mois</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#F0F0F0]">
                          <span className="text-[#666666]">Situation pro</span>
                          <span className="font-bold text-[#161616]">{selectedApt.job}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#F0F0F0] gap-2">
                          <span className="text-[#666666] shrink-0">Email</span>
                          <span className="font-semibold select-all text-right truncate">{selectedApt.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#F0F0F0]">
                          <span className="text-[#666666]">Téléphone</span>
                          <span className="font-semibold select-all">{selectedApt.phone}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <a 
                          href={selectedApt.dossierUrl}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-secondary w-full text-center justify-center text-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Consulter le dossier DossierFacile
                        </a>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setToast({ message: "Notification SMS de rappel envoyée au candidat.", type: "success" });
                            }}
                            className="btn-primary text-xs flex-1 text-center justify-center py-2"
                          >
                            Rappeler par SMS
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#666666] text-sm">
                      Sélectionnez un rendez-vous ou cliquez sur un jour actif du calendrier pour afficher ses détails.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
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
