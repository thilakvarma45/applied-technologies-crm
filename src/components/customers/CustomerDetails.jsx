import React, { useRef, useState } from 'react';
import {
  Calendar,
  Phone,
  MessageSquare,
  Laptop,
  CheckCircle,
  Clock,
  Printer,
  Edit2,
  ArrowLeft,
  Tag,
  Copy,
  AlertCircle,
  FileText,
  Package,
  DollarSign,
  Send,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PaymentBadge from '../common/PaymentBadge';
import {
  formatCurrency,
  calculateBalance,
  getPaymentStatus,
} from '../../utils/paymentUtils';
import { getTodayFormatted } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

export default function CustomerDetails({ customer, onBack }) {
  const { navigateTo, updateCustomer, showToast, isLoading } = useApp();
  const printRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Customer record not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const balance = calculateBalance(customer.estimate, customer.paid);
  const paymentStatus = getPaymentStatus(customer.estimate, customer.paid);

  const copyJobId = () => {
    navigator.clipboard.writeText(customer.jobId);
    showToast(`Copied ${customer.jobId} to clipboard!`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  // Quick Settle Balance
  const handleQuickSettleBalance = async () => {
    if (!customer.rowNumber) return;
    setIsUpdating(true);
    try {
      const fullAmount = customer.estimate || customer.paid || '0';
      await updateCustomer(customer.rowNumber, {
        ...customer,
        paid: String(fullAmount),
      });
      showToast(`Job ${customer.jobId} marked as fully paid!`, 'success');
    } catch (err) {
      // Handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (newStatus) => {
    if (!customer.rowNumber) return;
    setIsUpdating(true);
    try {
      const updates = {
        ...customer,
        status: newStatus,
      };
      if (newStatus === 'Completed' && !customer.returnedDate) {
        updates.returnedDate = getTodayFormatted();
      }
      await updateCustomer(customer.rowNumber, updates);
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      // Handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  const cleanPhone = String(customer.contact || '').replace(/[^0-9]/g, '');

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-xs w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Job Slip</span>
          </button>

          <button
            onClick={() => navigateTo('edit', customer)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/20"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Record</span>
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden printable-area"
      >
        {/* Banner with Job ID and Status */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400">
                {customer.jobId}
              </span>
              <button
                onClick={copyJobId}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Copy Job ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Received on: <strong>{customer.date || 'N/A'}</strong>
              {customer.rowNumber && (
                <span className="ml-2 text-slate-400">
                  (Sheet Row #{customer.rowNumber})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={customer.status} size="lg" />
            <PaymentBadge statusOverride={paymentStatus} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Quick Counter Action Bar */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-slate-800">Quick Repair Status:</span>
              <div className="flex flex-wrap gap-1">
                {['Pending', 'In Progress', 'Completed', 'G/S'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleQuickStatusChange(st)}
                    disabled={isUpdating || customer.status === st}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      customer.status === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {balance > 0 && (
              <button
                onClick={handleQuickSettleBalance}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Collect Balance ({formatCurrency(balance)})</span>
              </button>
            )}
          </div>

          {/* Customer & Device Quick Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer Details
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 capitalize">
                  {customer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Mobile: {customer.contact}
                </p>
              </div>

              {/* Direct Call / WhatsApp Links */}
              {cleanPhone && (
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Device Information */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Device Details
              </span>
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800 capitalize">
                  {customer.device || 'Laptop'}
                </h3>
              </div>
              <div className="text-xs text-slate-600">
                <p>
                  <strong>Accessories received:</strong>{' '}
                  <span className="text-slate-800 font-medium">
                    {customer.bagAdp || 'None specified'}
                  </span>
                </p>
                <p className="mt-1">
                  <strong>Delivery / Returned Date:</strong>{' '}
                  <span className="text-slate-800 font-medium">
                    {customer.returnedDate || 'In Shop (Pending collection)'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Problem Report & Diagnostics */}
          <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reported Issue / Work Description
            </span>
            <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
              {customer.problem || 'No description recorded.'}
            </p>
          </div>

          {/* Financial Breakdown Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Payment &amp; Billing Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Estimated Charge</span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  {customer.estimate ? formatCurrency(customer.estimate) : '₹ 0'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium">Amount Received</span>
                <p className="text-xl font-extrabold text-emerald-800 mt-1">
                  {customer.paid ? formatCurrency(customer.paid) : '₹ 0'}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  balance > 0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    balance > 0 ? 'text-amber-800' : 'text-slate-500'
                  }`}
                >
                  Remaining Balance
                </span>
                <p
                  className={`text-xl font-extrabold mt-1 ${
                    balance > 0 ? 'text-amber-900' : 'text-slate-700'
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
                {balance === 0 && (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ✓ Settled in Full
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Technician Remarks & Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Technician Remarks
              </span>
              <p className="text-xs text-slate-700 mt-1.5 whitespace-pre-wrap">
                {customer.remarks || 'No remarks added.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Parts Ordered / Spares
              </span>
              <p className="text-xs text-slate-700 mt-1.5 whitespace-pre-wrap">
                {customer.orders || 'No spares recorded.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

