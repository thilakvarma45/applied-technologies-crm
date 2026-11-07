import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  CreditCard,
  Settings,
  Laptop,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { activePage, navigateTo, customers, isLiveGoogleSheet } = useApp();

  const pendingCount = customers.filter(
    (c) => c.status === 'Pending' || c.status === 'In Progress'
  ).length;

  const completedCount = customers.filter((c) => c.status === 'Completed').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'all-jobs',
      label: 'All Customers / Jobs',
      icon: Users,
      badge: customers.length,
    },
    {
      id: 'add-customer',
      label: 'Add New Customer',
      icon: UserPlus,
      highlight: true,
    },
    {
      id: 'pending',
      label: 'Pending Repairs',
      icon: Clock,
      badge: pendingCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'completed',
      label: 'Completed Jobs',
      icon: CheckCircle,
      badge: completedCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (id) => {
    navigateTo(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-800 truncate tracking-tight">
                  Applied Tech
                </h1>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  Laptop Service CRM
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle on Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Add Customer CTA */}
        {!isCollapsed && (
          <div className="p-3">
            <button
              onClick={() => handleNavClick('add-customer')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Job</span>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Connection Status Card */}
        <div className="p-3 border-t border-slate-100">
          {!isCollapsed ? (
            <div
              onClick={() => handleNavClick('settings')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                isLiveGoogleSheet
                  ? 'bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-50'
                  : 'bg-amber-50/60 border-amber-200/80 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLiveGoogleSheet ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold truncate ${
                      isLiveGoogleSheet ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                  >
                    {isLiveGoogleSheet ? 'Live Google Sheet' : 'Preview Mode'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {isLiveGoogleSheet ? 'Connected & Synced' : 'Click to connect live'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleNavClick('settings')}
              className="flex justify-center cursor-pointer p-2 text-slate-400 hover:text-slate-600"
              title={isLiveGoogleSheet ? 'Live Google Sheet Connected' : 'Preview Mode'}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isLiveGoogleSheet ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-500'
                }`}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

