import { Facility, Reservation } from '../types';

export interface CalendarDayCell {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  monthLabel?: string; // "SEP", "OCT", "NOV"
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0=Mon, ..., 6=Sun
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function checkBookingConflict(
  existingBookings: Reservation[],
  newDate: string,
  newStart: string,
  newEnd: string,
  facilityId: string,
  excludeBookingId?: string
): Reservation | null {
  const sameDayBookings = existingBookings.filter(
    (b) =>
      b.facilityId === facilityId &&
      b.date === newDate &&
      b.id !== excludeBookingId &&
      b.status !== 'maintenance'
  );

  for (const booking of sameDayBookings) {
    if (isTimeOverlapping(newStart, newEnd, booking.startTime, booking.endTime)) {
      return booking;
    }
  }

  return null;
}

export function validatePaxCapacity(
  facilityCapacity: number,
  attendeesCount: number
): { valid: boolean; message?: string } {
  if (attendeesCount <= 0) {
    return { valid: false, message: 'Attendees count must be greater than zero.' };
  }
  if (attendeesCount > facilityCapacity) {
    return {
      valid: false,
      message: `Requested ${attendeesCount} pax exceeds maximum facility capacity of ${facilityCapacity} pax.`,
    };
  }
  return { valid: true };
}

/**
 * Generates Monday-based 7-column month grid.
 * Month is 0-indexed (9 for October).
 */
export function generateMonthGrid(
  year: number,
  month: number,
  todayDateStr: string = '2025-10-15'
): CalendarDayCell[] {
  const cells: CalendarDayCell[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // JavaScript getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // In Monday-first calendar: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthIndex = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthLabel = new Date(prevMonthYear, prevMonthIndex, 1)
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const mStr = String(prevMonthIndex + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateString = `${prevMonthYear}-${mStr}-${dStr}`;

    cells.push({
      dateString,
      dayNumber: dayNum,
      monthLabel: prevMonthLabel,
      isCurrentMonth: false,
      isToday: dateString === todayDateStr,
      dayOfWeek: cells.length % 7,
    });
  }

  // Current month days
  const currentMonthLabel = firstDay
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateString = `${year}-${mStr}-${dStr}`;

    cells.push({
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayDateStr,
      dayOfWeek: cells.length % 7,
    });
  }

  // Next month leading days to complete the 35 or 42 grid
  const remainingCells = (7 - (cells.length % 7)) % 7;
  const nextMonthIndex = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthLabel = new Date(nextMonthYear, nextMonthIndex, 1)
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  for (let d = 1; d <= remainingCells; d++) {
    const mStr = String(nextMonthIndex + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateString = `${nextMonthYear}-${mStr}-${dStr}`;

    cells.push({
      dateString,
      dayNumber: d,
      monthLabel: nextMonthLabel,
      isCurrentMonth: false,
      isToday: dateString === todayDateStr,
      dayOfWeek: cells.length % 7,
    });
  }

  return cells;
}

export function generateDossierRef(year: number = 2025): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DOS-${year}-${rand}`;
}
