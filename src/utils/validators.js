/**
 * Form and data validators
 */

/**
 * Validates Indian Mobile Numbers
 * Accepts 10 digits starting with 6, 7, 8, or 9, or with +91 / 0 prefix.
 */
export function validateIndianMobile(contact) {
  if (!contact) return false;
  const cleaned = String(contact).replace(/[\s\-\(\)]/g, '');
  // Matches +919876543210, 919876543210, 09876543210, or 9876543210
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Clean and normalize phone number to standard 10 digits if possible
 */
export function normalizePhoneNumber(contact) {
  if (!contact) return '';
  const cleaned = String(contact).replace(/[\s\-\(\)]/g, '');
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  const match = cleaned.match(/(?:(?:\+91|91|0))?([6-9]\d{9})$/);
  return match ? match[1] : cleaned;
}

/**
 * Validates customer form data
 * Returns an object with errors: { name?: string, contact?: string, estimate?: string, paid?: string }
 */
export function validateCustomerForm(formData, existingCustomers = [], currentRecordRow = null) {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Customer name is required';
  }

  if (!formData.contact || !formData.contact.trim()) {
    errors.contact = 'Contact number is required';
  } else if (!validateIndianMobile(formData.contact)) {
    errors.contact = 'Please enter a valid 10-digit Indian mobile number (e.g., 9963731679)';
  }

  if (!formData.jobId || !formData.jobId.trim()) {
    errors.jobId = 'Job ID is required';
  }

  if (formData.estimate !== '' && formData.estimate !== null && formData.estimate !== undefined) {
    const est = Number(formData.estimate);
    if (isNaN(est) || est < 0) {
      errors.estimate = 'Estimate must be a valid non-negative number';
    }
  }

  if (formData.paid !== '' && formData.paid !== null && formData.paid !== undefined) {
    const p = Number(formData.paid);
    if (isNaN(p) || p < 0) {
      errors.paid = 'Paid amount must be a valid non-negative number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

