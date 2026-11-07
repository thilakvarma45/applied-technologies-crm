/**
 * Job ID Generator utility
 * Generates Job IDs following the shop pattern: A<YY>-<NNN> (e.g. A26-503)
 * Automatically finds the maximum sequence number for the current year.
 */

/**
 * Extract numeric sequence from a Job ID for a given year prefix
 * Example: 'A26-502' -> 502
 */
export function parseJobId(jobIdStr) {
  if (!jobIdStr) return null;
  const cleaned = String(jobIdStr).trim().toUpperCase();
  // Match patterns like A26-502 or A26-005
  const match = cleaned.match(/^A(\d{2})-(\d+)$/);
  if (match) {
    return {
      prefix: 'A',
      year: match[1],
      seq: parseInt(match[2], 10),
    };
  }
  return null;
}

/**
 * Generate next available Job ID based on existing customer records
 * @param {Array} existingCustomers - List of customer objects with jobId
 * @param {Date} [currentDate] - Optional override for date
 * @returns {string} Next available Job ID (e.g., 'A26-503')
 */
export function generateNextJobId(existingCustomers = [], currentDate = new Date()) {
  const fullYear = currentDate.getFullYear();
  const yearTwoDigits = String(fullYear).slice(-2); // e.g. '26'
  const expectedPrefix = `A${yearTwoDigits}-`;

  let maxSeq = 0;

  if (Array.isArray(existingCustomers)) {
    for (const item of existingCustomers) {
      const jId = item?.jobId;
      if (!jId) continue;
      const parsed = parseJobId(jId);
      if (parsed && parsed.year === yearTwoDigits) {
        if (parsed.seq > maxSeq) {
          maxSeq = parsed.seq;
        }
      }
    }
  }

  // If no records exist for this year, start at 101 or 1 (if maxSeq is 0, default to 101 or 501 based on shop convention)
  // Since the shop has 502 in the screenshot, if maxSeq is 0, start at 101 or 501.
  const nextSeq = maxSeq > 0 ? maxSeq + 1 : 101;
  
  // Format with at least 3 digits if sequence < 1000
  const formattedSeq = nextSeq < 1000 ? String(nextSeq).padStart(3, '0') : String(nextSeq);
  return `${expectedPrefix}${formattedSeq}`;
}

/**
 * Check if a Job ID is already present in the list
 */
export function isJobIdDuplicate(jobId, existingCustomers = [], currentRecordId = null) {
  if (!jobId) return false;
  const normalized = String(jobId).trim().toUpperCase();
  return existingCustomers.some((item) => {
    if (!item?.jobId) return false;
    // Don't flag duplicate against the record itself during edit
    if (currentRecordId && item.rowNumber === currentRecordId) return false;
    return String(item.jobId).trim().toUpperCase() === normalized;
  });
}

