"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ExternalLink,
  Plus,
  CalendarRange,
  Trash2,
  Filter,
  Info
} from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";
import Dialog from "@/components/Dialog";
import DeleteSlotDialog from "@/components/DeleteSlotDialog";
import CalendarOnboarding from "@/components/CalendarOnboarding";
import { toParisDateStr, formatTimeRangeParis } from "@/lib/dateUtils";

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const campaigns = useQuery(api.campaigns.listWithStats) || [];
  const user = useQuery(api.users.current);

  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    new Set([new Date().toISOString().split("T")[0]])
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<string | null>(null);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [slotIdToDelete, setSlotIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCalendarOnboardingOpen, setIsCalendarOnboardingOpen] = useState(false);

  useEffect(() => {
    if (user && user.isCalendarOnboarded !== true) {
      const activeCampaigns = campaigns.filter(c => c.status === "active");
      if (activeCampaigns.length > 0) {
        setIsCalendarOnboardingOpen(true);
      }
    }
  }, [user, campaigns]);

  const getDatesInRange = (startStr: string, endStr: string): string[] => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates: string[] = [];
    const minDate = start < end ? start : end;
    const maxDate = start < end ? end : start;
    const current = new Date(minDate);
    while (current <= maxDate) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isFilterDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".multi-select-dropdown")) {
        setIsFilterDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isFilterDropdownOpen]);

  // Set initial selected campaigns once they load
  useEffect(() => {
    if (campaigns.length > 0 && selectedCampaignIds.length === 0) {
      setSelectedCampaignIds(campaigns.map(c => c._id));
    }
  }, [campaigns, selectedCampaignIds]);

  // Query all slots for the landlord
  const allSlots = useQuery(api.appointments.getAllCampaignSlots) || [];

  const createSlotMutation = useMutation(api.appointments.createSlot);
  const deleteSlotMutation = useMutation(api.appointments.deleteSlot);

  // Custom slot creator state
  const [newSlotCampaignId, setNewSlotCampaignId] = useState<string>("");
  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:30");
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Synchronize campaign selection for slot creator
  useEffect(() => {
    if (campaigns.length > 0 && !newSlotCampaignId) {
      setNewSlotCampaignId(campaigns[0]._id);
    }
  }, [campaigns, newSlotCampaignId]);

  // Generate next 6 months starting from current month
  const monthsList = Array.from({ length: 6 }, (_, i) => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + i, 1);
  });

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
    if (!newSlotCampaignId) {
      setToast({ message: "Veuillez sélectionner une annonce d'abord.", type: "error" });
      return;
    }

    try {
      const datesArray = Array.from(selectedDates);
      if (datesArray.length === 0) {
        datesArray.push(selectedDateStr);
      }

      for (const dStr of datesArray) {
        const start = new Date(`${dStr}T${newSlotStart}`);
        const end = new Date(`${dStr}T${newSlotEnd}`);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          setToast({ message: "Veuillez entrer des heures valides.", type: "error" });
          return;
        }
        if (end.getTime() <= start.getTime()) {
          setToast({ message: "L'heure de fin doit être après l'heure de début.", type: "error" });
          return;
        }
      }

      await Promise.all(
        datesArray.map(async (dStr) => {
          const start = new Date(`${dStr}T${newSlotStart}`);
          const end = new Date(`${dStr}T${newSlotEnd}`);
          await createSlotMutation({
            campaignId: newSlotCampaignId as any,
            startTime: start.getTime(),
            endTime: end.getTime(),
            maxCapacity: newSlotCapacity,
          });
        })
      );

      setToast({
        message: datesArray.length > 1
          ? `Créneaux ajoutés avec succès pour ${datesArray.length} jours !`
          : "Créneau ajouté avec succès !",
        type: "success"
      });
      setIsAddSlotOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la création.", type: "error" });
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlotIdToDelete(slotId);
  };

  const confirmDeleteSlot = async (slotId: string) => {
    setIsDeleting(true);
    try {
      await deleteSlotMutation({ slotId: slotId as any });
      setToast({ message: "Créneau retiré.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: "error" });
    } finally {
      setIsDeleting(false);
      setSlotIdToDelete(null);
    }
  };

  const toggleCampaignFilter = (id: string) => {
    if (selectedCampaignIds.includes(id)) {
      setSelectedCampaignIds(selectedCampaignIds.filter(cid => cid !== id));
    } else {
      setSelectedCampaignIds([...selectedCampaignIds, id]);
    }
  };

  // Filter slots based on selected campaigns
  const filteredSlots = allSlots.filter(slot =>
    selectedCampaignIds.includes(slot.campaignId)
  );

  // Filter slots for the selected day in side panel
  const slotsOnSelectedDay = filteredSlots.filter(slot =>
    toParisDateStr(slot.startTime) === selectedDateStr
  );

  const formattedSelectedDayLabel = (() => {
    if (selectedDates.size > 1) {
      const sortedDates = Array.from(selectedDates).sort();
      const startStr = sortedDates[0];
      const endStr = sortedDates[sortedDates.length - 1];

      const startParts = startStr.split("-");
      const endParts = endStr.split("-");
      if (startParts.length !== 3 || endParts.length !== 3) return "";

      const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
      const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));

      const endDayMonthYear = endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      if (startDate.getFullYear() !== endDate.getFullYear()) {
        const startDayMonthYear = startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        return `${startDayMonthYear} - ${endDayMonthYear}`;
      }

      if (startDate.getMonth() === endDate.getMonth()) {
        const startDay = startDate.getDate();
        return `${startDay} - ${endDayMonthYear}`;
      }

      const startDayMonth = startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      return `${startDayMonth} - ${endDayMonthYear}`;
    }

    const parts = selectedDateStr.split("-");
    if (parts.length !== 3) return "";
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      <main className="flex-1 w-full px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#161616]">Agenda & Visites</h1>
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
          <div className="space-y-6">

            {/* Main Dual-Pane Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Big Airbnb Calendar (6 months scrollable) */}
              <div className="lg:col-span-2 -mx-6 md:-mx-0">
                {monthsList.map((monthDate, idx) => {
                  const mYear = monthDate.getFullYear();
                  const mMonth = monthDate.getMonth();
                  const mFirstDay = new Date(mYear, mMonth, 1);
                  const mStartDayOffset = (mFirstDay.getDay() + 6) % 7;
                  const mDaysInMonthCount = new Date(mYear, mMonth + 1, 0).getDate();
                  const mDaysInMonth = Array.from({ length: mDaysInMonthCount }, (_, i) => i + 1);
                  const mMonthLabel = monthDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

                  return (
                    <div key={idx} className="bg-white p-6">
                      <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#161616] capitalize text-center">{mMonthLabel}</h2>
                      </div>

                      {/* Day of week header */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#666666] mb-2 border-b border-[#F0F0F0] pb-2">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mer</span>
                        <span>Jeu</span>
                        <span>Ven</span>
                        <span>Sam</span>
                        <span>Dim</span>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 select-none">
                        {/* Empty offsets */}
                        {Array.from({ length: mStartDayOffset }).map((_, idx) => (
                          <div key={`offset-${idx}`} className="aspect-square bg-transparent"></div>
                        ))}

                        {/* Active days */}
                        {mDaysInMonth.map((day) => {
                          const mm = String(mMonth + 1).padStart(2, "0");
                          const dd = String(day).padStart(2, "0");
                          const dateStr = `${mYear}-${mm}-${dd}`;
                          const isSelected = selectedDateStr === dateStr || selectedDates.has(dateStr);
                          const isToday = new Date().toDateString() === new Date(mYear, mMonth, day).toDateString();

                          // Check if day is in the past
                          const dayDate = new Date(mYear, mMonth, day);
                          const todayDate = new Date();
                          todayDate.setHours(0, 0, 0, 0);
                          dayDate.setHours(0, 0, 0, 0);
                          const isPast = dayDate.getTime() < todayDate.getTime();

                          // Find slots and bookings on this day
                          const daySlots = filteredSlots.filter(slot =>
                            toParisDateStr(slot.startTime) === dateStr
                          );

                          const totalBooked = daySlots.reduce((acc, s) => acc + (s.candidates?.length || 0), 0);

                          return (
                            <button
                              key={`day-${day}`}
                              onClick={() => {
                                setSelectedDateStr(dateStr);
                                setSelectedDates(new Set([dateStr]));
                                setIsMobileDrawerOpen(true);
                              }}
                              onMouseDown={(e) => {
                                if (isPast) return;
                                if (e.button !== 0) return; // Only left click
                                e.preventDefault();
                                setIsDragging(true);
                                setDragStartDate(dateStr);
                                setSelectedDates(new Set([dateStr]));
                                setSelectedDateStr(dateStr);
                              }}
                              onMouseEnter={() => {
                                if (isPast) return;
                                if (isDragging && dragStartDate) {
                                  const range = getDatesInRange(dragStartDate, dateStr);
                                  const activeRange = range.filter(d => {
                                    const dayDate = new Date(d);
                                    const todayDate = new Date();
                                    todayDate.setHours(0, 0, 0, 0);
                                    dayDate.setHours(0, 0, 0, 0);
                                    return dayDate.getTime() >= todayDate.getTime();
                                  });
                                  setSelectedDates(new Set(activeRange));
                                }
                              }}
                              disabled={isPast}
                              className={`aspect-square flex flex-col items-center justify-between p-1 sm:p-2 relative rounded-xl border text-xs font-semibold transition-all duration-200 ${isPast
                                ? "bg-[#EEEEEE] border-[#DDDDDD] text-[#888888] cursor-not-allowed opacity-50"
                                : isSelected
                                  ? "border-[#000091] ring-2 ring-[#000091]/20 bg-[#F5F5FE] cursor-pointer"
                                  : isToday
                                    ? "bg-white border-[#000091]/30 hover:bg-[#F5F5FE] text-[#000091] cursor-pointer"
                                    : "bg-white hover:bg-[#F5F5FE] border-[#E2E8F0] text-[#161616] cursor-pointer"
                                }`}
                            >
                              <span className={`self-center sm:self-start ${isPast ? 'text-[#888888]' : isToday ? 'text-[#000091] font-extrabold' : 'text-[#161616]'}`}>{day}</span>

                              {daySlots.length > 0 && (
                                <div className="w-full flex justify-center mt-1">
                                  {totalBooked > 0 ? (
                                    <>
                                      <span className="hidden md:inline-block w-full text-center text-[9px] font-extrabold bg-[#E8F6EE] text-[#18753C] py-0.5 rounded-sm truncate">
                                        {totalBooked} rdv
                                      </span>
                                      <span className="md:hidden w-1.5 h-1.5 rounded-full bg-[#18753C] mb-1" />
                                    </>
                                  ) : (
                                    <>
                                      <span className="hidden md:inline-block w-full text-center text-[9px] font-extrabold bg-[#F5F5FE] text-[#000091] py-0.5 rounded-sm truncate">
                                        {daySlots.length} dispo
                                      </span>
                                      <span className="md:hidden w-1.5 h-1.5 rounded-full bg-[#000091] mb-1" />
                                    </>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile overlay backdrop */}
              {isMobileDrawerOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-fade-in"
                  onClick={() => setIsMobileDrawerOpen(false)}
                />
              )}

              {/* Right Column: Sticky Side Panel on Desktop / Bottom Drawer on Mobile */}
              <div className={`
                lg:col-span-1 space-y-6
                fixed bottom-0 left-0 right-0 z-[60] bg-[#F6F6F6] rounded-t-2xl shadow-2xl p-4 border-t border-[#E2E8F0] max-h-[85vh] overflow-y-auto transform transition-transform duration-300
                lg:static lg:bg-transparent lg:rounded-none lg:shadow-none lg:p-0 lg:border-t-0 lg:max-h-none lg:overflow-visible lg:transform-none lg:z-auto lg:sticky lg:top-20 lg:self-start
                ${isMobileDrawerOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"}
              `}>

                {/* Mobile Drawer Header */}
                <div className="flex flex-col items-center lg:hidden pb-3 border-b border-[#E2E8F0]">
                  <div className="w-12 h-1 bg-neutral-300 rounded-full mb-3" />
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-extrabold text-[#666666] uppercase tracking-wider">Détails du jour</span>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="text-xs font-bold text-[#000091] hover:underline"
                    >
                      Fermer
                    </button>
                  </div>
                </div>

                {/* Airbnb-style Filters (Multi-select Dropdown) */}
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs relative multi-select-dropdown">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#3A3A3A]">
                    <Filter className="w-4 h-4 text-[#000091]" />
                    <span>Filtrer par logement :</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="w-full text-xs border border-[#CCCCCC] rounded-md px-3 py-2 bg-white hover:border-[#000091] transition-colors focus:outline-none flex justify-between items-center font-semibold text-[#161616]"
                  >
                    <span>
                      {selectedCampaignIds.length === campaigns.length
                        ? "Tous les logements"
                        : selectedCampaignIds.length === 0
                          ? "Aucun logement sélectionné"
                          : `${selectedCampaignIds.length} logement${selectedCampaignIds.length > 1 ? 's' : ''} sélectionné${selectedCampaignIds.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <span className={`transform transition-transform duration-200 text-[10px] text-[#666666] ${isFilterDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute left-4 right-4 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-20 p-3 space-y-2 max-h-60 overflow-y-auto animate-fade-in">
                      <div className="flex justify-between border-b border-[#F0F0F0] pb-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCampaignIds(campaigns.map(c => c._id))}
                          className="text-[10px] font-bold text-[#000091] hover:underline cursor-pointer"
                        >
                          Tout sélectionner
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCampaignIds([])}
                          className="text-[10px] font-bold text-[#666666] hover:underline cursor-pointer"
                        >
                          Désélectionner tout
                        </button>
                      </div>
                      <div className="space-y-2">
                        {campaigns.map((c) => {
                          const isSelected = selectedCampaignIds.includes(c._id);
                          return (
                            <label
                              key={c._id}
                              className="flex items-center gap-2 text-xs text-[#161616] cursor-pointer hover:bg-neutral-50 p-1 rounded-sm"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCampaignFilter(c._id)}
                                className="accent-[#000091] w-4 h-4 cursor-pointer"
                              />
                              <span className="font-medium truncate">{c.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Day Panel */}
                <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6 space-y-6">

                  {/* Selected Date Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#F0F0F0]">
                    <div>
                      <span className="text-[10px] font-bold text-[#000091] uppercase tracking-wider">
                        {selectedDates.size > 1 ? `${selectedDates.size} jours sélectionnés` : "Période sélectionnée"}
                      </span>
                      <h3 className="text-base font-bold text-[#161616] capitalize mt-1">
                        {formattedSelectedDayLabel}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddSlotOpen(true)}
                      className="btn-primary text-xs flex items-center justify-center gap-1 px-3 py-1.5 cursor-pointer h-auto shrink-0 animate-fade-in w-full lg:w-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter un créneau
                    </button>
                  </div>

                  {/* Slots list for this day */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#161616] border-b border-[#F0F0F0] pb-2 flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-[#000091]" /> Créneaux & Visites
                    </h4>

                    {selectedDates.size > 1 ? (
                      <div className="bg-[#F5F5FE] border border-[#000091]/10 rounded-lg p-4 flex gap-3 text-xs text-[#000091] leading-relaxed">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold mb-1">Mode multi-sélection ({selectedDates.size} jours)</p>
                          <p>
                            Les nouveaux créneaux ajoutés s'appliqueront simultanément à chacun des jours sélectionnés.
                          </p>
                        </div>
                      </div>
                    ) : slotsOnSelectedDay.length === 0 ? (
                      <p className="text-xs text-[#666666] py-4 text-center">Aucun créneau configuré pour ce jour.</p>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {slotsOnSelectedDay.map((slot) => {
                          const timeString = formatTimeRangeParis(slot.startTime, slot.endTime);

                          return (
                            <div key={slot._id} className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F9F9F9] space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="text-xs font-bold text-[#000091]">{timeString}</div>
                                  <div className="text-[10px] text-[#666666] font-semibold mt-0.5 truncate max-w-[180px]">{slot.campaignTitle}</div>
                                </div>
                                <button
                                  onClick={() => handleDeleteSlot(slot._id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Supprimer ce créneau"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Booked Candidates */}
                              {slot.candidates && slot.candidates.length > 0 ? (
                                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                                  {slot.candidates.map((cand) => (
                                    <div key={cand.appointmentId} className="text-xs space-y-1 bg-white p-2 rounded-md border border-[#E2E8F0]">
                                      <div className="flex justify-between items-center gap-1">
                                        <span className="font-bold text-[#161616]">{cand.firstName} {cand.lastName}</span>
                                        <span className="text-[9px] bg-[#E8F6EE] text-[#18753C] px-1 py-0.5 rounded-sm font-bold shrink-0">
                                          Dossier OK
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-[#666666]">{cand.jobStatus} • {cand.monthlyIncome.toLocaleString("fr-FR")} €/mois</div>
                                      <div className="pt-1.5 flex gap-1">
                                        <a
                                          href={cand.dossierFacileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] border border-[#CCCCCC] rounded px-1.5 py-0.5 text-[#161616] hover:bg-gray-50 flex items-center gap-1 font-semibold"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" /> Dossier
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[10px] text-[#666666] italic">Aucune réservation (0/{slot.maxCapacity})</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Dialog
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Ajouter un créneau de visite"
        size="md"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="bg-[#F5F5FE] p-3 rounded-md border border-[#000091]/10 mb-4">
            <span className="text-xs font-bold text-[#000091]">
              {selectedDates.size > 1
                ? `${selectedDates.size} jours sélectionnés pour l'ajout de créneau`
                : `Jour de visite : ${formattedSelectedDayLabel}`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Bien concerné</label>
            <select
              value={newSlotCampaignId}
              onChange={(e) => setNewSlotCampaignId(e.target.value)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091] font-semibold"
            >
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure début</label>
              <input
                type="time"
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Heure fin</label>
              <input
                type="time"
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1.5">Capacité maximale (nombre de visiteur)</label>
            <input
              type="number"
              min="1"
              value={newSlotCapacity}
              onChange={(e) => setNewSlotCapacity(parseInt(e.target.value) || 1)}
              className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091]"
            />
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddSlotOpen(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-4 py-2 cursor-pointer"
            >
              Créer le créneau
            </button>
          </div>
        </form>
      </Dialog>

      <DeleteSlotDialog
        isOpen={slotIdToDelete !== null}
        onClose={() => setSlotIdToDelete(null)}
        onConfirm={async () => {
          if (slotIdToDelete) {
            await confirmDeleteSlot(slotIdToDelete);
          }
        }}
        isLoading={isDeleting}
      />

      <CalendarOnboarding
        isOpen={isCalendarOnboardingOpen}
        onClose={() => setIsCalendarOnboardingOpen(false)}
      />
    </div>
  );
}
