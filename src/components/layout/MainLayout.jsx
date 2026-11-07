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

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

