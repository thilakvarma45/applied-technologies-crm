/**
 * Date manipulation and formatting utilities for CRM
 * Handles conversion between Google Sheet DD/MM/YYYY format and HTML inputs (YYYY-MM-DD)
 */

/**
 * Returns today's date formatted as DD/MM/YYYY
 */
export function getTodayFormatted() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD for HTML5 date inputs
 */
export function getTodayInputFormat() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD (from <input type="date">) to DD/MM/YYYY (for sheet)
 */
export function toSheetDateFormat(inputDate) {
  if (!inputDate) return '';
  // If already in DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(inputDate)) {
    return inputDate;
  }
  const parts = inputDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return inputDate;
}

/**
 * Convert DD/MM/YYYY (from sheet) to YYYY-MM-DD (for <input type="date">)
 */
export function toInputDateFormat(sheetDate) {
  if (!sheetDate) return '';
  const parts = String(sheetDate).trim().split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(sheetDate)) {
    return sheetDate;
  }
  return '';
}

/**
 * Parse a DD/MM/YYYY or YYYY-MM-DD string to a Date object
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Check if a date string falls within a start and end range (YYYY-MM-DD)
 */
export function isWithinDateRange(dateStr, startDateInput, endDateInput) {
  if (!dateStr) return false;
  const target = parseDate(dateStr);
  if (!target) return false;

  target.setHours(0, 0, 0, 0);

  if (startDateInput) {
    const start = parseDate(startDateInput);
    if (start) {
      start.setHours(0, 0, 0, 0);
      if (target < start) return false;
    }
  }

  if (endDateInput) {
    const end = parseDate(endDateInput);
    if (end) {
      end.setHours(23, 59, 59, 999);
      if (target > end) return false;
    }
  }

  return true;
}

/**
 * Format relative time (e.g., "Today", "Yesterday", "3 days ago")
 */
export function formatFriendlyDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '-';
  const now = new Date();
  const diffTime = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  
  if (diffTime === 0) return 'Today';
  if (diffTime === 1) return 'Yesterday';
  if (diffTime > 1 && diffTime < 7) return `${diffTime} days ago`;
  
  return dateStr;
}

