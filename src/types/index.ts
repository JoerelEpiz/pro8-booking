export type ReservationStatus = 'confirmed' | 'pending' | 'maintenance';

export type ClearanceLevel =
  | 'Level 1 - Public'
  | 'Level 2 - Departmental'
  | 'Level 3 - Restricted'
  | 'Level 4 - Command Only';

export interface Facility {
  id: string;
  name: string;
  capacity: number;
  capacityUnit: 'pax' | 'lanes';
  sector: string;
  status: 'available' | 'maintenance' | 'occupied';
  description: string;
  flooring: string;
  lighting: string;
  amenities: string[];
  iconType: 'building' | 'court' | 'target' | 'hall' | 'users' | 'shield' | 'truck' | 'crown';
}

export interface Reservation {
  id: string;
  dossierRef: string;
  facilityId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ReservationStatus;
  officerName: string;
  officerRank: string;
  officerBadge: string;
  department: string;
  purpose: string;
  attendeesCount: number;
  vipPresent: boolean;
  equipmentRequested: string[];
  clearanceLevel: ClearanceLevel;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  callsign: string;
  title: string;
  role: 'Director' | 'Operations Officer' | 'Auditor';
  initials: string;
  clearance: ClearanceLevel;
}

export type ActivityAction =
  | 'RESERVATION_CREATED'
  | 'RESERVATION_APPROVED'
  | 'RESERVATION_REJECTED'
  | 'RESERVATION_CANCELLED'
  | 'MAINTENANCE_SCHEDULED'
  | 'DOSSIER_VIEWED'
  | 'GRID_EXPORTED'
  | 'CAPACITY_OVERRIDE';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  facilityId: string;
  facilityName: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'security';
}
