import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Shield,
  Check,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useOperationsStore } from '../store/useOperationsStore';
import { ClearanceLevel, ReservationStatus } from '../types';
import { checkBookingConflict, validatePaxCapacity } from '../utils/calendar';

const COMMON_EQUIPMENT = [
  'Dual Electronic Scoreboards',
  'PA Audio System & Microphones',
  'VIP Reserved Bleachers',
  'Medical Defibrillator & First Aid',
  'Locker Room Access Keys',
  'Ball Racks & Court Dividing Nets',
  'Projector & Video Uplink',
  'Air Conditioning Boost',
];

export const CreateReservationModal: React.FC = () => {
  const {
    isCreateModalOpen,
    closeCreateModal,
    facilities,
    selectedFacilityId,
    createReservation,
    reservations,
    createModalDefaultDate,
    currentUser,
  } = useOperationsStore();

  const [title, setTitle] = React.useState('');
  const [facilityId, setFacilityId] = React.useState(selectedFacilityId);
  const [date, setDate] = React.useState(createModalDefaultDate || '2025-10-15');
  const [startTime, setStartTime] = React.useState('14:00');
  const [endTime, setEndTime] = React.useState('16:00');
  const [attendeesCount, setAttendeesCount] = React.useState(35);
  const [officerName, setOfficerName] = React.useState(currentUser.name);
  const [officerRank, setOfficerRank] = React.useState('Captain');
  const [officerBadge, setOfficerBadge] = React.useState('SEC-512');
  const [department, setDepartment] = React.useState('Joint Task Force - Athletics');
  const [purpose, setPurpose] = React.useState('');
  const [clearanceLevel, setClearanceLevel] = React.useState<ClearanceLevel>('Level 1 - Public');
  const [vipPresent, setVipPresent] = React.useState(false);
  const [selectedEquipment, setSelectedEquipment] = React.useState<string[]>([
    'PA Audio System & Microphones',
  ]);
  const [status, setStatus] = React.useState<ReservationStatus>('confirmed');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync date when defaultDate changes
  React.useEffect(() => {
    if (createModalDefaultDate) {
      setDate(createModalDefaultDate);
    }
  }, [createModalDefaultDate]);

  // Sync facilityId with active facility when modal opens
  React.useEffect(() => {
    setFacilityId(selectedFacilityId);
  }, [selectedFacilityId, isCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const facility = facilities.find((f) => f.id === facilityId) || facilities[0];

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please provide an event / reservation title.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('End time must be after start time.');
      return;
    }

    // Capacity validation
    const capacityCheck = validatePaxCapacity(facility.capacity, attendeesCount);
    if (!capacityCheck.valid) {
      setErrorMessage(capacityCheck.message || 'Capacity exceeded.');
      return;
    }

    // Overlap validation
    const conflict = checkBookingConflict(
      reservations,
      date,
      startTime,
      endTime,
      facilityId
    );

    if (conflict) {
      setErrorMessage(
        `Time conflict: Overlaps with existing booking "${conflict.title}" (${conflict.startTime}-${conflict.endTime}).`
      );
      return;
    }

    const result = createReservation({
      facilityId,
      title: title.trim(),
      date,
      startTime,
      endTime,
      status,
      officerName: officerName.trim(),
      officerRank: officerRank.trim(),
      officerBadge: officerBadge.trim(),
      department: department.trim(),
      purpose: purpose.trim() || 'General facility operations and routine scheduling.',
      attendeesCount,
      vipPresent,
      equipmentRequested: selectedEquipment,
      clearanceLevel,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to submit reservation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Create Reservation Dossier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issue authorization credentials for estate asset scheduling
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title & Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Reservation Title / Mission Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Regional Volleyball Tournament"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Facility
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.capacity} {f.capacityUnit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Scheduled Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Officer Details & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Requesting Officer *
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Department / Bureau
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Attendees (Pax) *</span>
                <span className="text-[10px] text-slate-400">
                  Max: {facility.capacity}
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={facility.capacity}
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Clearance & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Security Clearance Level
              </label>
              <select
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              >
                <option value="Level 1 - Public">Level 1 - Public</option>
                <option value="Level 2 - Departmental">Level 2 - Departmental</option>
                <option value="Level 3 - Restricted">Level 3 - Restricted</option>
                <option value="Level 4 - Command Only">Level 4 - Command Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              >
                <option value="confirmed">Confirmed (Director Pre-Approved)</option>
                <option value="pending">Pending Approval</option>
                <option value="maintenance">Maintenance / Blocked</option>
              </select>
            </div>
          </div>

          {/* VIP Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="vip"
              checked={vipPresent}
              onChange={(e) => setVipPresent(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300"
            />
            <label htmlFor="vip" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              VIP / Dignitary Delegation Protocol (requires East Gate vehicle clearance)
            </label>
          </div>

          {/* Equipment Checkboxes */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Operational Equipment Requisition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_EQUIPMENT.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleEquipment(item)}
                  className={`p-2 rounded-lg text-left text-xs border transition-colors flex items-center justify-between ${
                    selectedEquipment.includes(item)
                      ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{item}</span>
                  {selectedEquipment.includes(item) && (
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose & Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Operational Purpose & Dossier Justification
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="State the objective, mission directives, or special handling instructions..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-medium shadow-xs"
            >
              Issue Authorization Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
