import React from 'react';
import {
  Search,
  Download,
  Plus,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { useOperationsStore, MainNavTab } from '../store/useOperationsStore';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    openCreateModal,
    exportCsvData,
    theme,
    toggleTheme,
    notificationsCount,
    setMobileSidebarOpen,
  } = useOperationsStore();

  const [showNotificationMenu, setShowNotificationMenu] = React.useState(false);

  const tabs: { id: MainNavTab; label: string }[] = [
    { id: 'schedule', label: 'Schedule Matrix' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'logs', label: 'Master Logs' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reservations, assets, officer"
              className="w-full pl-9 pr-3 py-1.5 text-xs lg:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-full flex items-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-900 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 dark:bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Export Grid Button */}
          <button
            onClick={exportCsvData}
            title="Export Current Schedule to CSV"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export Grid</span>
          </button>

          {/* + Create Booking Button */}
          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs lg:text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create Booking</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs">
                <div className="font-semibold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span>Operational Alerts</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-mono">
                    1 New
                  </span>
                </div>
                <div className="py-2.5 space-y-2">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      Pending Authorization Required
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      DOS-2025-10645 Evening Volleyball League requires Director sign-off.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Dark Mode Support) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={() => {
              window.open(
                'https://github.com',
                '_blank',
                'noopener,noreferrer'
              );
            }}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            aria-label="Operations handbook"
            title="Operations Manual & Dossier Protocols"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 px-2 py-1 bg-slate-50/50 dark:bg-slate-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 text-xs font-medium rounded-md ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
