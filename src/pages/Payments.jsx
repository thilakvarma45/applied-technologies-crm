import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
  User,
  Phone,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import PaymentBadge from '../components/common/PaymentBadge';
import StatusBadge from '../components/common/StatusBadge';
import {
  formatCurrency,
  calculateBalance,
  getPaymentStatus,
  calculateFinancialMetrics,
} from '../utils/paymentUtils';
import { useApp } from '../context/AppContext';

export default function Payments() {
  const { customers, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all' | 'Paid' | 'Partially Paid' | 'Unpaid'

  const metrics = calculateFinancialMetrics(customers);

  // Filter payment rows
  const filteredList = useMemo(() => {
    return customers.filter((c) => {
      const status = getPaymentStatus(c.estimate, c.paid);

      if (paymentStatusFilter !== 'all' && status !== paymentStatusFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchJobId = (c.jobId || '').toLowerCase().includes(q);
        const matchContact = (c.contact || '').toLowerCase().includes(q);
        if (!matchName && !matchJobId && !matchContact) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchTerm, paymentStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Payments &amp; Financial Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track workshop estimated billing, collected payments, and pending dues
        </p>
      </div>

      {/* Top 6 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Estimated Revenue"
          value={formatCurrency(metrics.totalEstimate)}
          subtitle="Total quoted for all jobs"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="Total Amount Collected"
          value={formatCurrency(metrics.totalPaid)}
          subtitle={`${Math.round(
            metrics.totalEstimate > 0 ? (metrics.totalPaid / metrics.totalEstimate) * 100 : 0
          )}% collection rate`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Total Outstanding Dues"
          value={formatCurrency(metrics.totalOutstanding)}
          subtitle="Pending customer collections"
          icon={AlertCircle}
          color="rose"
        />

        <div
          onClick={() => setPaymentStatusFilter('Paid')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-300 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fully Settled Jobs
            </span>
            <h4 className="text-xl font-bold text-emerald-700 mt-1">
              {metrics.fullyPaidCount} <span className="text-xs font-normal text-slate-400">jobs</span>
            </h4>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            100% Paid
          </span>
        </div>

        <div
          onClick={() => setPaymentStatusFilter('Partially Paid')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-amber-300 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Partially Paid (Advance)
            </span>
            <h4 className="text-xl font-bold text-amber-700 mt-1">
              {metrics.partiallyPaidCount} <span className="text-xs font-normal text-slate-400">jobs</span>
            </h4>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            Partial
          </span>
        </div>

        <div
          onClick={() => setPaymentStatusFilter('Unpaid')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-rose-300 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unpaid / Pending Bills
            </span>
            <h4 className="text-xl font-bold text-rose-700 mt-1">
              {metrics.unpaidCount} <span className="text-xs font-normal text-slate-400">jobs</span>
            </h4>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
            Unpaid
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, or Job ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'Paid', label: 'Fully Paid' },
            { id: 'Partially Paid', label: 'Partially Paid' },
            { id: 'Unpaid', label: 'Unpaid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPaymentStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                paymentStatusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Repair Status</th>
                <th className="py-3 px-4 text-right">Estimate</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((c) => {
                const balance = calculateBalance(c.estimate, c.paid);
                const pStatus = getPaymentStatus(c.estimate, c.paid);

                return (
                  <tr
                    key={c.jobId || c.rowNumber}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => navigateTo('details', c.jobId)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {c.jobId}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 capitalize">
                      {c.name}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.contact}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {c.estimate ? formatCurrency(c.estimate) : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {c.paid ? formatCurrency(c.paid) : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold">
                      {balance > 0 ? (
                        <span className="text-amber-700">{formatCurrency(balance)}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0 (Clear)</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <PaymentBadge statusOverride={pStatus} />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('details', c.jobId);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            No payment records found matching the current criteria.
          </div>
        )}
      </div>
    </div>
  );
}

