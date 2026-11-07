import React from 'react';
import { ArrowUpRight, Laptop, Calendar } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/paymentUtils';
import { useApp } from '../../context/AppContext';

export default function RecentJobs({ jobs = [], limit = 6 }) {
  const { navigateTo } = useApp();

  const recentList = [...jobs].slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Service Entries</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest customer repairs booked</p>
        </div>
        <button
          onClick={() => navigateTo('all-jobs')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          View all jobs <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          No recent jobs to display.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device &amp; Issue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Estimate</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentList.map((job, idx) => (
                <tr
                  key={job.jobId || idx}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => navigateTo('details', job.jobId)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    {job.jobId}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {job.date || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{job.name}</p>
                    <p className="text-[11px] text-slate-400">{job.contact}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Laptop className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="capitalize">{job.device || 'Laptop'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">
                      {job.problem || '-'}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">
                    {job.estimate ? formatCurrency(job.estimate) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('details', job.jobId);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

