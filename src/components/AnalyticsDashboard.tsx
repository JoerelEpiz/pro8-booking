import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShieldAlert,
  CalendarCheck2,
  Clock,
  Layers,
  Activity,
} from 'lucide-react';
import { useOperationsStore } from '../store/useOperationsStore';

const STATUS_COLORS: Record<string, string> = {
  Confirmed: '#047857', // emerald-700
  'Pending Approval': '#f59e0b', // amber-500
  'Maintenance / Blocked': '#64748b', // slate-500
};

export const AnalyticsDashboard: React.FC = () => {
  const { facilities, reservations, theme } = useOperationsStore();
  const [timeRange, setTimeRange] = React.useState<'month' | 'quarter' | 'year'>('month');

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // 1. Facility Utilization Data
  const facilityUtilizationData = React.useMemo(() => {
    return facilities.map((fac) => {
      const facBookings = reservations.filter((r) => r.facilityId === fac.id);
      const totalPax = facBookings.reduce((sum, r) => sum + r.attendeesCount, 0);
      return {
        name: fac.name,
        bookingsCount: facBookings.length,
        attendees: totalPax,
        capacity: fac.capacity,
      };
    });
  }, [facilities, reservations]);

  // 2. Status Breakdown
  const statusData = React.useMemo(() => {
    const counts = {
      Confirmed: 0,
      'Pending Approval': 0,
      'Maintenance / Blocked': 0,
    };

    reservations.forEach((r) => {
      if (r.status === 'confirmed') counts.Confirmed++;
      else if (r.status === 'pending') counts['Pending Approval']++;
      else if (r.status === 'maintenance') counts['Maintenance / Blocked']++;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservations]);

  // 3. Hourly Peak Operational Window Distribution
  const hourlyTrafficData = [
    { hour: '07:00 - 09:00', bookings: 2, attendees: 145 },
    { hour: '09:00 - 11:00', bookings: 4, attendees: 210 },
    { hour: '11:00 - 13:00', bookings: 5, attendees: 290 },
    { hour: '13:00 - 15:00', bookings: 6, attendees: 380 },
    { hour: '15:00 - 17:00', bookings: 4, attendees: 195 },
    { hour: '17:00 - 19:00', bookings: 5, attendees: 240 },
    { hour: '19:00 - 21:00', bookings: 3, attendees: 150 },
  ];

  // 4. Department Utilization
  const departmentData = [
    { dept: 'Athletics & Fitness', reservations: 6, pax: 480 },
    { dept: 'Facilities Engineering', reservations: 2, pax: 24 },
    { dept: 'Security Liaison', reservations: 3, pax: 260 },
    { dept: 'Tactical Unit', reservations: 2, pax: 70 },
    { dept: 'Command HQ', reservations: 4, pax: 420 },
    { dept: 'Community Outreach', reservations: 2, pax: 190 },
  ];

  const totalAttendees = reservations.reduce((sum, r) => sum + r.attendeesCount, 0);
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Analytics & Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time facility utilization, foot traffic trends, security compliance, and booking velocity.
          </p>
        </div>

        {/* Time Filter */}
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs self-start sm:self-auto">
          {(['month', 'quarter', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                timeRange === r
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r === 'month' ? 'October 2025' : r === 'quarter' ? 'Q4 2025' : 'Fiscal 2025'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Reservations
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {reservations.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs prev period</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Pax Throughput
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalAttendees.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              <Users className="w-3.5 h-3.5" />
              <span>Avg 82 pax / event</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Confirmed Ratio
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {Math.round((confirmedCount / (reservations.length || 1)) * 100)}%
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{confirmedCount} dossiers cleared</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Clearance & Integrity
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              100%
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>0 Security Violations</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Facility Occupancy & Pax Distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                Facility Footprint & Booked Pax
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total personnel attendance grouped by facility complex
              </div>
            </div>
            <div className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
              Live Metrics
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={facilityUtilizationData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={textColor}
                  fontSize={11}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attendees" fill="#047857" radius={[4, 4, 0, 0]} name="Attendees (Pax)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hourly Traffic & Peak Operating Hours */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                Operational Load by Operating Window
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Peak usage hours across all active facilities
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>07:00 - 21:00</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyTrafficData}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="hour" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendees"
                  stroke="#047857"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPax)"
                  name="Attendees"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Reservation Status Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-base">
              Authorization Status Breakdown
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Confirmed, pending vetting, and maintenance closures
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Department / Bureau Allocation */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-base">
              Departmental Booking Share
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total reservations logged per agency division
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={departmentData}
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={11} />
                <YAxis
                  dataKey="dept"
                  type="category"
                  stroke={textColor}
                  fontSize={11}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="reservations"
                  fill="#0284c7"
                  radius={[0, 4, 4, 0]}
                  name="Bookings"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
