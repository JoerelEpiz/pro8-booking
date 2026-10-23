import React from 'react';
import {
  Building2,
  Calendar,
  Layers,
  Crosshair,
  Sparkles,
  Users,
  Shield,
  Truck,
  Crown,
  Settings,
  History,
  Plus,
  X,
} from 'lucide-react';
import { useOperationsStore } from '../store/useOperationsStore';
import { AVAILABLE_USERS } from '../data/seedData';

const FACILITY_ICONS: Record<string, React.ElementType> = {
  court: Calendar,
  building: Building2,
  target: Crosshair,
  hall: Layers,
  users: Users,
  shield: Shield,
  truck: Truck,
  crown: Crown,
};

export const Sidebar: React.FC = () => {
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    openCreateModal,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
  } = useOperationsStore();

  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
                Estate Governan...
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Facility Operations
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  LIVE
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              openCreateModal();
              setMobileSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>

        {/* Facilities Nav List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Primary Facilities
          </div>
          {facilities.map((facility) => {
            const Icon = FACILITY_ICONS[facility.iconType] || Building2;
            const isSelected = selectedFacilityId === facility.id;

            return (
              <button
                key={facility.id}
                onClick={() => {
                  setSelectedFacilityId(facility.id);
                  if (activeTab !== 'schedule') setActiveTab('schedule');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`${
                      isSelected
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="truncate text-left text-[13px]">{facility.name}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono shrink-0 ${
                    isSelected
                      ? 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {facility.capacity} {facility.capacityUnit}
                </span>
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            System & Governance
          </div>

          <button
            onClick={() => {
              setActiveTab('analytics');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-[13px]">Facility Settings</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'logs'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-[13px]">System Audit</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs ring-1 ring-slate-300 dark:ring-slate-600 shrink-0">
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.title}
              </div>
            </div>
          </button>

          {/* User switch popup */}
          {showUserMenu && (
            <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Operational Persona
              </div>
              {AVAILABLE_USERS.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => {
                    setCurrentUser(usr);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left ${
                    usr.id === currentUser.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {usr.initials}
                  </div>
                  <div className="truncate">
                    <div>{usr.name}</div>
                    <div className="text-[10px] text-slate-400">{usr.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
