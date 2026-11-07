import React from 'react';
import { getPaymentStatus } from '../../utils/paymentUtils';

export default function PaymentBadge({ estimate, paid, statusOverride }) {
  const status = statusOverride || getPaymentStatus(estimate, paid);

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (status === 'Paid') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === 'Partially Paid') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'Unpaid') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${styles}`}
    >
      {status}
    </span>
  );
}

