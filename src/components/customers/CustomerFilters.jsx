import React from 'react';
import { Search, Filter, RotateCcw, Calendar, Laptop } from 'lucide-react';
import { STATUS_OPTIONS, DEVICE_BRANDS } from '../../config/googleSheets';

export default function CustomerFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  brandFilter,
  setBrandFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  onReset,
}) {
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'all' ||
    brandFilter !== 'all' ||
    startDate ||
    endDate ||
    sortBy !== 'date-desc';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Customer Name, Mobile Number, or Job ID (e.g. A26-502)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="relative">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">All Brands</option>
              {DEVICE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="estimate-desc">Estimate: High to Low</option>
              <option value="estimate-asc">Estimate: Low to High</option>
              <option value="paid-desc">Paid: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={!hasActiveFilters}
            className={`w-full flex items-center justify-center gap-1.5 text-xs py-2.5 px-3 rounded-xl border font-semibold transition-all ${
              hasActiveFilters
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Date Range Collapsible Filters */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="font-semibold flex items-center gap-1 text-slate-500">
          <Calendar className="w-3.5 h-3.5" /> Date Range:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}

