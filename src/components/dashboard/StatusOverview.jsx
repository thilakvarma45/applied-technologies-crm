import React from 'react';
import { STATUS_OPTIONS } from '../../config/googleSheets';
import StatusBadge from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function StatusOverview({ customers = [] }) {
  const { navigateTo } = useApp();

  const total = customers.length || 1;

  const counts = STATUS_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = customers.filter(
      (c) => (c.status || 'Pending').toLowerCase() === opt.value.toLowerCase()
    ).length;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Repair Status Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribution across repair lifecycles</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {customers.length} total
        </span>
      </div>

      {/* Distribution progress bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-5">
        {STATUS_OPTIONS.map((opt) => {
          const count = counts[opt.value] || 0;
          if (count === 0) return null;
          const percentage = (count / total) * 100;

          const barColors = {
            orange: 'bg-amber-500',
            blue: 'bg-blue-500',
            green: 'bg-emerald-500',
            purple: 'bg-purple-500',
            red: 'bg-rose-500',
            gray: 'bg-slate-400',
          }[opt.color] || 'bg-slate-400';

          return (
            <div
              key={opt.value}
              style={{ width: `${percentage}%` }}
              className={`${barColors} transition-all duration-300`}
              title={`${opt.label}: ${count} (${percentage.toFixed(0)}%)`}
            />
          );
        })}
      </div>

      {/* Grid of status counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {STATUS_OPTIONS.map((opt) => {
          const count = counts[opt.value] || 0;
          const percentage = ((count / total) * 100).toFixed(0);

          return (
            <div
              key={opt.value}
              onClick={() => navigateTo('all-jobs')}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <StatusBadge status={opt.value} />
                <span className="text-[11px] font-semibold text-slate-400">
                  {percentage}%
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {count} <span className="text-xs font-normal text-slate-400">jobs</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

