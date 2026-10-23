import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Info,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useOperationsStore } from '../store/useOperationsStore';
import { generateMonthGrid } from '../utils/calendar';
import { Reservation } from '../types';

export const ScheduleMatrixView: React.FC = () => {
  const {
    facilities,
    selectedFacilityId,
    currentDate,
    navigateMonth,
    resetToToday,
    calendarMode,
    setCalendarMode,
    reservations,
    searchQuery,
    openCreateModal,
    openDossierModal,
  } = useOperationsStore();

  const facility =
    facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const monthGrid = React.useMemo(() => {
    return generateMonthGrid(year, month, '2025-10-15');
  }, [year, month]);

  // Filter reservations for current facility and active search
  const facilityReservations = React.useMemo(() => {
    return reservations.filter((r) => {
      if (r.facilityId !== selectedFacilityId) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.officerName.toLowerCase().includes(q) ||
        r.dossierRef.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [reservations, selectedFacilityId, searchQuery]);

  // Group reservations by date string
  const reservationsByDate = React.useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const res of facilityReservations) {
      const list = map.get(res.date) || [];
      list.push(res);
      // Sort chronologically by startTime
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(res.date, list);
    }
    return map;
  }, [facilityReservations]);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Top Breadcrumb & Status Pill Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Facilities</span>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {facility.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Availability badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px]">
              Available for Booking
            </span>
          </div>

          {/* Capacity badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Capacity: {facility.capacity} {facility.capacityUnit}
            </span>
          </div>

          {/* Sector badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{facility.sector}</span>
          </div>
        </div>
      </div>

      {/* Facility Header Title & Calendar Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {facility.name} — Reservation Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {facility.description}
          </p>
        </div>

        {/* Date Navigation & View Mode */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={resetToToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white min-w-[150px] text-center">
            {monthName}
          </div>

          {/* Segmented View Switcher: Month / Week / Day */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-all ${
                  calendarMode === mode
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Key & Explanatory Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pb-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Status Key:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-emerald-800" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Pending Approval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-slate-400 dark:bg-slate-600" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Maintenance / Blocked</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Click any day slot or reservation badge to view authorization dossiers.</span>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {calendarMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px] lg:min-w-0">
              {/* Weekday Header Columns */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 py-2.5 uppercase tracking-wider">
                <div>MON</div>
                <div>TUE</div>
                <div>WED</div>
                <div>THU</div>
                <div>FRI</div>
                <div>SAT</div>
                <div>SUN</div>
              </div>

          {/* 7-column Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {monthGrid.map((cell) => {
              const dayBookings = reservationsByDate.get(cell.dateString) || [];

              return (
                <div
                  key={cell.dateString}
                  onClick={() => openCreateModal(cell.dateString)}
                  className={`min-h-[120px] lg:min-h-[140px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/30 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {/* Date Header Inside Cell */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {cell.isToday ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-md bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                            {cell.dayNumber}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
                            TODAY
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-xs font-semibold ${
                            cell.isCurrentMonth
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>
                      )}

                      {cell.monthLabel && (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                          {cell.monthLabel}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(cell.dateString);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-opacity"
                      title="Add reservation on this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reservations in cell */}
                  <div className="mt-1.5 space-y-1.5 flex-1 overflow-hidden">
                    {dayBookings.map((res) => {
                      const isConfirmed = res.status === 'confirmed';
                      const isPending = res.status === 'pending';
                      const isMaintenance = res.status === 'maintenance';

                      return (
                        <div
                          key={res.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDossierModal(res.id);
                          }}
                          className={`p-1.5 rounded-md text-left transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-2xs border-l-[3px] ${
                            isConfirmed
                              ? 'border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200'
                              : isPending
                              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200'
                              : 'border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-mono font-medium leading-none">
                            {res.startTime} - {res.endTime}
                          </div>
                          <div className="text-[12px] font-medium leading-tight truncate mt-0.5">
                            {res.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {calendarMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="font-semibold text-slate-800 dark:text-white text-sm">
              Week Schedule Matrix — October 13 to October 19, 2025
            </div>
            <div className="text-xs text-slate-500">Hourly Operating Window (07:00 - 21:00)</div>
          </div>
          <div className="grid grid-cols-8 divide-x divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-500">
              TIME
            </div>
            {['Mon 13', 'Tue 14', 'Wed 15 (Today)', 'Thu 16', 'Fri 17', 'Sat 18', 'Sun 19'].map(
              (day) => (
                <div
                  key={day}
                  className="p-2 text-center bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-700 dark:text-slate-300"
                >
                  {day}
                </div>
              )
            )}

            {/* Hourly slots */}
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="p-2.5 font-mono text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  {timeSlot}
                </div>
                {['2025-10-13', '2025-10-14', '2025-10-15', '2025-10-16', '2025-10-17', '2025-10-18', '2025-10-19'].map(
                  (dStr) => {
                    const match = facilityReservations.find(
                      (r) => r.date === dStr && r.startTime.startsWith(timeSlot.substring(0, 2))
                    );

                    return (
                      <div
                        key={dStr + timeSlot}
                        onClick={() => {
                          if (match) openDossierModal(match.id);
                          else openCreateModal(dStr);
                        }}
                        className="p-1 border-t border-slate-100 dark:border-slate-800 min-h-[60px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        {match && (
                          <div
                            className={`p-1.5 rounded text-left border-l-2 ${
                              match.status === 'confirmed'
                                ? 'border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                                : 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                            }`}
                          >
                            <div className="font-semibold text-[11px] truncate">{match.title}</div>
                            <div className="text-[10px] opacity-80">
                              {match.startTime}-{match.endTime}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {calendarMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Wednesday, October 15, 2025 (Operations Timeline)
              </div>
              <div className="text-xs text-slate-500 mt-1">
                2 Scheduled Missions • 192 Total Attendees • VIP Protocol Active
              </div>
            </div>
            <button
              onClick={() => openCreateModal('2025-10-15')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>

          <div className="space-y-3">
            {facilityReservations
              .filter((r) => r.date === '2025-10-15')
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => openDossierModal(res.id)}
                  className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                        {res.dossierRef}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        {res.status}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {res.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Officer: {res.officerRank} {res.officerName} • {res.department}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>
                        {res.startTime} - {res.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>
                        {res.attendeesCount} / {facility.capacity} pax
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>{res.clearanceLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
