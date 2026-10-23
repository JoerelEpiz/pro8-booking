import React from 'react';
import {
  X,
  Shield,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Trash2,
  FileCheck,
  Building,
} from 'lucide-react';
import { useOperationsStore } from '../store/useOperationsStore';

export const DossierDetailModal: React.FC = () => {
  const {
    selectedReservationId,
    closeDossierModal,
    reservations,
    facilities,
    updateReservationStatus,
    deleteReservation,
    currentUser,
  } = useOperationsStore();

  if (!selectedReservationId) return null;

  const reservation = reservations.find((r) => r.id === selectedReservationId);
  if (!reservation) return null;

  const facility = facilities.find((f) => f.id === reservation.facilityId);

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = () => {
    updateReservationStatus(reservation.id, 'confirmed');
  };

  const handleReject = () => {
    deleteReservation(reservation.id, 'Rejected by Operations Command');
  };

  const handleRevoke = () => {
    if (confirm('Revoke this operational reservation authorization?')) {
      deleteReservation(reservation.id, 'Revoked by Director of Operations');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header with Dossier Stamp */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900 text-emerald-200 flex items-center justify-center font-mono font-bold text-sm">
              DOS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {reservation.dossierRef}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    reservation.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : reservation.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Authorization Dossier • Estate Operations Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Dossier"
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={closeDossierModal}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Body */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Mission Title & Facility */}
          <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {reservation.title}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                {facility?.name}
              </span>
              <span>•</span>
              <span>{facility?.sector}</span>
              <span>•</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {reservation.clearanceLevel}
              </span>
            </div>
          </div>

          {/* Time & Attendance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Date</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm mt-1">
                {reservation.date}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Operating Window</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm mt-1 font-mono">
                {reservation.startTime} - {reservation.endTime}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Attendees (Pax)</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm mt-1">
                {reservation.attendeesCount} / {facility?.capacity} {facility?.capacityUnit}
              </div>
            </div>
          </div>

          {/* Requesting Officer Information */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              Requesting Authority & Custodian
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400">Officer:</span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {reservation.officerRank} {reservation.officerName}
                </span>
                <span className="ml-1 text-[11px] font-mono text-slate-500">
                  ({reservation.officerBadge})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Department:</span>{' '}
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {reservation.department}
                </span>
              </div>
              <div>
                <span className="text-slate-400">VIP Protocol:</span>{' '}
                <span
                  className={`font-semibold ${
                    reservation.vipPresent ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {reservation.vipPresent ? 'ACTIVE (Requires Security Escort)' : 'Standard Civilian / Force'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Approved By:</span>{' '}
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {reservation.approvedBy || 'Pending Command Signature'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Purpose */}
          <div className="space-y-1.5">
            <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              Operational Directive & Purpose
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {reservation.purpose}
            </p>
          </div>

          {/* Equipment Requested */}
          {reservation.equipmentRequested && reservation.equipmentRequested.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Requisitioned Equipment & Assets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reservation.equipmentRequested.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{eq}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operational Notes */}
          {reservation.notes && (
            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-[11px]">
              <span className="font-semibold">Security Note:</span> {reservation.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div>
            <button
              onClick={handleRevoke}
              className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-800 text-xs font-semibold py-1.5 px-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Revoke Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {reservation.status === 'pending' && (
              <>
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Approve Authorization</span>
                </button>
              </>
            )}

            <button
              onClick={closeDossierModal}
              className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
