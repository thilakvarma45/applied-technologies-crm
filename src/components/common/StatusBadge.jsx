import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || 'Pending').trim().toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-400';
  let displayLabel = status || 'Pending';

  if (normalized === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    displayLabel = 'Pending';
  } else if (normalized === 'in progress' || normalized === 'progress') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
    displayLabel = 'In Progress';
  } else if (normalized === 'completed') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    displayLabel = 'Completed';
  } else if (normalized === 'cancelled' || normalized === 'canceled') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
    displayLabel = 'Cancelled';
  } else if (normalized === 'buy back' || normalized === 'buyback') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
    displayLabel = 'Buy Back';
  } else if (normalized === 'g/s' || normalized === 'gs' || normalized === 'general service') {
    styles = 'bg-slate-100 text-slate-700 border-slate-300';
    dotColor = 'bg-slate-500';
    displayLabel = 'G/S';
  }

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-xs font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${styles} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
}

