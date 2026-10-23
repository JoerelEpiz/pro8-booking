import { create } from 'zustand';
import {
  Facility,
  Reservation,
  User,
  ActivityLog,
  ReservationStatus,
  ClearanceLevel,
} from '../types';
import {
  INITIAL_FACILITIES,
  INITIAL_RESERVATIONS,
  CURRENT_USER,
  INITIAL_ACTIVITY_LOGS,
} from '../data/seedData';
import { generateDossierRef } from '../utils/calendar';

export type MainNavTab = 'schedule' | 'analytics' | 'logs';
export type CalendarViewMode = 'month' | 'week' | 'day';

interface OperationsState {
  // Navigation & View
  activeTab: MainNavTab;
  calendarMode: CalendarViewMode;
  selectedFacilityId: string;
  currentDate: Date; // October 2025 by default
  searchQuery: string;
  theme: 'light' | 'dark';
  mobileSidebarOpen: boolean;

  // Active Modals & Selection
  isCreateModalOpen: boolean;
  selectedReservationId: string | null;
  createModalDefaultDate: string | null;

  // Domain Entities
  facilities: Facility[];
  reservations: Reservation[];
  currentUser: User;
  logs: ActivityLog[];
  notificationsCount: number;

  // Actions
  setActiveTab: (tab: MainNavTab) => void;
  setCalendarMode: (mode: CalendarViewMode) => void;
  setSelectedFacilityId: (id: string) => void;
  setCurrentDate: (date: Date) => void;
  navigateMonth: (delta: number) => void;
  resetToToday: () => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Reservation Actions
  openCreateModal: (defaultDate?: string) => void;
  closeCreateModal: () => void;
  openDossierModal: (id: string) => void;
  closeDossierModal: () => void;

  createReservation: (
    data: Omit<Reservation, 'id' | 'dossierRef' | 'createdAt' | 'approvedBy' | 'approvalDate'>
  ) => { success: boolean; error?: string };

  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  deleteReservation: (id: string, reason?: string) => void;
  setCurrentUser: (user: User) => void;
  exportCsvData: () => void;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  activeTab: 'schedule',
  calendarMode: 'month',
  selectedFacilityId: 'covered-court',
  currentDate: new Date(2025, 9, 15), // October 15, 2025
  searchQuery: '',
  theme: 'light',
  mobileSidebarOpen: false,

  isCreateModalOpen: false,
  selectedReservationId: null,
  createModalDefaultDate: null,

  facilities: INITIAL_FACILITIES,
  reservations: INITIAL_RESERVATIONS,
  currentUser: CURRENT_USER,
  logs: INITIAL_ACTIVITY_LOGS,
  notificationsCount: 1,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setCalendarMode: (mode) => set({ calendarMode: mode }),

  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),

  setCurrentDate: (date) => set({ currentDate: date }),

  navigateMonth: (delta) =>
    set((state) => {
      const nextDate = new Date(state.currentDate);
      nextDate.setMonth(nextDate.getMonth() + delta);
      return { currentDate: nextDate };
    }),

  resetToToday: () => set({ currentDate: new Date(2025, 9, 15) }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (nextTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      return { theme: nextTheme };
    }),

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  openCreateModal: (defaultDate) =>
    set({
      isCreateModalOpen: true,
      createModalDefaultDate: defaultDate || '2025-10-15',
    }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      createModalDefaultDate: null,
    }),

  openDossierModal: (id) =>
    set((state) => {
      // Add log
      const res = state.reservations.find((r) => r.id === id);
      const facility = state.facilities.find((f) => f.id === res?.facilityId);
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRole: state.currentUser.role,
        action: 'DOSSIER_VIEWED',
        facilityId: res?.facilityId || '',
        facilityName: facility?.name || 'Facility',
        details: `Inspected authorization dossier ${res?.dossierRef || id} for "${res?.title || 'Unknown'}".`,
        ipAddress: '10.240.12.4',
        severity: 'info',
      };

      return {
        selectedReservationId: id,
        logs: [newLog, ...state.logs],
      };
    }),

  closeDossierModal: () => set({ selectedReservationId: null }),

  createReservation: (data) => {
    const state = get();
    const facility = state.facilities.find((f) => f.id === data.facilityId);

    if (data.attendeesCount > (facility?.capacity || 999)) {
      return {
        success: false,
        error: `Exceeds facility max capacity (${facility?.capacity} ${facility?.capacityUnit})`,
      };
    }

    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      dossierRef: generateDossierRef(2025),
      createdAt: new Date().toISOString(),
      approvedBy: data.status === 'confirmed' ? state.currentUser.name : undefined,
      approvalDate: data.status === 'confirmed' ? '2025-10-15' : undefined,
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRole: state.currentUser.role,
      action: 'RESERVATION_CREATED',
      facilityId: data.facilityId,
      facilityName: facility?.name || 'Facility',
      details: `Created reservation ${newRes.dossierRef} "${newRes.title}" (${newRes.date} ${newRes.startTime}-${newRes.endTime}) with status ${newRes.status.toUpperCase()}.`,
      ipAddress: '10.240.12.4',
      severity: 'info',
    };

    set({
      reservations: [newRes, ...state.reservations],
      logs: [newLog, ...state.logs],
      isCreateModalOpen: false,
    });

    return { success: true };
  },

  updateReservationStatus: (id, status) => {
    set((state) => {
      const res = state.reservations.find((r) => r.id === id);
      if (!res) return state;

      const facility = state.facilities.find((f) => f.id === res.facilityId);
      const isApproved = status === 'confirmed';
      const updatedRes: Reservation = {
        ...res,
        status,
        approvedBy: isApproved ? state.currentUser.name : res.approvedBy,
        approvalDate: isApproved ? '2025-10-15' : res.approvalDate,
      };

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRole: state.currentUser.role,
        action: isApproved ? 'RESERVATION_APPROVED' : 'RESERVATION_REJECTED',
        facilityId: res.facilityId,
        facilityName: facility?.name || 'Facility',
        details: `Updated reservation ${res.dossierRef} status to ${status.toUpperCase()} by ${state.currentUser.name}.`,
        ipAddress: '10.240.12.4',
        severity: isApproved ? 'info' : 'warning',
      };

      return {
        reservations: state.reservations.map((r) => (r.id === id ? updatedRes : r)),
        logs: [newLog, ...state.logs],
      };
    });
  },

  deleteReservation: (id, reason) => {
    set((state) => {
      const res = state.reservations.find((r) => r.id === id);
      if (!res) return state;

      const facility = state.facilities.find((f) => f.id === res.facilityId);
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRole: state.currentUser.role,
        action: 'RESERVATION_CANCELLED',
        facilityId: res.facilityId,
        facilityName: facility?.name || 'Facility',
        details: `Revoked authorization dossier ${res.dossierRef} "${res.title}". Reason: ${reason || 'Operational rescheduling'}.`,
        ipAddress: '10.240.12.4',
        severity: 'warning',
      };

      return {
        reservations: state.reservations.filter((r) => r.id !== id),
        selectedReservationId: null,
        logs: [newLog, ...state.logs],
      };
    });
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  exportCsvData: () => {
    const state = get();
    const facility = state.facilities.find((f) => f.id === state.selectedFacilityId);
    const relevantReservations = state.reservations.filter(
      (r) => r.facilityId === state.selectedFacilityId
    );

    const headers = [
      'Dossier Ref',
      'Title',
      'Facility',
      'Date',
      'Start Time',
      'End Time',
      'Status',
      'Officer',
      'Department',
      'Pax',
      'Clearance',
      'VIP Present',
    ];

    const rows = relevantReservations.map((r) => [
      r.dossierRef,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${facility?.name || ''}"`,
      r.date,
      r.startTime,
      r.endTime,
      r.status,
      `"${r.officerName}"`,
      `"${r.department}"`,
      r.attendeesCount,
      r.clearanceLevel,
      r.vipPresent ? 'YES' : 'NO',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Estate_Governance_${facility?.name.replace(/\s+/g, '_')}_Schedule.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRole: state.currentUser.role,
      action: 'GRID_EXPORTED',
      facilityId: state.selectedFacilityId,
      facilityName: facility?.name || 'Facility',
      details: `Exported ${relevantReservations.length} records for ${facility?.name} to CSV.`,
      ipAddress: '10.240.12.4',
      severity: 'info',
    };
    set({ logs: [newLog, ...state.logs] });
  },
}));
