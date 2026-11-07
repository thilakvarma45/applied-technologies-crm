/**
 * Google Sheets API v4 Service
 * Direct client-side interaction with the Google Sheets API using OAuth Bearer tokens.
 */

import { EXPECTED_HEADERS } from '../config/googleSheets';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Safely extract clean Spreadsheet ID from a string or full Google Sheets URL
 */
export function extractCleanSpreadsheetId(input) {
  if (!input) return '';
  let str = String(input).trim();
  const match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return match[1];
  }
  return str.replace(/\/edit.*$/, '').replace(/[?#].*$/, '').replace(/\/+$/, '').trim();
}

/**
 * Standardize status string to match CRM options
 */
export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'Pending';
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'completed') return 'Completed';
  if (s === 'in progress' || s === 'progress') return 'In Progress';
  if (s === 'buy back' || s === 'buyback') return 'Buy Back';
  if (s === 'canceled' || s === 'cancelled') return 'Cancelled';
  if (s === 'g/s' || s === 'gs' || s === 'general service') return 'G/S';
  if (s === 'pending') return 'Pending';
  return rawStatus;
}

/**
 * Convert a customer record object into an array of 13 column values [A..M]
 */
export function recordToRowValues(customer) {
  return [
    customer.date || '',
    customer.jobId || '',
    customer.name || '',
    customer.contact || '',
    customer.device || '',
    customer.problem || '',
    customer.status || 'Pending',
    customer.estimate !== undefined && customer.estimate !== null ? String(customer.estimate) : '',
    customer.paid !== undefined && customer.paid !== null ? String(customer.paid) : '',
    customer.returnedDate || '',
    customer.bagAdp || '',
    customer.remarks || '',
    customer.orders || '',
  ];
}

/**
 * Helper to find column index with support for header aliases and variations
 */
function findColIndex(headerIndexMap, aliases, defaultIdx) {
  if (!headerIndexMap) return defaultIdx;
  for (const alias of aliases) {
    const key = String(alias).trim().toUpperCase();
    if (headerIndexMap[key] !== undefined) {
      return headerIndexMap[key];
    }
    const cleanKey = key.replace(/[^A-Z0-9]/g, '');
    if (headerIndexMap[cleanKey] !== undefined) {
      return headerIndexMap[cleanKey];
    }
  }
  return defaultIdx;
}

/**
 * Map a raw spreadsheet row array to a clean customer object
 */
export function rowValuesToRecord(row, rowNumber, headerIndexMap = null) {
  const getCol = (idx) => (row && row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : '');

  // If header index mapping is available, use named headers with aliases
  if (headerIndexMap) {
    const dateIdx = findColIndex(headerIndexMap, ['DATE', 'SERVICE DATE'], 0);
    const jobIdIdx = findColIndex(headerIndexMap, ['JOB ID', 'JOBID', 'JOB_ID', 'ID'], 1);
    const nameIdx = findColIndex(headerIndexMap, ['NAME', 'CUSTOMER NAME', 'CUSTOMER'], 2);
    const contactIdx = findColIndex(headerIndexMap, ['CONTACT', 'MOBILE', 'PHONE', 'MOBILE NO', 'CONTACT NO'], 3);
    const deviceIdx = findColIndex(headerIndexMap, ['DEVICE', 'BRAND', 'MODEL', 'LAPTOP'], 4);
    const problemIdx = findColIndex(headerIndexMap, ['PROBLEM REPORT', 'PROBLEM', 'ISSUE', 'COMPLAINT'], 5);
    const statusIdx = findColIndex(headerIndexMap, ['STATUS', 'REPAIR STATUS'], 6);
    const estimateIdx = findColIndex(headerIndexMap, ['ESTIMATE', 'ESTIMATION', 'AMOUNT', 'COST'], 7);
    const paidIdx = findColIndex(headerIndexMap, ['PAID', 'AMOUNT PAID', 'ADVANCE', 'RECEIVED'], 8);
    const returnedIdx = findColIndex(headerIndexMap, ['RETURNED', 'RETURNED DATE', 'DELIVERED'], 9);
    const bagAdpIdx = findColIndex(headerIndexMap, ['BAG/ADP', 'BAG / ADP', 'BAG/ADAPTER', 'ACCESSORIES'], 10);
    const remarksIdx = findColIndex(headerIndexMap, ['REMARKS', 'REMARK', 'NOTES', 'NOTE'], 11);
    const ordersIdx = findColIndex(headerIndexMap, ['ORDERS', 'ORDER', 'PARTS', 'SPARES'], 12);

    return {
      rowNumber,
      date: getCol(dateIdx),
      jobId: getCol(jobIdIdx),
      name: getCol(nameIdx),
      contact: getCol(contactIdx),
      device: getCol(deviceIdx),
      problem: getCol(problemIdx),
      status: normalizeStatus(getCol(statusIdx)),
      rawStatus: getCol(statusIdx),
      estimate: getCol(estimateIdx),
      paid: getCol(paidIdx),
      returnedDate: getCol(returnedIdx),
      bagAdp: getCol(bagAdpIdx),
      remarks: getCol(remarksIdx),
      orders: getCol(ordersIdx),
    };
  }

  // Default standard column index fallback (A:0 .. M:12)
  return {
    rowNumber,
    date: getCol(0),
    jobId: getCol(1),
    name: getCol(2),
    contact: getCol(3),
    device: getCol(4),
    problem: getCol(5),
    status: normalizeStatus(getCol(6)),
    rawStatus: getCol(6),
    estimate: getCol(7),
    paid: getCol(8),
    returnedDate: getCol(9),
    bagAdp: getCol(10),
    remarks: getCol(11),
    orders: getCol(12),
  };
}

/**
 * Fetch records from public Google Sheet (Anyone with the link)
 */
export async function fetchPublicSheetData(spreadsheetId, sheetName = 'Sheet1') {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Spreadsheet ID is not configured');

  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(cleanId)}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to read spreadsheet (HTTP ${response.status})`);
  }

  const text = await response.text();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Invalid response from Google Sheets');
  }

  const jsonStr = text.substring(jsonStart, jsonEnd + 1);
  const data = JSON.parse(jsonStr);

  const cols = data.table?.cols || [];
  const rows = data.table?.rows || [];

  const headers = cols.map((c) => c.label || c.id || '');
  const headerIndexMap = {};
  headers.forEach((h, idx) => {
    if (h) {
      const upper = String(h).trim().toUpperCase();
      headerIndexMap[upper] = idx;
      headerIndexMap[upper.replace(/[^A-Z0-9]/g, '')] = idx;
    }
  });

  const records = rows.map((r, rowIndex) => {
    const cells = r.c || [];
    const getVal = (idx) => {
      if (!cells[idx]) return '';
      if (cells[idx].f !== undefined && cells[idx].f !== null) return String(cells[idx].f).trim();
      if (cells[idx].v !== undefined && cells[idx].v !== null) return String(cells[idx].v).trim();
      return '';
    };

    const rowArray = [
      getVal(0), getVal(1), getVal(2), getVal(3), getVal(4),
      getVal(5), getVal(6), getVal(7), getVal(8), getVal(9),
      getVal(10), getVal(11), getVal(12)
    ];

    return rowValuesToRecord(rowArray, rowIndex + 2, headerIndexMap);
  }).filter((rec) => rec.jobId || rec.name || rec.contact);

  return {
    headers,
    records,
    isEmpty: records.length === 0,
    headerIndexMap,
  };
}

/**
 * Fetch all records from the Google Sheet (via API v4 with fallback to public reader)
 */
export async function fetchSheetData(spreadsheetId, sheetName, accessToken) {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('Spreadsheet ID is not configured');
  }

  // If token is available, attempt official Google Sheets API v4
  if (accessToken) {
    try {
      const range = `${encodeURIComponent(sheetName)}!A1:M`;
      const url = `${BASE_URL}/${encodeURIComponent(cleanId)}/values/${range}?valueRenderOption=FORMATTED_VALUE`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rows = data.values || [];

        if (rows.length === 0) {
          return {
            headers: [],
            records: [],
            isEmpty: true,
            headerIndexMap: {},
          };
        }

        const headerRow = rows[0] || [];
        const headerIndexMap = {};
        headerRow.forEach((colName, index) => {
          if (colName) {
            const upper = String(colName).trim().toUpperCase();
            headerIndexMap[upper] = index;
            headerIndexMap[upper.replace(/[^A-Z0-9]/g, '')] = index;
          }
        });

        const records = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const hasData = row && row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
          if (hasData) {
            const record = rowValuesToRecord(row, i + 1, headerIndexMap);
            records.push(record);
          }
        }

        return {
          headers: headerRow,
          records,
          isEmpty: records.length === 0,
          headerIndexMap,
        };
      }
    } catch (apiErr) {
      console.warn('API v4 fetch failed, using direct reader:', apiErr);
    }
  }

  // Fallback to direct sheet reader (active for "Anyone with the link" sheets)
  return await fetchPublicSheetData(cleanId, sheetName);
}

/**
 * Append a new customer record to the sheet
 */
export async function appendCustomerToSheet(spreadsheetId, sheetName, customer, accessToken) {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Spreadsheet ID is missing');
  if (!accessToken) throw new Error('Access token is missing. Please sign in with Google.');

  const range = `${encodeURIComponent(sheetName)}!A:M`;
  const url = `${BASE_URL}/${encodeURIComponent(cleanId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rowValues = recordToRowValues(customer);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetName}!A:M`,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to append record (HTTP ${response.status})`);
  }

  return await response.json();
}

/**
 * Update a specific customer record row in the sheet
 */
export async function updateCustomerInSheet(spreadsheetId, sheetName, rowNumber, customer, accessToken) {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Spreadsheet ID is missing');
  if (!accessToken) throw new Error('Access token is missing');
  if (!rowNumber || rowNumber < 2) throw new Error('Invalid row number for update');

  const range = `${encodeURIComponent(sheetName)}!A${rowNumber}:M${rowNumber}`;
  const url = `${BASE_URL}/${encodeURIComponent(cleanId)}/values/${range}?valueInputOption=USER_ENTERED`;

  const rowValues = recordToRowValues(customer);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetName}!A${rowNumber}:M${rowNumber}`,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update record at row ${rowNumber} (HTTP ${response.status})`);
  }

  return await response.json();
}

/**
 * Clear a customer record row in the sheet (e.g. deletion)
 */
export async function clearCustomerRowInSheet(spreadsheetId, sheetName, rowNumber, accessToken) {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Spreadsheet ID is missing');
  if (!accessToken) throw new Error('Access token is missing');
  if (!rowNumber || rowNumber < 2) throw new Error('Invalid row number for deletion');

  const range = `${encodeURIComponent(sheetName)}!A${rowNumber}:M${rowNumber}`;
  const url = `${BASE_URL}/${encodeURIComponent(cleanId)}/values/${range}:clear`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to clear record at row ${rowNumber} (HTTP ${response.status})`);
  }

  return await response.json();
}

/**
 * Initialize headers in row 1 if spreadsheet is brand new
 */
export async function initializeSheetHeaders(spreadsheetId, sheetName, accessToken) {
  const cleanId = extractCleanSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Spreadsheet ID is missing');
  if (!accessToken) throw new Error('Access token is missing');

  const range = `${encodeURIComponent(sheetName)}!A1:M1`;
  const url = `${BASE_URL}/${encodeURIComponent(cleanId)}/values/${range}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetName}!A1:M1`,
      majorDimension: 'ROWS',
      values: [EXPECTED_HEADERS],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to initialize headers (HTTP ${response.status})`);
  }

  return await response.json();
}

/**
 * Test connectivity, retrieve spreadsheet metadata, and check headers
 */
export async function testSpreadsheetConnection(spreadsheetId, sheetName, accessToken) {
  try {
    const cleanId = extractCleanSpreadsheetId(spreadsheetId);
    if (!cleanId) {
      return { success: false, error: 'Spreadsheet ID is missing or empty' };
    }

    // 1. If access token available, test official API v4
    if (accessToken) {
      const metaUrl = `${BASE_URL}/${encodeURIComponent(cleanId)}?fields=properties.title,sheets.properties`;
      const metaRes = await fetch(metaUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (metaRes.ok) {
        const meta = await metaRes.json();
        const readResult = await fetchSheetData(spreadsheetId, sheetName, accessToken);
        const missingHeaders = EXPECTED_HEADERS.filter(
          (expected) => !readResult.headers.some((h) => String(h).trim().toUpperCase() === expected)
        );

        return {
          success: true,
          title: meta.properties?.title || 'Google Sheet',
          sheets: meta.sheets?.map((s) => s.properties?.title) || [],
          sheetExists: true,
          headers: readResult.headers,
          missingHeaders,
          recordCount: readResult.records.length,
        };
      }
    }

    // 2. Direct test via public sheet link reader
    const publicData = await fetchPublicSheetData(cleanId, sheetName);
    return {
      success: true,
      title: 'Google Sheet (Live)',
      sheets: [sheetName],
      sheetExists: true,
      headers: publicData.headers,
      missingHeaders: [],
      recordCount: publicData.records.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unable to connect to Google Sheet. Check Spreadsheet ID and sharing settings.',
    };
  }
}

