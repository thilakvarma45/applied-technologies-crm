import React from 'react';
import { FolderSearch, PlusCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel = 'Add New Customer',
  onAction,
  icon: Icon = FolderSearch,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm my-6">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

