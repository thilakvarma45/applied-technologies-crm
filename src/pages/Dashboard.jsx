import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentJobs from '../components/dashboard/RecentJobs';
import StatusOverview from '../components/dashboard/StatusOverview';
import RevenueOverview from '../components/dashboard/RevenueOverview';
import { calculateFinancialMetrics, formatCurrency } from '../utils/paymentUtils';
import { isToday } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { customers, navigateTo, isLiveGoogleSheet } = useApp();

  // Metrics calculations
  const totalJobs = customers.length;
  const todayJobsCount = customers.filter((c) => isToday(c.date)).length;
  const pendingCount = customers.filter(
    (c) => c.status === 'Pending' || c.status === 'In Progress'
  ).length;
  const completedCount = customers.filter((c) => c.status === 'Completed').length;

  const financial = calculateFinancialMetrics(customers);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Service Workshop Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time shop metrics synced with your workshop Google Sheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('add-customer')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* 7 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers / Jobs"
          value={totalJobs}
          subtitle="All registered repair records"
          icon={Users}
          color="blue"
          onClick={() => navigateTo('all-jobs')}
        />

        <StatCard
          title="Today's New Jobs"
          value={todayJobsCount}
          subtitle="Registered today"
          icon={Calendar}
          color="purple"
          onClick={() => navigateTo('all-jobs')}
        />

        <StatCard
          title="Pending Repairs"
          value={pendingCount}
          subtitle="Awaiting diagnostics or repair"
          icon={Clock}
          color="amber"
          onClick={() => navigateTo('pending')}
        />

        <StatCard
          title="Completed Jobs"
          value={completedCount}
          subtitle="Repairs tested and ready"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigateTo('completed')}
        />

        <StatCard
          title="Total Estimated Amount"
          value={formatCurrency(financial.totalEstimate)}
          subtitle="Estimated repair value"
          icon={TrendingUp}
          color="blue"
          onClick={() => navigateTo('payments')}
        />

        <StatCard
          title="Total Amount Collected"
          value={formatCurrency(financial.totalPaid)}
          subtitle={`${financial.fullyPaidCount} jobs fully settled`}
          icon={DollarSign}
          color="emerald"
          onClick={() => navigateTo('payments')}
        />

        <StatCard
          title="Outstanding Payments"
          value={formatCurrency(financial.totalOutstanding)}
          subtitle={`${financial.partiallyPaidCount + financial.unpaidCount} unpaid/partial`}
          icon={AlertCircle}
          color="rose"
          onClick={() => navigateTo('payments')}
        />

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md shadow-blue-600/20">
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Quick Navigation
            </span>
            <h4 className="text-lg font-bold mt-1">Workshop Tasks</h4>
          </div>
          <div className="space-y-1.5 mt-3">
            <button
              onClick={() => navigateTo('pending')}
              className="w-full text-left text-xs font-semibold bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>View Pending Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
            </button>
            <button
              onClick={() => navigateTo('all-jobs')}
              className="w-full text-left text-xs font-semibold bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Status Breakdown & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusOverview customers={customers} />
        <RevenueOverview customers={customers} />
      </div>

      {/* Recent Jobs Table */}
      <RecentJobs jobs={customers} limit={7} />
    </div>
  );
}

