import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeToMinutes,
  isTimeOverlapping,
  validatePaxCapacity,
  generateMonthGrid,
  checkBookingConflict,
} from './calendar';
import { Reservation } from '../types';

test('parseTimeToMinutes converts HH:mm accurately', () => {
  assert.equal(parseTimeToMinutes('00:00'), 0);
  assert.equal(parseTimeToMinutes('09:30'), 570);
  assert.equal(parseTimeToMinutes('14:00'), 840);
  assert.equal(parseTimeToMinutes('23:59'), 1439);
});

test('isTimeOverlapping correctly detects clashes and back-to-back intervals', () => {
  // Clashing slots
  assert.equal(isTimeOverlapping('10:00', '12:00', '11:00', '13:00'), true);
  // Inside another slot
  assert.equal(isTimeOverlapping('09:00', '17:00', '10:00', '11:00'), true);
  // Distinct separate slots
  assert.equal(isTimeOverlapping('08:00', '10:00', '11:00', '12:00'), false);
  // Back-to-back slots (exact boundary) - no overlap
  assert.equal(isTimeOverlapping('10:00', '11:30', '11:30', '13:00'), false);
});

test('validatePaxCapacity enforces facility constraints', () => {
  const allowed = validatePaxCapacity(150, 120);
  assert.equal(allowed.valid, true);

  const exact = validatePaxCapacity(150, 150);
  assert.equal(exact.valid, true);

  const exceeded = validatePaxCapacity(150, 151);
  assert.equal(exceeded.valid, false);
  assert.match(exceeded.message || '', /exceeds maximum facility capacity/);

  const zeroOrNegative = validatePaxCapacity(150, 0);
  assert.equal(zeroOrNegative.valid, false);
});

test('generateMonthGrid outputs exact October 2025 calendar matching reference image', () => {
  // Month 9 is October (0-indexed)
  const grid = generateMonthGrid(2025, 9, '2025-10-15');

  // October 2025 starts on Wednesday (index 2). Preceded by Mon Sep 29, Tue Sep 30.
  assert.equal(grid[0].dateString, '2025-09-29');
  assert.equal(grid[0].dayNumber, 29);
  assert.equal(grid[0].monthLabel, 'SEP');
  assert.equal(grid[0].isCurrentMonth, false);

  assert.equal(grid[1].dateString, '2025-09-30');
  assert.equal(grid[1].dayNumber, 30);
  assert.equal(grid[1].monthLabel, 'SEP');

  // First day of October
  assert.equal(grid[2].dateString, '2025-10-01');
  assert.equal(grid[2].dayNumber, 1);
  assert.equal(grid[2].isCurrentMonth, true);

  // Oct 15 is Today
  const todayCell = grid.find((c) => c.dateString === '2025-10-15');
  assert.ok(todayCell);
  assert.equal(todayCell.isToday, true);

  // Last days: Oct 31 is followed by Sat Nov 1 and Sun Nov 2
  const lastCell = grid[grid.length - 1];
  assert.equal(lastCell.dateString, '2025-11-02');
  assert.equal(lastCell.monthLabel, 'NOV');
  assert.equal(grid.length, 35); // Exactly 5 rows of 7 days
});

test('checkBookingConflict warns on overlapping bookings for same facility and date', () => {
  const sampleBookings: Reservation[] = [
    {
      id: 'res-1',
      dossierRef: 'DOS-2025-1001',
      facilityId: 'covered-court',
      title: 'Inter-Agency Basketball',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '12:30',
      status: 'confirmed',
      officerName: 'Capt. Sarah Chen',
      officerRank: 'Captain',
      officerBadge: 'SEC-892',
      department: 'Joint Task Force - Athletics',
      purpose: 'Inter-Agency basketball training',
      attendeesCount: 45,
      vipPresent: false,
      equipmentRequested: ['Basketball racks', 'Electronic Scoreboard'],
      clearanceLevel: 'Level 2 - Departmental',
      createdAt: '2025-10-01T08:00:00Z',
    },
  ];

  const clash = checkBookingConflict(
    sampleBookings,
    '2025-10-15',
    '11:00',
    '13:00',
    'covered-court'
  );
  assert.ok(clash);
  assert.equal(clash?.id, 'res-1');

  const nonClash = checkBookingConflict(
    sampleBookings,
    '2025-10-15',
    '14:00',
    '16:00',
    'covered-court'
  );
  assert.equal(nonClash, null);
});
