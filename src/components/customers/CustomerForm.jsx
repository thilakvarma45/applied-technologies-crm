import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  User,
  Phone,
  Laptop,
  AlertTriangle,
  Calendar,
  CreditCard,
  FileText,
  Tag,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  STATUS_OPTIONS,
  DEVICE_BRANDS,
  PAYMENT_METHODS,
} from '../../config/googleSheets';
import { generateNextJobId } from '../../utils/jobIdGenerator';
import {
  getTodayInputFormat,
  toSheetDateFormat,
  toInputDateFormat,
} from '../../utils/dateUtils';
import { validateCustomerForm } from '../../utils/validators';
import ConfirmDialog from '../common/ConfirmDialog';
import { useApp } from '../../context/AppContext';

export default function CustomerForm({ initialData = null, isEditMode = false, onComplete }) {
  const { customers, addCustomer, updateCustomer, isLoading, navigateTo } = useApp();

  // Initial Form State
  const getInitialForm = () => {
    if (initialData && isEditMode) {
      return {
        date: toInputDateFormat(initialData.date) || getTodayInputFormat(),
        jobId: initialData.jobId || '',
        name: initialData.name || '',
        contact: initialData.contact || '',
        device: initialData.device || 'HP',
        customDevice: '',
        problem: initialData.problem || '',
        status: initialData.status || 'Pending',
        estimate: initialData.estimate || '',
        paid: initialData.paid || '',
        returnedDate: toInputDateFormat(initialData.returnedDate) || '',
        bagAdp: initialData.bagAdp || '',
        paymentMethod: 'Cash',
        remarks: initialData.remarks || '',
        orders: initialData.orders || '',
      };
    }

    return {
      date: getTodayInputFormat(),
      jobId: generateNextJobId(customers),
      name: '',
      contact: '',
      device: 'HP',
      customDevice: '',
      problem: '',
      status: 'Pending',
      estimate: '',
      paid: '',
      returnedDate: '',
      bagAdp: '',
      hasBag: false,
      hasAdp: false,
      paymentMethod: 'Cash',
      remarks: '',
      orders: '',
    };
  };

  const [formData, setFormData] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Job ID generation when customers array updates (only for new entries)
  useEffect(() => {
    if (!isEditMode && !formData.name) {
      setFormData((prev) => ({
        ...prev,
        jobId: generateNextJobId(customers),
      }));
    }
  }, [customers, isEditMode]);

  // Handle changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear inline error on edit
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Quick accessory toggles
  const handleAccessoryToggle = (type) => {
    setFormData((prev) => {
      let current = prev.bagAdp ? prev.bagAdp.split(',').map((s) => s.trim()).filter(Boolean) : [];
      if (current.includes(type)) {
        current = current.filter((item) => item !== type);
      } else {
        current.push(type);
      }
      return {
        ...prev,
        bagAdp: current.join(', '),
      };
    });
  };

  // Form Submission Validation
  const handleSubmitClick = (e) => {
    e.preventDefault();
    const validation = validateCustomerForm(formData, customers, initialData?.rowNumber);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setShowConfirm(true);
  };

  // Final Confirmed Submission
  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    try {
      const finalDevice =
        formData.device === 'Other' && formData.customDevice.trim()
          ? formData.customDevice.trim()
          : formData.device;

      const recordToSave = {
        date: toSheetDateFormat(formData.date),
        jobId: formData.jobId.trim().toUpperCase(),
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        device: finalDevice,
        problem: formData.problem.trim(),
        status: formData.status,
        estimate: formData.estimate !== '' ? String(formData.estimate).trim() : '',
        paid: formData.paid !== '' ? String(formData.paid).trim() : '',
        returnedDate: toSheetDateFormat(formData.returnedDate),
        bagAdp: formData.bagAdp.trim(),
        remarks: formData.remarks.trim(),
        orders: formData.orders.trim(),
      };

      if (isEditMode && initialData?.rowNumber) {
        await updateCustomer(initialData.rowNumber, recordToSave);
      } else {
        await addCustomer(recordToSave);
        // Reset form for new customer
        setFormData({
          date: getTodayInputFormat(),
          jobId: generateNextJobId(customers),
          name: '',
          contact: '',
          device: 'HP',
          customDevice: '',
          problem: '',
          status: 'Pending',
          estimate: '',
          paid: '',
          returnedDate: '',
          bagAdp: '',
          paymentMethod: 'Cash',
          remarks: '',
          orders: '',
        });
      }

      if (onComplete) {
        onComplete();
      } else {
        navigateTo('all-jobs');
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(getInitialForm());
    setErrors({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            {isEditMode ? 'Modify Job Entry' : 'New Service Admission'}
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
            {isEditMode ? `Edit Job #${formData.jobId}` : 'Register Customer Laptop'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode
              ? 'Update job details, diagnostic findings, and payment records.'
              : 'Fill in customer details. Data syncs instantly to your Google Sheet.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            Reset Form
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitClick} className="p-6 sm:p-8 space-y-8">
        {/* Section 1: Customer Information */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Customer &amp; Job Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Job ID (Auto-generated) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job ID <span className="text-xs text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="text"
                  name="jobId"
                  value={formData.jobId}
                  readOnly={isEditMode}
                  onChange={handleChange}
                  placeholder="e.g. A26-503"
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border ${
                    isEditMode
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-blue-50/50 text-blue-700 border-blue-200'
                  }`}
                />
              </div>
              {errors.jobId && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.jobId}</p>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Naveen Kumar"
                required
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="10-digit Mobile (e.g. 9963731679)"
                  required
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    errors.contact ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.contact && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.contact}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Device Information */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Laptop className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Device &amp; Problem Details
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Device Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Device Brand
              </label>
              <select
                name="device"
                value={formData.device}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {DEVICE_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              {formData.device === 'Other' && (
                <input
                  type="text"
                  name="customDevice"
                  value={formData.customDevice}
                  onChange={handleChange}
                  placeholder="Specify Brand / Model"
                  className="mt-2 w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              )}
            </div>

            {/* Problem Report */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Problem Report / Customer Complaint
              </label>
              <textarea
                name="problem"
                rows={2}
                value={formData.problem}
                onChange={handleChange}
                placeholder="e.g. Booting issue, No Power (N/P), Screen flicker, Keyboard keys not working, OS corrupt..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Repair & Financial Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              3. Repair Status &amp; Financials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Repair Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                name="estimate"
                value={formData.estimate}
                onChange={handleChange}
                placeholder="e.g. 2500"
                min="0"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {errors.estimate && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.estimate}</p>
              )}
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount Paid (₹)
              </label>
              <input
                type="number"
                name="paid"
                value={formData.paid}
                onChange={handleChange}
                placeholder="e.g. 2500 or 500 advance"
                min="0"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {errors.paid && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.paid}</p>
              )}
            </div>

            {/* Returned Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Returned Date <span className="text-xs text-slate-400 font-normal">(if delivered)</span>
              </label>
              <input
                type="date"
                name="returnedDate"
                value={formData.returnedDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Accessories & Additional Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <PackageCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              4. Accessories, Remarks &amp; Orders
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Bag / Adapter column (Col K in Sheet) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bag / Adapter (Accessories Received)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['Bag', 'Charger', 'Adp', 'Power Cord', 'ph.pay', 'cash'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAccessoryToggle(tag)}
                    className={`px-2 py-1 text-[11px] rounded-lg border font-medium transition-colors ${
                      formData.bagAdp.includes(tag)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="bagAdp"
                value={formData.bagAdp}
                onChange={handleChange}
                placeholder="e.g. Bag + Charger or cash"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Remarks (Col L in Sheet) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Remarks / Technician Notes
              </label>
              <textarea
                name="remarks"
                rows={2}
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. DC pin replaced, warranty 3 months, advance paid 500"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Orders (Col M in Sheet) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parts Ordered / Required
              </label>
              <textarea
                name="orders"
                rows={2}
                value={formData.orders}
                onChange={handleChange}
                placeholder="e.g. Crucial 256GB NVMe SSD, HP Battery 3-cell"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigateTo('all-jobs')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Google Sheet...' : isEditMode ? 'Update Record' : 'Save Customer & Sync'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={isEditMode ? 'Confirm Changes' : 'Confirm Customer Admission'}
        message={`Save job ${formData.jobId} for "${formData.name}" with estimate of ₹${formData.estimate || 0}? Changes will be synchronized directly to your Google Sheet.`}
        confirmText={isEditMode ? 'Yes, Update' : 'Yes, Save Customer'}
        isLoading={isSubmitting}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

