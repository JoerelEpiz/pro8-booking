import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (synced with Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  callsign: text('callsign'),
  role: text('role').notNull().default('Director'),
  initials: text('initials').notNull().default('DO'),
  clearance: text('clearance').notNull().default('Level 4 - Command Only'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Facilities table
export const facilities = pgTable('facilities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  capacityUnit: text('capacity_unit').notNull().default('pax'),
  sector: text('sector').notNull(),
  status: text('status').notNull().default('available'),
  description: text('description').notNull(),
  flooring: text('flooring').notNull(),
  lighting: text('lighting').notNull(),
  amenities: text('amenities').notNull().default('[]'), // JSON string
  iconType: text('icon_type').notNull(),
});

// Reservations / Dossiers table
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  dossierRef: text('dossier_ref').notNull().unique(),
  facilityId: text('facility_id')
    .notNull()
    .references(() => facilities.id),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(), // HH:mm
  status: text('status').notNull().default('pending'),
  officerName: text('officer_name').notNull(),
  officerRank: text('officer_rank').notNull(),
  officerBadge: text('officer_badge').notNull(),
  department: text('department').notNull(),
  purpose: text('purpose').notNull(),
  attendeesCount: integer('attendees_count').notNull(),
  vipPresent: boolean('vip_present').default(false).notNull(),
  equipmentRequested: text('equipment_requested').notNull().default('[]'), // JSON string
  clearanceLevel: text('clearance_level').notNull(),
  approvedBy: text('approved_by'),
  approvalDate: text('approval_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity Audit Logs table
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  facilityId: text('facility_id').notNull(),
  facilityName: text('facility_name').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address').notNull(),
  severity: text('severity').notNull().default('info'),
});

// Relationships
export const facilitiesRelations = relations(facilities, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  facility: one(facilities, {
    fields: [reservations.facilityId],
    references: [facilities.id],
  }),
}));
