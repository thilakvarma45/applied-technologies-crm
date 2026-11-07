import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { message, type = 'success' } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      title: 'Success',
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
      title: 'Error',
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
      title: 'Notice',
    },
  }[type] || {
    bg: 'bg-slate-50 border-slate-300 text-slate-900',
    icon: <Info className="w-5 h-5 text-slate-600 flex-shrink-0" />,
    title: 'Notification',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${typeConfig.bg}`}
      >
        {typeConfig.icon}
        <div className="flex-1 text-sm">
          <p className="font-semibold">{typeConfig.title}</p>
          <p className="mt-0.5 text-xs sm:text-sm opacity-90 break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

