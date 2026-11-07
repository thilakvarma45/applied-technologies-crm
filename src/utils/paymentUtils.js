/**
 * Payment calculation and formatting utilities
 */

/**
 * Safely parse numeric amount, treating blank, empty, or non-numeric as 0
 */
export function parseAmount(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Calculate remaining balance: Estimated - Paid
 * Ensures balance is never negative (minimum 0)
 */
export function calculateBalance(estimate, paid) {
  const estNum = parseAmount(estimate);
  const paidNum = parseAmount(paid);
  if (estNum <= 0) return 0;
  const balance = estNum - paidNum;
  return balance > 0 ? balance : 0;
}

/**
 * Determine payment status badge
 * Returns 'Paid' | 'Partially Paid' | 'Unpaid'
 */
export function getPaymentStatus(estimate, paid) {
  const estNum = parseAmount(estimate);
  const paidNum = parseAmount(paid);

  if (estNum <= 0) {
    return paidNum > 0 ? 'Paid' : 'Unpaid';
  }

  if (paidNum >= estNum) {
    return 'Paid';
  }

  if (paidNum > 0 && paidNum < estNum) {
    return 'Partially Paid';
  }

  return 'Unpaid';
}

/**
 * Format currency into Indian Rupees (e.g. ₹ 2,500)
 */
export function formatCurrency(amount) {
  const num = parseAmount(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Calculate aggregated metrics from a list of customer jobs
 */
export function calculateFinancialMetrics(customers = []) {
  let totalEstimate = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let fullyPaidCount = 0;
  let partiallyPaidCount = 0;
  let unpaidCount = 0;

  customers.forEach((c) => {
    const est = parseAmount(c.estimate);
    const paid = parseAmount(c.paid);
    const balance = calculateBalance(est, paid);

    totalEstimate += est;
    totalPaid += paid;
    totalOutstanding += balance;

    const status = getPaymentStatus(est, paid);
    if (status === 'Paid') fullyPaidCount++;
    else if (status === 'Partially Paid') partiallyPaidCount++;
    else unpaidCount++;
  });

  return {
    totalEstimate,
    totalPaid,
    totalOutstanding,
    fullyPaidCount,
    partiallyPaidCount,
    unpaidCount,
  };
}

