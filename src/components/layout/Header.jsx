import React from 'react';
import {
  Menu,
  RefreshCw,
  FileSpreadsheet,
  LogIn,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header({ setIsMobileOpen }) {
  const {
    activePage,
    navigateTo,
    refreshData,
    isSyncing,
    lastSyncTime,
    isLiveGoogleSheet,
    auth,
  } = useApp();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'all-jobs':
        return 'All Customers & Jobs';
      case 'add-customer':
        return 'Register New Job';
      case 'pending':
        return 'Pending Repairs';
      case 'completed':
        return 'Completed Repairs';
      case 'payments':
        return 'Financial & Payments';
      case 'settings':
        return 'Spreadsheet & Google Settings';
      case 'details':
        return 'Job Details';
      default:
        return 'Laptop Repair CRM';
    }
  };

  const formatSyncTime = (date) => {
    if (!date) return 'Not yet synced';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Applied Technologies</span>
            <span>•</span>
            <span>2026 Log</span>
          </div>
        </div>
      </div>

      {/* Right: Sync Status, Manual Refresh, Quick Action, Google Connection */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync Info (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isSyncing ? (
              <span className="text-blue-600 font-medium">Syncing with Sheet...</span>
            ) : lastSyncTime ? (
              <span>Synced {formatSyncTime(lastSyncTime)}</span>
            ) : (
              <span>Preview mode</span>
            )}
          </span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refreshData()}
          disabled={isSyncing}
          className={`p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 ${
            isSyncing ? 'animate-spin text-blue-600' : ''
          }`}
          title="Refresh spreadsheet data"
          aria-label="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Live / Preview indicator pill */}
        {isLiveGoogleSheet ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Sheet Active</span>
          </div>
        ) : (
          <button
            onClick={() => navigateTo('settings')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Connect Live Sheet</span>
          </button>
        )}

        {/* Quick Add Button */}
        {activePage !== 'add-customer' && (
          <button
            onClick={() => navigateTo('add-customer')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Job</span>
          </button>
        )}
      </div>
    </header>
  );
}

