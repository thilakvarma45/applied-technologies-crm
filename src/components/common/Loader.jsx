import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...', size = 'default', overlay = false }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-slate-500">
      <Loader2 className={`${sizeClasses} animate-spin text-blue-600 mb-2`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-slate-100">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-base font-semibold text-slate-800">{message}</p>
          <p className="text-xs text-slate-400 mt-1">Please wait while operation completes...</p>
        </div>
      </div>
    );
  }

  return content;
}

