import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import { useApp } from '../../context/AppContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function MainLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toast, closeToast, isLiveGoogleSheet, navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header setIsMobileOpen={setIsMobileOpen} />

        {/* Demo Mode Notice Banner */}
        {!isLiveGoogleSheet && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Preview Mode:</strong> Currently viewing shop log records. Connect your Google Account &amp; Spreadsheet ID in Settings to enable live two-way synchronization.
              </span>
            </div>
            <button
              onClick={() => navigateTo('settings')}
              className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 underline-offset-2 flex-shrink-0"
            >
              Configure Now <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

