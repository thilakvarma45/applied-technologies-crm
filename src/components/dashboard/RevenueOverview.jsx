import React from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, calculateFinancialMetrics } from '../../utils/paymentUtils';
import { useApp } from '../../context/AppContext';

export default function RevenueOverview({ customers = [] }) {
  const { navigateTo } = useApp();
  const metrics = calculateFinancialMetrics(customers);

  const collectionRate =
    metrics.totalEstimate > 0
      ? Math.min(100, Math.round((metrics.totalPaid / metrics.totalEstimate) * 100))
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Revenue &amp; Payments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Service charges and balance tracking</p>
          </div>
          <button
            onClick={() => navigateTo('payments')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            Payments ledger <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collection progress */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-600">Collection Rate</span>
            <span className="text-blue-600 font-bold">{collectionRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Collected</span>
            </div>
            <p className="text-lg font-bold text-emerald-900 tracking-tight">
              {formatCurrency(metrics.totalPaid)}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              {metrics.fullyPaidCount} fully settled
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Outstanding</span>
            </div>
            <p className="text-lg font-bold text-amber-900 tracking-tight">
              {formatCurrency(metrics.totalOutstanding)}
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              {metrics.partiallyPaidCount + metrics.unpaidCount} pending payment
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total Estimated Work:</span>
        <span className="font-bold text-slate-800">{formatCurrency(metrics.totalEstimate)}</span>
      </div>
    </div>
  );
}

