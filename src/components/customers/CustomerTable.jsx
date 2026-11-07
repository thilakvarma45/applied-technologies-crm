import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Laptop,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PaymentBadge from '../common/PaymentBadge';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency, calculateBalance } from '../../utils/paymentUtils';
import { useApp } from '../../context/AppContext';

export default function CustomerTable({ customers = [] }) {
  const { navigateTo, deleteCustomer, isLoading } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Pagination calculation
  const totalRecords = customers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = customers.slice(startIndex, startIndex + pageSize);

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    try {
      await deleteCustomer(deletingRecord);
      setDeletingRecord(null);
    } catch (err) {
      // Error handled in AppContext
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Summary Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{customers.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800">
              {Math.min(startIndex + pageSize, totalRecords)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalRecords}</strong> records
          </span>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/60">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Job ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Device</th>
              <th className="py-3 px-4">Problem Report</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Estimate</th>
              <th className="py-3 px-4 text-right">Paid</th>
              <th className="py-3 px-4">Returned</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCustomers.map((c) => {
              const balance = calculateBalance(c.estimate, c.paid);

              return (
                <tr
                  key={c.jobId || c.rowNumber}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => navigateTo('details', c.jobId)}
                >
                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {c.date || '-'}
                    </span>
                  </td>

                  {/* Job ID */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-blue-600">
                    {c.jobId}
                  </td>

                  {/* Customer Name */}
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap capitalize">
                    {c.name || '-'}
                  </td>

                  {/* Contact Number */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {c.contact || '-'}
                    </span>
                  </td>

                  {/* Device */}
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700 capitalize">
                    <span className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      {c.device || '-'}
                    </span>
                  </td>

                  {/* Problem */}
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={c.problem}>
                    {c.problem || '-'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Estimate */}
                  <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-slate-800">
                    {c.estimate ? formatCurrency(c.estimate) : '-'}
                  </td>

                  {/* Paid */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-semibold text-emerald-700">
                      {c.paid ? formatCurrency(c.paid) : '-'}
                    </span>
                    {balance > 0 && (
                      <p className="text-[10px] text-amber-600 font-medium">
                        Due: {formatCurrency(balance)}
                      </p>
                    )}
                  </td>

                  {/* Returned Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                    {c.returnedDate ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {c.returnedDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">In Shop</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigateTo('details', c.jobId)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigateTo('edit', c)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingRecord(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Page <strong className="text-slate-800">{currentPage}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecord)}
        title="Delete Customer Record"
        message={`Are you sure you want to delete job ${deletingRecord?.jobId} (${deletingRecord?.name})? This action will clear the corresponding row in your Google Sheet.`}
        confirmText="Yes, Delete Record"
        isDestructive={true}
        isLoading={isLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  );
}

