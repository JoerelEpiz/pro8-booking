/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ScheduleMatrixView } from './components/ScheduleMatrixView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MasterLogsView } from './components/MasterLogsView';
import { CreateReservationModal } from './components/CreateReservationModal';
import { DossierDetailModal } from './components/DossierDetailModal';
import { useOperationsStore } from './store/useOperationsStore';

export default function App() {
  const { activeTab, theme } = useOperationsStore();

  // Apply dark mode class to html document on mount
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col pb-12">
          {activeTab === 'schedule' && <ScheduleMatrixView />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'logs' && <MasterLogsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <CreateReservationModal />
      <DossierDetailModal />
    </div>
  );
}
