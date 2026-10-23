import { db } from './index.ts';
import { reservations, facilities, activityLogs, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Reservation, ActivityLog } from '../types/index.ts';

// 1. Facilities
export async function getDbFacilities() {
  try {
    const rows = await db.select().from(facilities);
    return rows.map((r) => ({
      ...r,
      amenities: JSON.parse(r.amenities || '[]') as string[],
    }));
  } catch (error) {
    console.error('Failed to get facilities from DB:', error);
    throw new Error('Database query failed for facilities.', { cause: error });
  }
}

// 2. Reservations
export async function getDbReservations(): Promise<Reservation[]> {
  try {
    const rows = await db.select().from(reservations);
    return rows.map((r) => ({
      id: r.id,
      dossierRef: r.dossierRef,
      facilityId: r.facilityId,
      title: r.title,
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status as 'confirmed' | 'pending' | 'maintenance',
      officerName: r.officerName,
      officerRank: r.officerRank,
      officerBadge: r.officerBadge,
      department: r.department,
      purpose: r.purpose,
      attendeesCount: r.attendeesCount,
      vipPresent: r.vipPresent,
      equipmentRequested: JSON.parse(r.equipmentRequested || '[]') as string[],
      clearanceLevel: r.clearanceLevel as any,
      approvedBy: r.approvedBy || undefined,
      approvalDate: r.approvalDate || undefined,
      notes: r.notes || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get reservations from DB:', error);
    throw new Error('Database query failed for reservations.', { cause: error });
  }
}

export async function createDbReservation(data: {
  id: string;
  dossierRef: string;
  facilityId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  officerName: string;
  officerRank: string;
  officerBadge: string;
  department: string;
  purpose: string;
  attendeesCount: number;
  vipPresent: boolean;
  equipmentRequested: string[];
  clearanceLevel: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}) {
  try {
    const [inserted] = await db
      .insert(reservations)
      .values({
        id: data.id,
        dossierRef: data.dossierRef,
        facilityId: data.facilityId,
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        officerName: data.officerName,
        officerRank: data.officerRank,
        officerBadge: data.officerBadge,
        department: data.department,
        purpose: data.purpose,
        attendeesCount: data.attendeesCount,
        vipPresent: data.vipPresent,
        equipmentRequested: JSON.stringify(data.equipmentRequested || []),
        clearanceLevel: data.clearanceLevel,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate,
        notes: data.notes,
      })
      .returning();

    return {
      ...inserted,
      equipmentRequested: JSON.parse(inserted.equipmentRequested || '[]') as string[],
    };
  } catch (error) {
    console.error('Failed to insert reservation into DB:', error);
    throw new Error('Database insert failed for reservation.', { cause: error });
  }
}

export async function updateDbReservation(
  id: string,
  updates: Partial<{
    title: string;
    status: string;
    date: string;
    startTime: string;
    endTime: string;
    attendeesCount: number;
    vipPresent: boolean;
    approvedBy: string;
    approvalDate: string;
    notes: string;
  }>
) {
  try {
    const [updated] = await db
      .update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();

    if (!updated) return null;

    return {
      ...updated,
      equipmentRequested: JSON.parse(updated.equipmentRequested || '[]') as string[],
    };
  } catch (error) {
    console.error(`Failed to update reservation ${id} in DB:`, error);
    throw new Error('Database update failed for reservation.', { cause: error });
  }
}

export async function deleteDbReservation(id: string) {
  try {
    const [deleted] = await db
      .delete(reservations)
      .where(eq(reservations.id, id))
      .returning();

    return deleted || null;
  } catch (error) {
    console.error(`Failed to delete reservation ${id} from DB:`, error);
    throw new Error('Database delete failed for reservation.', { cause: error });
  }
}

// 3. Activity Logs
export async function getDbActivityLogs(): Promise<ActivityLog[]> {
  try {
    const rows = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp));

    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      userId: r.userId,
      userName: r.userName,
      userRole: r.userRole,
      action: r.action as any,
      facilityId: r.facilityId,
      facilityName: r.facilityName,
      details: r.details,
      ipAddress: r.ipAddress,
      severity: r.severity as 'info' | 'warning' | 'security',
    }));
  } catch (error) {
    console.error('Failed to get activity logs from DB:', error);
    throw new Error('Database query failed for activity logs.', { cause: error });
  }
}

export async function createDbActivityLog(log: ActivityLog) {
  try {
    const [inserted] = await db
      .insert(activityLogs)
      .values({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        userName: log.userName,
        userRole: log.userRole,
        action: log.action,
        facilityId: log.facilityId,
        facilityName: log.facilityName,
        details: log.details,
        ipAddress: log.ipAddress,
        severity: log.severity,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Failed to insert activity log into DB:', error);
    throw new Error('Database insert failed for activity log.', { cause: error });
  }
}
