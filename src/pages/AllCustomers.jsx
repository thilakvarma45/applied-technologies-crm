import React, { useState, useMemo } from 'react';
import {
  Users,
  Download,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import CustomerFilters from '../components/customers/CustomerFilters';
import CustomerTable from '../components/customers/CustomerTable';
import EmptyState from '../components/common/EmptyState';
import { isWithinDateRange, parseDate } from '../utils/dateUtils';
import { parseAmount } from '../utils/paymentUtils';
import { useApp } from '../context/AppContext';

export default function AllCustomers({ defaultStatus = 'all' }) {
  const { customers, navigateTo } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [brandFilter, setBrandFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter & Sort Logic
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((item) => {
        // Global search (Name, Contact, Job ID, Problem)
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          const matchJobId = (item.jobId || '').toLowerCase().includes(q);
          const matchName = (item.name || '').toLowerCase().includes(q);
          const matchContact = (item.contact || '').toLowerCase().includes(q);
          const matchProblem = (item.problem || '').toLowerCase().includes(q);
          const matchDevice = (item.device || '').toLowerCase().includes(q);
          if (!matchJobId && !matchName && !matchContact && !matchProblem && !matchDevice) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'Pending') {
            // Include In Progress or Pending
            if (item.status !== 'Pending' && item.status !== 'In Progress') {
              return false;
            }
          } else if (
            (item.status || 'Pending').toLowerCase() !== statusFilter.toLowerCase()
          ) {
            return false;
          }
        }

        // Brand filter
        if (brandFilter !== 'all') {
          if ((item.device || '').toLowerCase() !== brandFilter.toLowerCase()) {
            return false;
          }
        }

        // Date range
        if (startDate || endDate) {
          if (!isWithinDateRange(item.date, startDate, endDate)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          const da = parseDate(a.date) || new Date(0);
          const db = parseDate(b.date) || new Date(0);
          return db - da;
        }
        if (sortBy === 'date-asc') {
          const da = parseDate(a.date) || new Date(0);
          const db = parseDate(b.date) || new Date(0);
          return da - db;
        }
        if (sortBy === 'estimate-desc') {
          return parseAmount(b.estimate) - parseAmount(a.estimate);
        }
        if (sortBy === 'estimate-asc') {
          return parseAmount(a.estimate) - parseAmount(b.estimate);
        }
        if (sortBy === 'paid-desc') {
          return parseAmount(b.paid) - parseAmount(a.paid);
        }
        if (sortBy === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });
  }, [customers, searchTerm, statusFilter, brandFilter, startDate, endDate, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBrandFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;
    const headers = [
      'DATE',
      'JOB ID',
      'NAME',
      'CONTACT',
      'DEVICE',
      'PROBLEM REPORT',
      'STATUS',
      'ESTIMATE',
      'PAID',
      'RETURNED',
      'BAG/ADP',
      'REMARKS',
      'ORDERS',
    ];

    const csvRows = [
      headers.join(','),
      ...filteredCustomers.map((c) =>
        [
          `"${c.date || ''}"`,
          `"${c.jobId || ''}"`,
          `"${c.name || ''}"`,
          `"${c.contact || ''}"`,
          `"${c.device || ''}"`,
          `"${(c.problem || '').replace(/"/g, '""')}"`,
          `"${c.status || ''}"`,
          `"${c.estimate || ''}"`,
          `"${c.paid || ''}"`,
          `"${c.returnedDate || ''}"`,
          `"${(c.bagAdp || '').replace(/"/g, '""')}"`,
          `"${(c.remarks || '').replace(/"/g, '""')}"`,
          `"${(c.orders || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `applied_technologies_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {defaultStatus === 'Pending'
              ? 'Pending Laptop Repairs'
              : defaultStatus === 'Completed'
              ? 'Completed Service Jobs'
              : 'All Customers & Repairs'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter, edit and track every repair job registered in the spreadsheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredCustomers.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigateTo('add-customer')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <CustomerFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Table or Empty State */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customer jobs match your filters"
          description={
            searchTerm || statusFilter !== 'all' || brandFilter !== 'all' || startDate || endDate
              ? 'Try clearing some filters or searching with a different term.'
              : 'There are currently no customer repair records. Click below to add your first job.'
          }
          actionLabel="Add New Customer"
          onAction={() => navigateTo('add-customer')}
        />
      ) : (
        <CustomerTable customers={filteredCustomers} />
      )}
    </div>
  );
}
